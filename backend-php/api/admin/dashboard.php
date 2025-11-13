<?php
requireRole(['ADMIN', 'SUPER_ADMIN']);

// Get stats - same logic as Node.js
$ordersSql = "SELECT COUNT(*) as total FROM orders";
$usersSql = "SELECT COUNT(*) as total FROM users";
$menuSql = "SELECT COUNT(*) as total FROM menu_items";

$totalOrders = Database::queryOne($ordersSql)['total'] ?? 0;
$totalUsers = Database::queryOne($usersSql)['total'] ?? 0;
$totalMenuItems = Database::queryOne($menuSql)['total'] ?? 0;

// Recent orders
$recentOrders = DatabaseService::getAdminOrders(1, 10);

echo json_encode([
    'success' => true,
    'dashboard' => [
        'totalOrders' => intval($totalOrders),
        'totalUsers' => intval($totalUsers),
        'totalMenuItems' => intval($totalMenuItems),
        'recentOrders' => $recentOrders
    ]
]);


