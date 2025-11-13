<?php
/**
 * CORS Configuration
 * Replicates Node.js CORS logic - allows all origins for development
 */

function setupCORS() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
    
    // Always set CORS headers
    if ($origin) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header("Access-Control-Allow-Origin: *");
    }
    
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control");
    header("Access-Control-Expose-Headers: Content-Length, Content-Type, Authorization");
    header("Access-Control-Max-Age: 86400");
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

// Set JSON headers
header("Content-Type: application/json; charset=utf-8");

// Setup CORS
setupCORS();




