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
    
    $db = Database::getInstance()->getConnection();
    
    $profileStmt = $db->prepare("SELECT * FROM delivery_guy_profiles WHERE userId = ?");
    $profileStmt->execute([$decoded['userId']]);
    $profile = $profileStmt->fetch();
    
    Response::json(['success' => true, 'profile' => $profile]);
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

