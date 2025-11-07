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
    
    if (!in_array('DELIVERY_GUY', $decoded['roles'])) {
        Response::error('Delivery guy access required', 403);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Get all orders assigned to this delivery guy or available for pickup
    $ordersStmt = $db->prepare("
        SELECT o.*, 
               u.id as userId, u.name as userName, u.email as userEmail, u.phone as userPhone
        FROM orders o
        LEFT JOIN users u ON o.userId = u.id
        WHERE (o.deliveryGuyId = ? OR (o.deliveryGuyId IS NULL AND o.status = 'CONFIRMED'))
        ORDER BY o.createdAt DESC
    ");
    $ordersStmt->execute([$decoded['userId']]);
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
    
    Response::json(['success' => true, 'assignments' => $orders]);
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

