<?php
/**
 * Authentication Middleware
 * Replicates Node.js verifyToken middleware
 */

require_once __DIR__ . '/JWT.php';

function verifyToken() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
    
    if (!$authHeader) {
        http_response_code(401);
        echo json_encode(['error' => 'No authorization token provided']);
        exit;
    }
    
    // Extract token from "Bearer <token>"
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
    } else {
        $token = $authHeader;
    }
    
    $decoded = JWT::verify($token);
    
    if (!$decoded) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit;
    }
    
    return $decoded;
}

function requireRole($requiredRoles) {
    $user = verifyToken();
    $userRoles = $user['roles'] ?? [];
    
    if (!is_array($userRoles)) {
        $userRoles = [$userRoles];
    }
    
    $hasRole = false;
    foreach ($requiredRoles as $role) {
        if (in_array($role, $userRoles)) {
            $hasRole = true;
            break;
        }
    }
    
    if (!$hasRole) {
        http_response_code(403);
        echo json_encode(['error' => 'Insufficient permissions']);
        exit;
    }
    
    return $user;
}




