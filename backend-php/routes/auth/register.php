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
    $name = $body['name'] ?? null;
    $phone = $body['phone'] ?? null;
    
    if (!$email || !$password || !$name) {
        Response::error('Email, password, and name are required', 400);
    }
    
    $authService = new AuthService();
    $result = $authService->register([
        'email' => $email,
        'password' => $password,
        'name' => $name,
        'phone' => $phone
    ]);
    
    Response::json($result);
} catch (Exception $e) {
    Response::error($e->getMessage(), 400);
}

