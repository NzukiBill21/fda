<?php
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../utils/Response.php';
require_once __DIR__ . '/../../../utils/Request.php';
require_once __DIR__ . '/../../../services/AuthService.php';

try {
    $token = Request::getAuthToken();
    if (!$token) {
        Response::error('Authentication required', 401);
    }
    
    $authService = new AuthService();
    $decoded = $authService->verifyToken($token);
    
    if (!in_array('SUPER_ADMIN', $decoded['roles']) && !in_array('ADMIN', $decoded['roles'])) {
        Response::error('Admin access required', 403);
    }
    
    $id = $_GET['id'] ?? null;
    if (!$id) {
        Response::error('Order ID is required', 400);
    }
    
    $body = Request::getBody();
    $status = $body['status'] ?? null;
    $notes = $body['notes'] ?? null;
    $deliveryGuyId = $body['deliveryGuyId'] ?? null;
    
    if (!$status) {
        Response::error('Status is required', 400);
    }
    
    $validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!in_array($status, $validStatuses)) {
        Response::error('Invalid status', 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Build update query
    $updateFields = ['status = ?'];
    $updateParams = [$status];
    
    if ($deliveryGuyId) {
        $updateFields[] = 'deliveryGuyId = ?';
        $updateParams[] = $deliveryGuyId;
    }
    
    if ($status === 'DELIVERED') {
        $updateFields[] = 'actualDeliveryTime = NOW()';
    }
    
    $updateParams[] = $id;
    
    $updateStmt = $db->prepare("UPDATE orders SET " . implode(', ', $updateFields) . " WHERE id = ?");
    $updateStmt->execute($updateParams);
    
    // Create tracking entry
    $trackingId = $authService->generateUUID();
    $trackingStmt = $db->prepare("
        INSERT INTO order_tracking (id, orderId, status, notes)
        VALUES (?, ?, ?, ?)
    ");
    $trackingStmt->execute([
        $trackingId,
        $id,
        $status,
        $notes ?? "Status updated to {$status}"
    ]);
    
    // Log activity
    $logId = $authService->generateUUID();
    $logStmt = $db->prepare("
        INSERT INTO activity_logs (id, userId, action, entity, details, ipAddress, userAgent)
        VALUES (?, ?, 'ORDER_STATUS_UPDATED', 'Order', ?, ?, ?)
    ");
    $logStmt->execute([
        $logId,
        $decoded['userId'],
        "Order status updated to {$status}",
        $_SERVER['REMOTE_ADDR'] ?? null,
        $_SERVER['HTTP_USER_AGENT'] ?? null
    ]);
    
    // Fetch updated order
    $orderStmt = $db->prepare("
        SELECT o.*, 
               u.id as userId, u.name as userName, u.email as userEmail, u.phone as userPhone,
               dg.id as deliveryGuyId, dg.name as deliveryGuyName, dg.email as deliveryGuyEmail, dg.phone as deliveryGuyPhone
        FROM orders o
        LEFT JOIN users u ON o.userId = u.id
        LEFT JOIN users dg ON o.deliveryGuyId = dg.id
        WHERE o.id = ?
    ");
    $orderStmt->execute([$id]);
    $order = $orderStmt->fetch();
    
    // Get order items
    $itemsStmt = $db->prepare("
        SELECT oi.*, mi.*
        FROM order_items oi
        LEFT JOIN menu_items mi ON oi.menuItemId = mi.id
        WHERE oi.orderId = ?
    ");
    $itemsStmt->execute([$id]);
    $order['items'] = $itemsStmt->fetchAll();
    
    Response::json([
        'success' => true,
        'message' => 'Order status updated successfully',
        'order' => $order
    ]);
} catch (Exception $e) {
    error_log('Update order status error: ' . $e->getMessage());
    Response::error($e->getMessage(), 500);
}

