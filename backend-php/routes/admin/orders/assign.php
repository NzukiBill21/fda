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
    
    $id = $_GET['id'] ?? null;
    if (!$id) {
        Response::error('Order ID is required', 400);
    }
    
    $body = Request::getBody();
    $deliveryGuyId = $body['deliveryGuyId'] ?? null;
    
    if (!$deliveryGuyId) {
        Response::error('Delivery guy ID is required', 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Verify delivery guy exists and has DELIVERY_GUY role
    $deliveryGuyStmt = $db->prepare("
        SELECT u.id, GROUP_CONCAT(r.name) as roles
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.userId
        LEFT JOIN roles r ON ur.roleId = r.id
        WHERE u.id = ?
        GROUP BY u.id
    ");
    $deliveryGuyStmt->execute([$deliveryGuyId]);
    $deliveryGuy = $deliveryGuyStmt->fetch();
    
    if (!$deliveryGuy) {
        Response::error('Delivery guy not found', 404);
    }
    
    $roles = $deliveryGuy['roles'] ? explode(',', $deliveryGuy['roles']) : [];
    if (!in_array('DELIVERY_GUY', $roles)) {
        Response::error('User is not a delivery guy', 400);
    }
    
    // Update order
    $updateStmt = $db->prepare("UPDATE orders SET deliveryGuyId = ?, status = 'OUT_FOR_DELIVERY', pickedUpAt = NOW() WHERE id = ?");
    $updateStmt->execute([$deliveryGuyId, $id]);
    
    // Create tracking entry
    $trackingId = $authService->generateUUID();
    $trackingStmt = $db->prepare("
        INSERT INTO order_tracking (id, orderId, status, notes)
        VALUES (?, ?, 'OUT_FOR_DELIVERY', 'Order assigned to delivery guy')
    ");
    $trackingStmt->execute([$trackingId, $id]);
    
    // Fetch updated order
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
    
    Response::json([
        'success' => true,
        'message' => 'Order assigned successfully',
        'order' => $order
    ]);
} catch (Exception $e) {
    error_log('Assign order error: ' . $e->getMessage());
    Response::error($e->getMessage(), 500);
}

