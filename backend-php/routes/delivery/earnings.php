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
    
    // Get completed deliveries for earnings calculation
    $todayDeliveriesStmt = $db->prepare("
        SELECT COUNT(*) as count 
        FROM orders 
        WHERE deliveryGuyId = ? AND status = 'DELIVERED' AND DATE(updatedAt) = CURDATE()
    ");
    $todayDeliveriesStmt->execute([$decoded['userId']]);
    $todayDeliveries = $todayDeliveriesStmt->fetch()['count'];
    
    $weekDeliveriesStmt = $db->prepare("
        SELECT COUNT(*) as count 
        FROM orders 
        WHERE deliveryGuyId = ? AND status = 'DELIVERED' AND WEEK(updatedAt) = WEEK(NOW()) AND YEAR(updatedAt) = YEAR(NOW())
    ");
    $weekDeliveriesStmt->execute([$decoded['userId']]);
    $weekDeliveries = $weekDeliveriesStmt->fetch()['count'];
    
    $monthDeliveriesStmt = $db->prepare("
        SELECT COUNT(*) as count 
        FROM orders 
        WHERE deliveryGuyId = ? AND status = 'DELIVERED' AND MONTH(updatedAt) = MONTH(NOW()) AND YEAR(updatedAt) = YEAR(NOW())
    ");
    $monthDeliveriesStmt->execute([$decoded['userId']]);
    $monthDeliveries = $monthDeliveriesStmt->fetch()['count'];
    
    $deliveryFee = 50; // KES per delivery
    $earnings = [
        'today' => (int)$todayDeliveries * $deliveryFee,
        'week' => (int)$weekDeliveries * $deliveryFee,
        'month' => (int)$monthDeliveries * $deliveryFee
    ];
    
    Response::json(['success' => true, 'earnings' => $earnings]);
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

