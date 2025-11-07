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
    
    $body = Request::getBody();
    $role = strtoupper($body['role'] ?? 'ADMIN');
    
    $db = Database::getInstance()->getConnection();
    
    // Get or create the role
    $roleStmt = $db->prepare("SELECT id FROM roles WHERE name = ?");
    $roleStmt->execute([$role]);
    $roleRecord = $roleStmt->fetch();
    
    if (!$roleRecord) {
        // Create role if it doesn't exist
        $roleId = $authService->generateUUID();
        $createRoleStmt = $db->prepare("INSERT INTO roles (id, name, description) VALUES (?, ?, ?)");
        $createRoleStmt->execute([$roleId, $role, "{$role} role"]);
        $roleRecord = ['id' => $roleId];
    }
    
    // Remove existing roles for this user
    $deleteStmt = $db->prepare("DELETE FROM user_roles WHERE userId = ?");
    $deleteStmt->execute([$userId]);
    
    // Add the new role
    $userRoleId = $authService->generateUUID();
    $insertStmt = $db->prepare("INSERT INTO user_roles (id, userId, roleId) VALUES (?, ?, ?)");
    $insertStmt->execute([$userRoleId, $userId, $roleRecord['id']]);
    
    // If promoting to ADMIN or SUPER_ADMIN, set mustChangePassword to true
    if ($role === 'ADMIN' || $role === 'SUPER_ADMIN') {
        $updateStmt = $db->prepare("UPDATE users SET mustChangePassword = 1 WHERE id = ?");
        $updateStmt->execute([$userId]);
    }
    
    $message = "User promoted to {$role} successfully";
    if ($role === 'ADMIN' || $role === 'SUPER_ADMIN') {
        $message .= '. They will be required to change their password on first login.';
    }
    
    Response::json([
        'success' => true,
        'message' => $message
    ]);
} catch (Exception $e) {
    error_log('User promotion error: ' . $e->getMessage());
    Response::error($e->getMessage(), 500);
}

