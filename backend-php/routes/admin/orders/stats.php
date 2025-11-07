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
    
    $db = Database::getInstance()->getConnection();
    
    // Get order stats
    $totalOrdersStmt = $db->query("SELECT COUNT(*) as count FROM orders");
    $totalOrders = $totalOrdersStmt->fetch()['count'];
    
    $pendingOrdersStmt = $db->query("SELECT COUNT(*) as count FROM orders WHERE status = 'PENDING'");
    $pendingOrders = $pendingOrdersStmt->fetch()['count'];
    
    $confirmedOrdersStmt = $db->query("SELECT COUNT(*) as count FROM orders WHERE status = 'CONFIRMED'");
    $confirmedOrders = $confirmedOrdersStmt->fetch()['count'];
    
    $preparingOrdersStmt = $db->query("SELECT COUNT(*) as count FROM orders WHERE status = 'PREPARING'");
    $preparingOrders = $preparingOrdersStmt->fetch()['count'];
    
    $readyOrdersStmt = $db->query("SELECT COUNT(*) as count FROM orders WHERE status = 'READY'");
    $readyOrders = $readyOrdersStmt->fetch()['count'];
    
    $outForDeliveryOrdersStmt = $db->query("SELECT COUNT(*) as count FROM orders WHERE status = 'OUT_FOR_DELIVERY'");
    $outForDeliveryOrders = $outForDeliveryOrdersStmt->fetch()['count'];
    
    $deliveredOrdersStmt = $db->query("SELECT COUNT(*) as count FROM orders WHERE status = 'DELIVERED'");
    $deliveredOrders = $deliveredOrdersStmt->fetch()['count'];
    
    $cancelledOrdersStmt = $db->query("SELECT COUNT(*) as count FROM orders WHERE status = 'CANCELLED'");
    $cancelledOrders = $cancelledOrdersStmt->fetch()['count'];
    
    $totalRevenueStmt = $db->query("SELECT SUM(total) as total FROM orders WHERE status = 'DELIVERED'");
    $totalRevenue = $totalRevenueStmt->fetch()['total'] ?? 0;
    
    $todayOrdersStmt = $db->query("SELECT COUNT(*) as count FROM orders WHERE DATE(createdAt) = CURDATE()");
    $todayOrders = $todayOrdersStmt->fetch()['count'];
    
    $thisWeekOrdersStmt = $db->query("SELECT COUNT(*) as count FROM orders WHERE WEEK(createdAt) = WEEK(NOW()) AND YEAR(createdAt) = YEAR(NOW())");
    $thisWeekOrders = $thisWeekOrdersStmt->fetch()['count'];
    
    Response::json([
        'success' => true,
        'stats' => [
            'totalOrders' => (int)$totalOrders,
            'pendingOrders' => (int)$pendingOrders,
            'confirmedOrders' => (int)$confirmedOrders,
            'preparingOrders' => (int)$preparingOrders,
            'readyOrders' => (int)$readyOrders,
            'outForDeliveryOrders' => (int)$outForDeliveryOrders,
            'deliveredOrders' => (int)$deliveredOrders,
            'cancelledOrders' => (int)$cancelledOrders,
            'totalRevenue' => (float)$totalRevenue,
            'todayOrders' => (int)$todayOrders,
            'thisWeekOrders' => (int)$thisWeekOrders
        ]
    ]);
} catch (Exception $e) {
    error_log('Get order stats error: ' . $e->getMessage());
    Response::error($e->getMessage(), 500);
}

