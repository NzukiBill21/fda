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
    
    if (!in_array('SUPER_ADMIN', $decoded['roles']) && !in_array('ADMIN', $decoded['roles'])) {
        Response::error('Admin access required', 403);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Get dashboard stats
    $totalOrdersStmt = $db->query("SELECT COUNT(*) as count FROM orders");
    $totalOrders = $totalOrdersStmt->fetch()['count'];
    
    $totalUsersStmt = $db->query("SELECT COUNT(*) as count FROM users");
    $totalUsers = $totalUsersStmt->fetch()['count'];
    
    $totalMenuItemsStmt = $db->query("SELECT COUNT(*) as count FROM menu_items");
    $totalMenuItems = $totalMenuItemsStmt->fetch()['count'];
    
    // Get recent orders
    $recentOrdersStmt = $db->query("
        SELECT o.*, u.name as userName, u.email as userEmail
        FROM orders o
        LEFT JOIN users u ON o.userId = u.id
        ORDER BY o.createdAt DESC
        LIMIT 10
    ");
    $recentOrders = $recentOrdersStmt->fetchAll();
    
    // Get online drivers
    $onlineDriversStmt = $db->query("
        SELECT dgp.*, u.name as userName, u.email as userEmail
        FROM delivery_guy_profiles dgp
        LEFT JOIN users u ON dgp.userId = u.id
        WHERE dgp.status = 'online'
    ");
    $onlineDrivers = $onlineDriversStmt->fetchAll();
    
    Response::json([
        'success' => true,
        'dashboard' => [
            'totalOrders' => (int)$totalOrders,
            'totalUsers' => (int)$totalUsers,
            'totalMenuItems' => (int)$totalMenuItems,
            'recentOrders' => $recentOrders,
            'onlineDrivers' => $onlineDrivers
        ]
    ]);
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

