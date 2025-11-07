<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/Response.php';
require_once __DIR__ . '/../../utils/Request.php';
require_once __DIR__ . '/../../services/AuthService.php';

try {
    $token = Request::getAuthToken();
    if (!$token) {
        Response::error('No authorization header', 401);
    }
    
    $authService = new AuthService();
    $decoded = $authService->verifyToken($token);
    $user = $authService->getUserById($decoded['userId']);
    
    // Get mustChangePassword flag from database
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT mustChangePassword FROM users WHERE id = ?");
    $stmt->execute([$decoded['userId']]);
    $dbUser = $stmt->fetch();
    
    Response::json([
        'user' => array_merge($user, [
            'mustChangePassword' => (bool)($dbUser['mustChangePassword'] ?? false)
        ])
    ]);
} catch (Exception $e) {
    Response::error($e->getMessage(), 401);
}

