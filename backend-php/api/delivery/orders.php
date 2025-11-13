<?php
$user = verifyToken();
$userId = $user['id'];

// Get orders ready for delivery or assigned to this delivery guy
$sql = "SELECT o.*, u.name as userName
        FROM orders o
        LEFT JOIN users u ON o.userId = u.id
        WHERE (o.status IN ('READY', 'OUT_FOR_DELIVERY') OR o.deliveryGuyId = ?)
        ORDER BY o.createdAt DESC";

$orders = Database::queryAll($sql, [$userId]);

// Add items
foreach ($orders as &$order) {
    $order['items'] = Database::queryAll(
        "SELECT oi.*, mi.name as menuItemName, mi.price as menuItemPrice, mi.image as menuItemImage
         FROM order_items oi
         LEFT JOIN menu_items mi ON oi.menuItemId = mi.id
         WHERE oi.orderId = ?",
        [$order['id']]
    );
}

echo json_encode(['success' => true, 'orders' => $orders]);


