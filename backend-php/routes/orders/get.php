<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/Response.php';
require_once __DIR__ . '/../../utils/Request.php';

try {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        Response::error('Order ID is required', 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Get order
    $orderStmt = $db->prepare("
        SELECT o.*, 
               u.id as userId, u.name as userName, u.email as userEmail, u.phone as userPhone,
               dg.id as deliveryGuyId, dg.name as deliveryGuyName, dg.email as deliveryGuyEmail, dg.phone as deliveryGuyPhone
        FROM orders o
        LEFT JOIN users u ON o.userId = u.id
        LEFT JOIN users dg ON o.deliveryGuyId = dg.id
        WHERE o.id = ?
    ");
    $orderStmt->execute([$id]);
    $order = $orderStmt->fetch();
    
    if (!$order) {
        Response::error('Order not found', 404);
    }
    
    // Get order items
    $itemsStmt = $db->prepare("
        SELECT oi.*, mi.*
        FROM order_items oi
        LEFT JOIN menu_items mi ON oi.menuItemId = mi.id
        WHERE oi.orderId = ?
    ");
    $itemsStmt->execute([$id]);
    $order['items'] = $itemsStmt->fetchAll();
    
    // Get tracking history
    $trackingStmt = $db->prepare("
        SELECT * FROM order_tracking 
        WHERE orderId = ? 
        ORDER BY timestamp DESC
    ");
    $trackingStmt->execute([$id]);
    $order['trackingHistory'] = $trackingStmt->fetchAll();
    
    Response::json(['success' => true, 'order' => $order]);
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

