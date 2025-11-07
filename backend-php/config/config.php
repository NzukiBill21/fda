<?php
/**
 * Application Configuration
 */

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0); // Set to 0 in production
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/error.log');

// Timezone
date_default_timezone_set('Africa/Nairobi');

// JWT Secret
define('JWT_SECRET', $_ENV['JWT_SECRET'] ?? 'super_secret_jwt_key_for_monda_app_change_in_production_min_32_chars');

// CORS Origins
$corsOrigins = $_ENV['CORS_ORIGIN'] ?? 'http://localhost:3000';
define('CORS_ORIGINS', explode(',', $corsOrigins));

// API Version
define('API_VERSION', '1.0.0');

// Max upload size (50MB)
define('MAX_UPLOAD_SIZE', 50 * 1024 * 1024);

