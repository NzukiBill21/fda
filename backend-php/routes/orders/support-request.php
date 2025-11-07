<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/Response.php';
require_once __DIR__ . '/../../utils/Request.php';
require_once __DIR__ . '/../../services/AuthService.php';

try {
    $body = Request::getBody();
    $orderId = $body['orderId'] ?? null;
    $kitchenStaffNumber = $body['kitchenStaffNumber'] ?? null;
    $timestamp = $body['timestamp'] ?? null;
    
    if (!$orderId || !$kitchenStaffNumber) {
        Response::error('Order ID and kitchen/staff number are required', 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Find the order
    $orderStmt = $db->prepare("SELECT * FROM orders WHERE id = ?");
    $orderStmt->execute([$orderId]);
    $order = $orderStmt->fetch();
    
    if (!$order) {
        Response::error('Order not found', 404);
    }
    
    // Log support request
    $authService = new AuthService();
    $logId = $authService->generateUUID();
    $logStmt = $db->prepare("
        INSERT INTO activity_logs (id, userId, action, entity, details, ipAddress, userAgent)
        VALUES (?, ?, 'SUPPORT_REQUEST', 'Order', ?, ?, ?)
    ");
    $logStmt->execute([
        $logId,
        $order['userId'],
        "Support request for order {$orderId}. Kitchen/Staff: {$kitchenStaffNumber}",
        $_SERVER['REMOTE_ADDR'] ?? null,
        $_SERVER['HTTP_USER_AGENT'] ?? null
    ]);
    
    Response::json([
        'success' => true,
        'message' => 'Support request submitted successfully',
        'orderId' => $orderId
    ]);
} catch (Exception $e) {
    error_log('Support request error: ' . $e->getMessage());
    Response::error($e->getMessage(), 500);
}

