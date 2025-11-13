<?php
requireRole(['ADMIN', 'SUPER_ADMIN']);

$page = intval($_GET['page'] ?? 1);
$limit = intval($_GET['limit'] ?? 20);

$orders = DatabaseService::getAdminOrders($page, $limit);

// Add items to each order
foreach ($orders as &$order) {
    $order['items'] = Database::queryAll(
        "SELECT oi.*, mi.name as menuItemName, mi.price as menuItemPrice, mi.image as menuItemImage
         FROM order_items oi
         LEFT JOIN menu_items mi ON oi.menuItemId = mi.id
         WHERE oi.orderId = ?",
        [$order['id']]
    );
    $order['trackingHistory'] = DatabaseService::getOrderTracking($order['id']);
}

echo json_encode(['success' => true, 'orders' => $orders, 'page' => $page, 'limit' => $limit]);


