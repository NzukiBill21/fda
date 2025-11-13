<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/Response.php';
require_once __DIR__ . '/../../utils/Request.php';

$method = Request::getMethod();

// Handle HEAD/GET requests for health checks
if ($method === 'HEAD' || $method === 'GET') {
    Response::json(['success' => true, 'message' => 'Security log endpoint available'], 200);
    exit;
}

// Handle POST requests for actual logging
try {
    $body = Request::getBody();
    
    // This endpoint is for client-side security monitoring
    // It accepts logs but doesn't require authentication
    // You can add rate limiting or other security measures here
    
    Response::json(['success' => true, 'message' => 'Log received']);
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

