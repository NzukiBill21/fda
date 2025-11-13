<?php
requireRole(['ADMIN', 'SUPER_ADMIN']);

$userId = $_GET['id'] ?? null;
$data = json_decode(file_get_contents('php://input'), true);
$newRole = $data['role'] ?? null;

if (!$userId || !$newRole) {
    http_response_code(400);
    echo json_encode(['error' => 'User ID and role are required']);
    exit;
}

// Validate role
$validRoles = ['SUPER_ADMIN', 'ADMIN', 'SUB_ADMIN', 'USER', 'DELIVERY_GUY', 'CATERER'];
if (!in_array(strtoupper($newRole), $validRoles)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid role']);
    exit;
}

$newRole = strtoupper($newRole);

// Get user
$userSql = "SELECT * FROM users WHERE id = ? LIMIT 1";
$user = Database::queryOne($userSql, [$userId]);

if (!$user) {
    http_response_code(404);
    echo json_encode(['error' => 'User not found']);
    exit;
}

// Get role ID
$roleSql = "SELECT id FROM roles WHERE name = ? LIMIT 1";
$role = Database::queryOne($roleSql, [$newRole]);

if (!$role) {
    http_response_code(404);
    echo json_encode(['error' => 'Role not found']);
    exit;
}

// Remove all existing roles
$deleteSql = "DELETE FROM user_roles WHERE userId = ?";
Database::query($deleteSql, [$userId]);

// Assign new role
$userRoleId = bin2hex(random_bytes(16));
$assignSql = "INSERT INTO user_roles (id, userId, roleId, createdAt) VALUES (?, ?, ?, NOW())";
Database::query($assignSql, [$userRoleId, $userId, $role['id']]);

// Get updated user with roles
$updatedUser = DatabaseService::getUserByEmail($user['email']);

echo json_encode([
    'success' => true,
    'user' => $updatedUser
]);



