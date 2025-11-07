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
    
    $orderId = $_GET['orderId'] ?? null;
    if (!$orderId) {
        Response::error('Order ID is required', 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Update order
    $updateStmt = $db->prepare("
        UPDATE orders 
        SET status = 'DELIVERED', deliveredAt = NOW()
        WHERE id = ? AND deliveryGuyId = ?
    ");
    $updateStmt->execute([$orderId, $decoded['userId']]);
    
    // Fetch updated order
    $orderStmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
    $orderStmt->execute([$orderId]);
    $order = $orderStmt->fetch();
    
    Response::json(['success' => true, 'order' => $order]);
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

