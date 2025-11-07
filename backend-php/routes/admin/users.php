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
    
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query("
        SELECT u.*, 
               GROUP_CONCAT(r.name) as roles,
               dgp.status as deliveryStatus
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.userId
        LEFT JOIN roles r ON ur.roleId = r.id
        LEFT JOIN delivery_guy_profiles dgp ON u.id = dgp.userId
        GROUP BY u.id
    ");
    $users = $stmt->fetchAll();
    
    $formattedUsers = array_map(function($user) {
        $roles = $user['roles'] ? explode(',', $user['roles']) : [];
        return [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $roles[0] ?? 'User',
            'isActive' => (bool)$user['isActive'],
            'createdAt' => $user['createdAt'],
            'isOnline' => $user['deliveryStatus'] === 'online'
        ];
    }, $users);
    
    Response::json([
        'success' => true,
        'users' => $formattedUsers
    ]);
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

