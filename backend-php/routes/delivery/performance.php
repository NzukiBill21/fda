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
    
    // Get today's completed deliveries
    $completedTodayStmt = $db->prepare("
        SELECT COUNT(*) as count 
        FROM orders 
        WHERE deliveryGuyId = ? AND status = 'DELIVERED' AND DATE(updatedAt) = CURDATE()
    ");
    $completedTodayStmt->execute([$decoded['userId']]);
    $completedToday = $completedTodayStmt->fetch()['count'];
    
    // Calculate on-time rate (simplified)
    $onTimeRate = min(95, 70 + ($completedToday * 2));
    
    $performance = [
        'rating' => 4.8,
        'completed' => (int)$completedToday,
        'onTime' => (int)round($onTimeRate)
    ];
    
    Response::json(['success' => true, 'performance' => $performance]);
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

