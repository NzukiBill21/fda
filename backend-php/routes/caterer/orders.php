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
    
    $db = Database::getInstance()->getConnection();
    
    // Get orders that need preparation or are being prepared
    $ordersStmt = $db->prepare("
        SELECT o.*, 
               u.id as userId, u.name as userName, u.email as userEmail, u.phone as userPhone
        FROM orders o
        LEFT JOIN users u ON o.userId = u.id
        WHERE o.status IN ('PENDING', 'CONFIRMED', 'PREPARING', 'READY')
        ORDER BY o.createdAt DESC
    ");
    $ordersStmt->execute();
    $orders = $ordersStmt->fetchAll();
    
    // Get order items for each order
    foreach ($orders as &$order) {
        $itemsStmt = $db->prepare("
            SELECT oi.*, mi.*
            FROM order_items oi
            LEFT JOIN menu_items mi ON oi.menuItemId = mi.id
            WHERE oi.orderId = ?
        ");
        $itemsStmt->execute([$order['id']]);
        $order['items'] = $itemsStmt->fetchAll();
    }
    
    Response::json(['success' => true, 'orders' => $orders]);
} catch (Exception $e) {
    error_log('Get caterer orders error: ' . $e->getMessage());
    Response::error($e->getMessage(), 500);
}

