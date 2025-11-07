<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/Response.php';
require_once __DIR__ . '/../../utils/Request.php';
require_once __DIR__ . '/../../services/AuthService.php';

try {
    $token = Request::getAuthToken();
    if (!$token) {
        Response::error('Authentication required', 401);
    }
    
    $authService = new AuthService();
    $decoded = $authService->verifyToken($token);
    
    if (!in_array('SUPER_ADMIN', $decoded['roles']) && !in_array('ADMIN', $decoded['roles'])) {
        Response::error('Admin access required', 403);
    }
    
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query("SELECT DISTINCT category FROM menu_items WHERE category IS NOT NULL AND category != '' ORDER BY category");
    $categories = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Add default categories if none exist
    if (empty($categories)) {
        $categories = ['All', 'African Specials', 'Premium', 'Burgers', 'Chicken', 'Snacks', 'Pizza', 'Hot Dogs', 'Drinks'];
    } else {
        array_unshift($categories, 'All');
    }
    
    Response::json(['success' => true, 'categories' => $categories]);
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

