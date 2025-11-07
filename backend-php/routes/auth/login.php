<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/Response.php';
require_once __DIR__ . '/../../utils/Request.php';
require_once __DIR__ . '/../../services/AuthService.php';

try {
    $body = Request::getBody();
    $email = $body['email'] ?? null;
    $password = $body['password'] ?? null;
    
    if (!$email || !$password) {
        Response::error('Email and password are required', 400);
    }
    
    $authService = new AuthService();
    $result = $authService->login($email, $password);
    
    Response::json($result);
} catch (Exception $e) {
    Response::error($e->getMessage(), 401);
}

