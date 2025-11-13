<?php
/**
 * Login Endpoint
 * Replicates Node.js /api/auth/login logic
 */

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? null;
$password = $data['password'] ?? null;

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required']);
    exit;
}

// Get user from database
$user = DatabaseService::getUserByEmail($email);

if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid email or password']);
    exit;
}

// Verify password
if (!password_verify($password, $user['password'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid email or password']);
    exit;
}

// Generate JWT token
$token = JWT::generate([
    'id' => $user['id'],
    'email' => $user['email'],
    'roles' => $user['roles'] ?? []
]);

// Return user and token
echo json_encode([
    'success' => true,
    'token' => $token,
    'user' => [
        'id' => $user['id'],
        'email' => $user['email'],
        'name' => $user['name'],
        'phone' => $user['phone'] ?? null,
        'roles' => $user['roles'] ?? [],
        'mustChangePassword' => $user['mustChangePassword'] ?? false
    ]
]);




