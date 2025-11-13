<?php
/**
 * Create Order Endpoint
 * Replicates Node.js /api/orders POST logic with all validations
 */

$data = json_decode(file_get_contents('php://input'), true);

// Validate items - EXACT same logic as Node.js
if (empty($data['items']) || !is_array($data['items']) || count($data['items']) === 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Order items are required']);
    exit;
}

// Validate required fields - EXACT field names from database schema
if (empty($data['deliveryAddress']) || empty($data['customerName']) || empty($data['customerPhone'])) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Delivery address, customer name, and phone are required',
        'missing' => [
            'deliveryAddress' => empty($data['deliveryAddress']),
            'customerName' => empty($data['customerName']),
            'customerPhone' => empty($data['customerPhone'])
        ]
    ]);
    exit;
}

// Calculate total - same logic as Node.js
$total = 0;
$orderItems = [];

foreach ($data['items'] as $item) {
    if (empty($item['menuItemId']) || empty($item['quantity']) || $item['quantity'] <= 0) {
        continue; // Skip invalid items
    }
    
    // Get menu item price
    $menuItem = DatabaseService::getMenuItemById($item['menuItemId']);
    if (!$menuItem) {
        http_response_code(400);
        echo json_encode(['error' => "Menu item {$item['menuItemId']} not found"]);
        exit;
    }
    
    $itemPrice = $menuItem['price'] ?? ($item['price'] ?? 0);
    $quantity = intval($item['quantity']);
    $subtotal = $itemPrice * $quantity;
    
    $total += $subtotal;
    
    $orderItems[] = [
        'menuItemId' => $item['menuItemId'],
        'quantity' => $quantity,
        'price' => $itemPrice
    ];
}

if ($total <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Order total must be greater than 0']);
    exit;
}

// Handle userId - same guest user logic as Node.js
$userId = $data['userId'] ?? null;
if (empty($userId) || strpos($userId, 'guest_') === 0 || strpos($userId, 'user_') === 0) {
    // Find or create guest user
    $guestEmail = 'guest_' . preg_replace('/[^0-9]/', '', $data['customerPhone']) . '@mondas.com';
    $guestUser = DatabaseService::getUserByEmail($guestEmail);
    
    if (!$guestUser) {
        // Create guest user
        $guestId = bin2hex(random_bytes(16));
        $sql = "INSERT INTO users (id, email, name, phone, createdAt, updatedAt, isActive)
                VALUES (?, ?, ?, ?, NOW(), NOW(), 1)";
        Database::query($sql, [$guestId, $guestEmail, $data['customerName'], $data['customerPhone']]);
        $userId = $guestId;
    } else {
        $userId = $guestUser['id'];
    }
}

// Create order data - EXACT same structure as Node.js
$orderData = [
    'userId' => $userId,
    'deliveryAddress' => $data['deliveryAddress'],
    'customerName' => $data['customerName'],
    'customerPhone' => $data['customerPhone'],
    'deliveryNotes' => $data['deliveryNotes'] ?? null,
    'paymentMethod' => strtoupper($data['paymentMethod'] ?? 'CASH'),
    'total' => $total,
    'status' => 'PENDING',
    'items' => $orderItems
];

try {
    $order = DatabaseService::createOrder($orderData);
    
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'order' => $order
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    error_log("Order creation error: " . $e->getMessage());
}


