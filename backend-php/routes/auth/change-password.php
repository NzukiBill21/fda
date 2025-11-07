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
    
    $body = Request::getBody();
    $currentPassword = $body['currentPassword'] ?? null;
    $newPassword = $body['newPassword'] ?? null;
    
    if (!$currentPassword || !$newPassword) {
        Response::error('Current password and new password are required', 400);
    }
    
    if (strlen($newPassword) < 6) {
        Response::error('New password must be at least 6 characters long', 400);
    }
    
    // Get user to verify current password
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->execute([$decoded['userId']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        Response::error('User not found', 404);
    }
    
    // Verify current password
    if (!password_verify($currentPassword, $user['password'])) {
        Response::error('Current password is incorrect', 401);
    }
    
    // Hash new password
    $hashedNewPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    
    // Update password and clear mustChangePassword flag
    $updateStmt = $db->prepare("
        UPDATE users 
        SET password = ?, mustChangePassword = 0 
        WHERE id = ?
    ");
    $updateStmt->execute([$hashedNewPassword, $decoded['userId']]);
    
    // Log activity
    $logStmt = $db->prepare("
        INSERT INTO activity_logs (id, userId, action, entity, details, ipAddress, userAgent)
        VALUES (?, ?, 'PASSWORD_CHANGED', 'AUTH', 'User changed password successfully', ?, ?)
    ");
    $logStmt->execute([
        $authService->generateUUID(),
        $decoded['userId'],
        $_SERVER['REMOTE_ADDR'] ?? null,
        $_SERVER['HTTP_USER_AGENT'] ?? null
    ]);
    
    Response::json([
        'success' => true,
        'message' => 'Password changed successfully'
    ]);
} catch (Exception $e) {
    error_log('Change password error: ' . $e->getMessage());
    Response::error($e->getMessage(), 500);
}

