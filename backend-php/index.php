<?php
/**
 * Main Entry Point for PHP Backend
 * Routes all API requests
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/utils/Request.php';
require_once __DIR__ . '/services/AuthService.php';

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Response::json([], 200);
}

$method = Request::getMethod();
$path = Request::getPath();

// Health check endpoints
if ($path === '/health' && $method === 'GET') {
    Response::json([
        'status' => 'OK',
        'message' => 'Monda Food Delivery Backend is running!',
        'timestamp' => date('c'),
        'version' => API_VERSION,
        'features' => ['RBAC', 'Authentication', 'MySQL Database']
    ]);
}

if ($path === '/api/health' && $method === 'GET') {
    try {
        $db = Database::getInstance()->getConnection();
        Response::json([
            'status' => 'OK',
            'database' => 'connected',
            'timestamp' => date('c')
        ]);
    } catch (Exception $e) {
        Response::json([
            'status' => 'OK',
            'database' => 'disconnected',
            'timestamp' => date('c')
        ]);
    }
}

if ($path === '/api' && $method === 'GET') {
    Response::json([
        'message' => 'Monda Food Delivery API',
        'version' => API_VERSION,
        'endpoints' => [
            'POST /api/auth/login - Login',
            'POST /api/auth/register - Register',
            'GET /api/auth/me - Get current user',
            'GET /api/menu - Get menu items',
            'POST /api/orders - Create order',
            'GET /api/admin/dashboard - Admin dashboard (requires auth)',
        ]
    ]);
}

// Route API requests
$route = matchRoute($path, $method);

if ($route) {
    require_once $route;
} else {
    Response::error('Endpoint not found', 404);
}

function matchRoute($path, $method) {
    $routes = [
        // Auth routes
        ['/api/auth/login', 'POST', __DIR__ . '/routes/auth/login.php'],
        ['/api/auth/register', 'POST', __DIR__ . '/routes/auth/register.php'],
        ['/api/auth/me', 'GET', __DIR__ . '/routes/auth/me.php'],
        ['/api/auth/change-password', 'POST', __DIR__ . '/routes/auth/change-password.php'],
        
        // Menu routes
        ['/api/menu', 'GET', __DIR__ . '/routes/menu/list.php'],
        ['/api/menu/:id', 'GET', __DIR__ . '/routes/menu/get.php'],
        
        // Order routes
        ['/api/orders', 'POST', __DIR__ . '/routes/orders/create.php'],
        ['/api/orders/:id', 'GET', __DIR__ . '/routes/orders/get.php'],
        
        // Admin routes
        ['/api/admin/dashboard', 'GET', __DIR__ . '/routes/admin/dashboard.php'],
        ['/api/admin/users', 'GET', __DIR__ . '/routes/admin/users.php'],
        ['/api/admin/users/:userId/promote', 'POST', __DIR__ . '/routes/admin/promote.php'],
        ['/api/admin/users/:userId/demote', 'POST', __DIR__ . '/routes/admin/demote.php'],
        ['/api/admin/users/:userId/activate', 'POST', __DIR__ . '/routes/admin/activate.php'],
        ['/api/admin/users/:userId/deactivate', 'POST', __DIR__ . '/routes/admin/deactivate.php'],
        ['/api/admin/users/:userId', 'DELETE', __DIR__ . '/routes/admin/delete-user.php'],
        ['/api/admin/menu', 'POST', __DIR__ . '/routes/admin/menu/create.php'],
        ['/api/admin/menu/:id', 'PUT', __DIR__ . '/routes/admin/menu/update.php'],
        ['/api/admin/menu/:id', 'DELETE', __DIR__ . '/routes/admin/menu/delete.php'],
        ['/api/admin/menu/:itemId/toggle', 'POST', __DIR__ . '/routes/admin/menu/toggle.php'],
        ['/api/admin/categories', 'GET', __DIR__ . '/routes/admin/categories.php'],
        ['/api/admin/orders', 'GET', __DIR__ . '/routes/admin/orders.php'],
        ['/api/admin/orders/:id/status', 'PUT', __DIR__ . '/routes/admin/orders/update-status.php'],
        ['/api/admin/orders/:id/assign', 'PUT', __DIR__ . '/routes/admin/orders/assign.php'],
        ['/api/admin/orders/stats', 'GET', __DIR__ . '/routes/admin/orders/stats.php'],
        
        // Delivery routes
        ['/api/delivery/assignments', 'GET', __DIR__ . '/routes/delivery/assignments.php'],
        ['/api/delivery/earnings', 'GET', __DIR__ . '/routes/delivery/earnings.php'],
        ['/api/delivery/performance', 'GET', __DIR__ . '/routes/delivery/performance.php'],
        ['/api/delivery/status', 'POST', __DIR__ . '/routes/delivery/status.php'],
        ['/api/delivery/accept/:orderId', 'POST', __DIR__ . '/routes/delivery/accept.php'],
        ['/api/delivery/complete/:orderId', 'POST', __DIR__ . '/routes/delivery/complete.php'],
        ['/api/delivery/profile', 'GET', __DIR__ . '/routes/delivery/profile.php'],
        ['/api/delivery/profile', 'PUT', __DIR__ . '/routes/delivery/update-profile.php'],
        ['/api/delivery/orders', 'GET', __DIR__ . '/routes/delivery/orders.php'],
        ['/api/delivery/orders/:id/location', 'PUT', __DIR__ . '/routes/delivery/update-location.php'],
        
        // Caterer routes
        ['/api/caterer/orders', 'GET', __DIR__ . '/routes/caterer/orders.php'],
        ['/api/caterer/orders/:id/status', 'PUT', __DIR__ . '/routes/caterer/update-status.php'],
        
        // Security routes
        ['/api/security/log', 'POST', __DIR__ . '/routes/security/log.php'],
        ['/api/security/log', 'HEAD', __DIR__ . '/routes/security/log.php'],
        ['/api/security/log', 'GET', __DIR__ . '/routes/security/log.php'],
        
        // Support routes
        ['/api/orders/support-request', 'POST', __DIR__ . '/routes/orders/support-request.php'],
    ];
    
    foreach ($routes as $route) {
        list($routePath, $routeMethod, $file) = $route;
        
        if ($routeMethod !== $method) continue;
        
        $params = Request::getRouteParam($routePath, $path);
        if ($params !== null) {
            // Store route params in $_GET for easy access
            foreach ($params as $key => $value) {
                $_GET[$key] = $value;
            }
            return $file;
        }
    }
    
    return null;
}

