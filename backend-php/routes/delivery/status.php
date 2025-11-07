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
    
    $body = Request::getBody();
    $status = $body['status'] ?? 'offline';
    $latitude = $body['latitude'] ?? null;
    $longitude = $body['longitude'] ?? null;
    
    $db = Database::getInstance()->getConnection();
    
    // Upsert delivery guy profile
    $checkStmt = $db->prepare("SELECT id FROM delivery_guy_profiles WHERE userId = ?");
    $checkStmt->execute([$decoded['userId']]);
    $existing = $checkStmt->fetch();
    
    if ($existing) {
        $updateStmt = $db->prepare("
            UPDATE delivery_guy_profiles 
            SET status = ?, latitude = ?, longitude = ?, updatedAt = NOW()
            WHERE userId = ?
        ");
        $updateStmt->execute([$status, $latitude, $longitude, $decoded['userId']]);
    } else {
        $profileId = $authService->generateUUID();
        $insertStmt = $db->prepare("
            INSERT INTO delivery_guy_profiles (id, userId, status, latitude, longitude)
            VALUES (?, ?, ?, ?, ?)
        ");
        $insertStmt->execute([$profileId, $decoded['userId'], $status, $latitude, $longitude]);
    }
    
    Response::json(['success' => true, 'message' => 'Status updated']);
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

