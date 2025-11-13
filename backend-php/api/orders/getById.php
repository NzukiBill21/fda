<?php
/**
 * Get Order by ID or Order Number
 * Replicates Node.js /api/orders/:id GET logic
 */

$id = $_GET['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Order ID is required']);
    exit;
}

try {
    // Try by ID first, then by order number (same logic as Node.js)
    $order = DatabaseService::getOrderById($id);
    
    if (!$order && strpos($id, 'ORD-') === 0) {
        $order = DatabaseService::getOrderByNumber($id);
    }
    
    if (!$order) {
        http_response_code(404);
        echo json_encode(['error' => 'Order not found']);
        exit;
    }
    
    // Normalize numeric fields - same as Node.js
    $order['total'] = floatval($order['total'] ?? 0);
    if (isset($order['items'])) {
        foreach ($order['items'] as &$item) {
            $item['price'] = floatval($item['price'] ?? 0);
            $item['quantity'] = intval($item['quantity'] ?? 0);
        }
    }
    
    echo json_encode([
        'success' => true,
        'order' => $order
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}




