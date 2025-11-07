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
    
    $status = Request::getParam('status');
    $page = (int)(Request::getParam('page') ?? 1);
    $limit = (int)(Request::getParam('limit') ?? 20);
    $skip = ($page - 1) * $limit;
    
    $db = Database::getInstance()->getConnection();
    
    // Build WHERE clause
    $whereClause = '';
    $params = [];
    if ($status) {
        $whereClause = 'WHERE o.status = ?';
        $params[] = $status;
    }
    
    // Get orders
    $ordersStmt = $db->prepare("
        SELECT o.*, 
               u.id as userId, u.name as userName, u.email as userEmail, u.phone as userPhone,
               dg.id as deliveryGuyId, dg.name as deliveryGuyName, dg.email as deliveryGuyEmail, dg.phone as deliveryGuyPhone
        FROM orders o
        LEFT JOIN users u ON o.userId = u.id
        LEFT JOIN users dg ON o.deliveryGuyId = dg.id
        {$whereClause}
        ORDER BY o.createdAt DESC
        LIMIT ? OFFSET ?
    ");
    $params[] = $limit;
    $params[] = $skip;
    $ordersStmt->execute($params);
    $orders = $ordersStmt->fetchAll();
    
    // Get order items for each order
    foreach ($orders as &$order) {
        $itemsStmt = $db->prepare("
            SELECT oi.*, mi.id as menuItemId, mi.name as menuItemName, mi.price as menuItemPrice, mi.image as menuItemImage
            FROM order_items oi
            LEFT JOIN menu_items mi ON oi.menuItemId = mi.id
            WHERE oi.orderId = ?
        ");
        $itemsStmt->execute([$order['id']]);
        $order['items'] = $itemsStmt->fetchAll();
        
        // Get latest tracking
        $trackingStmt = $db->prepare("
            SELECT * FROM order_tracking 
            WHERE orderId = ? 
            ORDER BY timestamp DESC 
            LIMIT 1
        ");
        $trackingStmt->execute([$order['id']]);
        $order['trackingHistory'] = $trackingStmt->fetchAll();
    }
    
    // Get total count
    $countStmt = $db->prepare("SELECT COUNT(*) as count FROM orders {$whereClause}");
    $countStmt->execute($status ? [$status] : []);
    $total = $countStmt->fetch()['count'];
    
    Response::json([
        'success' => true,
        'orders' => $orders,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => (int)$total,
            'pages' => (int)ceil($total / $limit)
        ]
    ]);
} catch (Exception $e) {
    error_log('Get orders error: ' . $e->getMessage());
    Response::error($e->getMessage(), 500);
}

