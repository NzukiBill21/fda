<?php
/**
 * Get Orders
 * Replicates Node.js /api/orders GET logic
 */

$user = verifyToken();
$userId = $user['id'];

// Get user's orders
$sql = "SELECT o.*, u.name as userName, u.email as userEmail
        FROM orders o
        LEFT JOIN users u ON o.userId = u.id
        WHERE o.userId = ?
        ORDER BY o.createdAt DESC";

$orders = Database::queryAll($sql, [$userId]);

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
    
    // Normalize numeric fields
    $order['total'] = floatval($order['total'] ?? 0);
    foreach ($order['items'] as &$item) {
        $item['price'] = floatval($item['price'] ?? 0);
        $item['quantity'] = intval($item['quantity'] ?? 0);
    }
}

echo json_encode([
    'success' => true,
    'orders' => $orders
]);



