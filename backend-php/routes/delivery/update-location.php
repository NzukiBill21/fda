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
    
    if (!in_array('DELIVERY_GUY', $decoded['roles'])) {
        Response::error('Delivery guy access required', 403);
    }
    
    $id = $_GET['id'] ?? null;
    if (!$id) {
        Response::error('Order ID is required', 400);
    }
    
    $body = Request::getBody();
    $latitude = $body['latitude'] ?? null;
    $longitude = $body['longitude'] ?? null;
    
    if (!$latitude || !$longitude) {
        Response::error('Latitude and longitude are required', 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Create tracking entry with location
    $trackingId = $authService->generateUUID();
    $trackingStmt = $db->prepare("
        INSERT INTO order_tracking (id, orderId, status, latitude, longitude, notes)
        VALUES (?, ?, 'OUT_FOR_DELIVERY', ?, ?, 'Location updated')
    ");
    $trackingStmt->execute([$trackingId, $id, $latitude, $longitude]);
    
    Response::json(['success' => true, 'message' => 'Location updated']);
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

