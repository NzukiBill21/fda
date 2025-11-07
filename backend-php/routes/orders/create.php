<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/Response.php';
require_once __DIR__ . '/../../utils/Request.php';
require_once __DIR__ . '/../../services/AuthService.php';

try {
    $body = Request::getBody();
    $userId = $body['userId'] ?? null;
    $items = $body['items'] ?? null;
    $deliveryAddress = $body['deliveryAddress'] ?? null;
    $deliveryNotes = $body['deliveryNotes'] ?? null;
    $customerName = $body['customerName'] ?? null;
    $customerPhone = $body['customerPhone'] ?? null;
    $deliveryLatitude = $body['deliveryLatitude'] ?? null;
    $deliveryLongitude = $body['deliveryLongitude'] ?? null;
    $estimatedDeliveryTime = $body['estimatedDeliveryTime'] ?? 30;
    
    if (!$userId || !$items || !is_array($items) || empty($items) || !$deliveryAddress || !$customerName || !$customerPhone) {
        Response::error('Missing required fields: userId, items (non-empty array), deliveryAddress, customerName, customerPhone', 400);
    }
    
    $db = Database::getInstance()->getConnection();
    $authService = new AuthService();
    
    // Verify user exists - try by ID first, then by email
    $userStmt = $db->prepare("SELECT id FROM users WHERE id = ? OR email = ?");
    $userStmt->execute([$userId, $userId]);
    $user = $userStmt->fetch();
    
    if (!$user) {
        // Create guest user if doesn't exist
        $guestEmail = strpos($userId, '@') !== false ? $userId : "{$userId}@monda.com";
        
        // Get or create CUSTOMER role
        $roleStmt = $db->prepare("SELECT id FROM roles WHERE name = 'CUSTOMER'");
        $roleStmt->execute();
        $customerRole = $roleStmt->fetch();
        
        if (!$customerRole) {
            $roleId = $authService->generateUUID();
            $createRoleStmt = $db->prepare("INSERT INTO roles (id, name, description) VALUES (?, 'CUSTOMER', 'Regular customer role')");
            $createRoleStmt->execute([$roleId]);
            $customerRole = ['id' => $roleId];
        }
        
        $userIdNew = $authService->generateUUID();
        $createUserStmt = $db->prepare("
            INSERT INTO users (id, email, password, name, phone)
            VALUES (?, ?, ?, ?, ?)
        ");
        $createUserStmt->execute([
            $userIdNew,
            $guestEmail,
            password_hash('guest123', PASSWORD_DEFAULT),
            explode('@', $guestEmail)[0],
            null
        ]);
        
        // Assign CUSTOMER role
        $userRoleId = $authService->generateUUID();
        $assignRoleStmt = $db->prepare("INSERT INTO user_roles (id, userId, roleId) VALUES (?, ?, ?)");
        $assignRoleStmt->execute([$userRoleId, $userIdNew, $customerRole['id']]);
        
        $user = ['id' => $userIdNew];
    }
    
    // Generate unique order number
    $orderNumber = 'ORD-' . time() . '-' . strtoupper(substr(md5(uniqid()), 0, 9));
    
    // Calculate total from actual cart item prices
    $total = 0;
    $orderItems = [];
    
    foreach ($items as $item) {
        $menuItemId = $item['menuItemId'] ?? $item['id'] ?? null;
        if (!$menuItemId) {
            continue; // Skip invalid items
        }
        
        // Fetch menu item
        $menuStmt = $db->prepare("SELECT * FROM menu_items WHERE id = ?");
        $menuStmt->execute([$menuItemId]);
        $menuItem = $menuStmt->fetch();
        
        if (!$menuItem) {
            Response::error("Menu item {$menuItemId} not found", 400);
        }
        
        if (!$menuItem['isAvailable']) {
            Response::error("Menu item {$menuItem['name']} is not available", 400);
        }
        
        $itemPrice = (float)$menuItem['price'];
        $itemQuantity = (int)($item['quantity'] ?? 1);
        $itemTotal = $itemPrice * $itemQuantity;
        $total += $itemTotal;
        
        $orderItems[] = [
            'menuItemId' => $menuItemId,
            'quantity' => $itemQuantity,
            'price' => $itemPrice
        ];
    }
    
    if (empty($orderItems)) {
        Response::error('No valid items found in order', 400);
    }
    
    // Add delivery fee and tax
    $deliveryFee = $total > 5000 ? 0 : 200; // Free delivery over KES 5,000
    $tax = $total * 0.16; // 16% VAT
    $finalTotal = $total + $deliveryFee + $tax;
    
    // Create order
    $orderId = $authService->generateUUID();
    $orderStmt = $db->prepare("
        INSERT INTO orders (
            id, orderNumber, userId, status, total, paymentMethod,
            deliveryAddress, deliveryNotes, customerName, customerPhone,
            deliveryLatitude, deliveryLongitude, estimatedDeliveryTime
        ) VALUES (?, ?, ?, 'PENDING', ?, 'CASH', ?, ?, ?, ?, ?, ?, ?)
    ");
    $orderStmt->execute([
        $orderId,
        $orderNumber,
        $user['id'],
        $finalTotal,
        $deliveryAddress,
        $deliveryNotes,
        $customerName,
        $customerPhone,
        $deliveryLatitude,
        $deliveryLongitude,
        $estimatedDeliveryTime
    ]);
    
    // Create order items
    foreach ($orderItems as $orderItem) {
        $orderItemId = $authService->generateUUID();
        $itemStmt = $db->prepare("
            INSERT INTO order_items (id, orderId, menuItemId, quantity, price)
            VALUES (?, ?, ?, ?, ?)
        ");
        $itemStmt->execute([
            $orderItemId,
            $orderId,
            $orderItem['menuItemId'],
            $orderItem['quantity'],
            $orderItem['price']
        ]);
    }
    
    // Create initial tracking entry
    $trackingId = $authService->generateUUID();
    $trackingStmt = $db->prepare("
        INSERT INTO order_tracking (id, orderId, status, notes)
        VALUES (?, ?, 'PENDING', 'Order placed successfully')
    ");
    $trackingStmt->execute([$trackingId, $orderId]);
    
    // Log activity
    $logId = $authService->generateUUID();
    $logStmt = $db->prepare("
        INSERT INTO activity_logs (id, userId, action, entity, details, ipAddress, userAgent)
        VALUES (?, ?, 'ORDER_CREATED', 'Order', ?, ?, ?)
    ");
    $logStmt->execute([
        $logId,
        $user['id'],
        "Order {$orderNumber} created with " . count($items) . " items, total: KES {$finalTotal}",
        $_SERVER['REMOTE_ADDR'] ?? null,
        $_SERVER['HTTP_USER_AGENT'] ?? null
    ]);
    
    // Fetch complete order with items
    $fetchStmt = $db->prepare("
        SELECT o.*, u.id as userId, u.name as userName, u.email as userEmail, u.phone as userPhone
        FROM orders o
        LEFT JOIN users u ON o.userId = u.id
        WHERE o.id = ?
    ");
    $fetchStmt->execute([$orderId]);
    $order = $fetchStmt->fetch();
    
    // Fetch order items with menu items
    $itemsStmt = $db->prepare("
        SELECT oi.*, mi.name as menuItemName, mi.description as menuItemDescription, mi.image as menuItemImage
        FROM order_items oi
        LEFT JOIN menu_items mi ON oi.menuItemId = mi.id
        WHERE oi.orderId = ?
    ");
    $itemsStmt->execute([$orderId]);
    $order['items'] = $itemsStmt->fetchAll();
    
    Response::json([
        'success' => true,
        'message' => 'Order created successfully',
        'order' => $order
    ], 201);
} catch (Exception $e) {
    error_log('Order creation error: ' . $e->getMessage());
    Response::error($e->getMessage(), 500);
}

