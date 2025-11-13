<?php
/**
 * Main API Router
 * Replicates Node.js server.ts routing logic
 */

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/JWT.php';
require_once __DIR__ . '/../utils/Auth.php';
require_once __DIR__ . '/../services/DatabaseService.php';

// Load environment variables
if (file_exists(__DIR__ . '/../.env')) {
    $lines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Remove base path if present (mondas-api or /mondas-api)
$path = preg_replace('#^/mondas-api#', '', $path);
$path = rtrim($path, '/') ?: '/';

// Route handling
try {
    // Table checker (for debugging)
    if ($path === '/check_tables' || $path === '/api/check_tables') {
        require __DIR__ . '/../check_tables.php';
        exit;
    }
    
    // Health check
    if ($path === '/api/health' || $path === '/health' || $path === '/api/index.php/api/health') {
        $dbConnected = Database::testConnection();
        if (!$dbConnected) {
            http_response_code(503);
            echo json_encode([
                'status' => 'ERROR',
                'database' => 'disconnected',
                'message' => 'MySQL database is not connected',
                'timestamp' => date('c')
            ]);
            exit;
        }
        echo json_encode([
            'status' => 'OK',
            'database' => 'connected',
            'version' => '1.0.0',
            'timestamp' => date('c')
        ]);
        exit;
    }
    
    // Auth routes
    if ($path === '/api/auth/login' && $method === 'POST') {
        require __DIR__ . '/auth/login.php';
        exit;
    }
    
    if ($path === '/api/auth/register' && $method === 'POST') {
        require __DIR__ . '/auth/register.php';
        exit;
    }
    
    if ($path === '/api/auth/me' && $method === 'GET') {
        require __DIR__ . '/auth/me.php';
        exit;
    }
    
    // Menu routes
    if ($path === '/api/menu' && $method === 'GET') {
        require __DIR__ . '/menu/get.php';
        exit;
    }
    
    if (preg_match('#^/api/menu/([^/]+)$#', $path, $matches) && $method === 'GET') {
        $_GET['id'] = $matches[1];
        require __DIR__ . '/menu/getById.php';
        exit;
    }
    
    // Order routes
    if ($path === '/api/orders' && $method === 'POST') {
        require __DIR__ . '/orders/create.php';
        exit;
    }
    
    if ($path === '/api/orders' && $method === 'GET') {
        require __DIR__ . '/orders/get.php';
        exit;
    }
    
    if (preg_match('#^/api/orders/([^/]+)$#', $path, $matches) && $method === 'GET') {
        $_GET['id'] = $matches[1];
        require __DIR__ . '/orders/getById.php';
        exit;
    }
    
    // Admin routes
    if ($path === '/api/admin/dashboard' && $method === 'GET') {
        require __DIR__ . '/admin/dashboard.php';
        exit;
    }
    
    if ($path === '/api/admin/users' && $method === 'GET') {
        require __DIR__ . '/admin/users.php';
        exit;
    }
    
    if (preg_match('#^/api/admin/users/([^/]+)/promote$#', $path, $matches) && ($method === 'PUT' || $method === 'POST')) {
        $_GET['id'] = $matches[1];
        require __DIR__ . '/admin/promoteUser.php';
        exit;
    }
    
    if ($path === '/api/admin/orders' && $method === 'GET') {
        require __DIR__ . '/admin/orders.php';
        exit;
    }
    
    if ($path === '/api/admin/menu' && $method === 'POST') {
        require __DIR__ . '/admin/menu/create.php';
        exit;
    }
    
    if (preg_match('#^/api/admin/menu/([^/]+)$#', $path, $matches)) {
        $_GET['id'] = $matches[1];
        if ($method === 'PUT') {
            require __DIR__ . '/admin/menu/update.php';
        } elseif ($method === 'DELETE') {
            require __DIR__ . '/admin/menu/delete.php';
        }
        exit;
    }
    
    // Image upload
    if ($path === '/api/uploads/item-image' && $method === 'POST') {
        require __DIR__ . '/uploads/item-image.php';
        exit;
    }
    
    // Caterer routes
    if ($path === '/api/caterer/orders' && $method === 'GET') {
        require __DIR__ . '/caterer/orders.php';
        exit;
    }
    
    // Delivery routes
    if ($path === '/api/delivery/orders' && $method === 'GET') {
        require __DIR__ . '/delivery/orders.php';
        exit;
    }
    
    // 404 - Route not found
    http_response_code(404);
    echo json_encode(['error' => 'Route not found', 'path' => $path]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    error_log("API Error: " . $e->getMessage());
}
