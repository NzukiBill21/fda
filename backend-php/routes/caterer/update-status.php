<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/Response.php';
require_once __DIR__ . '/../../utils/Request.php';
require_once __DIR__ . '/../../services/AuthService.php';

try {
    $token = Request::getAuthToken();
    if (!$token) {
        Response::error('Authentication required', 401);
    }
    
    $authService = new AuthService();
    $decoded = $authService->verifyToken($token);
    
    // Check if user has CATERER role or ADMIN role
    $hasCatererAccess = in_array('CATERER', $decoded['roles']) || 
                        in_array('ADMIN', $decoded['roles']) || 
                        in_array('SUPER_ADMIN', $decoded['roles']);
    
    if (!$hasCatererAccess) {
        Response::error('Caterer access required', 403);
    }
    
    $id = $_GET['id'] ?? null;
    if (!$id) {
        Response::error('Order ID is required', 400);
    }
    
    $body = Request::getBody();
    $status = $body['status'] ?? null;
    
    if (!$status) {
        Response::error('Status is required', 400);
    }
    
    $validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'];
    if (!in_array($status, $validStatuses)) {
        Response::error('Invalid status for caterer', 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Update order status
    $updateFields = ['status = ?'];
    $updateParams = [$status];
    
    if ($status === 'PREPARING') {
        $updateFields[] = 'preparingAt = NOW()';
    } elseif ($status === 'READY') {
        $updateFields[] = 'readyAt = NOW()';
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
        "Status updated to {$status} by caterer"
    ]);
    
    // Fetch updated order
    $orderStmt = $db->prepare("
        SELECT o.*, 
               u.id as userId, u.name as userName, u.email as userEmail, u.phone as userPhone
        FROM orders o
        LEFT JOIN users u ON o.userId = u.id
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
    error_log('Update caterer order status error: ' . $e->getMessage());
    Response::error($e->getMessage(), 500);
}

