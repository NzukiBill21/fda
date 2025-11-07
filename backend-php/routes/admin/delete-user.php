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
    
    $userId = $_GET['userId'] ?? null;
    if (!$userId) {
        Response::error('User ID is required', 400);
    }
    
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    
    Response::json([
        'success' => true,
        'message' => 'User deleted successfully'
    ]);
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

