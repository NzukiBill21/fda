<?php
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? null;
$password = $data['password'] ?? null;
$name = $data['name'] ?? null;

if (!$email || !$password || !$name) {
    http_response_code(400);
    echo json_encode(['error' => 'Email, password, and name are required']);
    exit;
}

// Check if user exists
$existing = DatabaseService::getUserByEmail($email);
if ($existing) {
    http_response_code(400);
    echo json_encode(['error' => 'User already exists']);
    exit;
}

// Create user
$userId = bin2hex(random_bytes(16));
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$phone = $data['phone'] ?? null;

$sql = "INSERT INTO users (id, email, password, name, phone, createdAt, updatedAt, isActive)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW(), 1)";
Database::query($sql, [$userId, $email, $hashedPassword, $name, $phone]);

// Assign USER role
$roleSql = "SELECT id FROM roles WHERE name = 'USER' LIMIT 1";
$role = Database::queryOne($roleSql);
if ($role) {
    $userRoleId = bin2hex(random_bytes(16));
    $assignSql = "INSERT INTO user_roles (id, userId, roleId, createdAt) VALUES (?, ?, ?, NOW())";
    Database::query($assignSql, [$userRoleId, $userId, $role['id']]);
}

// Generate token
$token = JWT::generate(['id' => $userId, 'email' => $email, 'roles' => ['USER']]);

echo json_encode([
    'success' => true,
    'token' => $token,
    'user' => ['id' => $userId, 'email' => $email, 'name' => $name, 'roles' => ['USER']]
]);


