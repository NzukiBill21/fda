<?php
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../config/database.php';
require_once __DIR__ . '/../../../utils/Response.php';
require_once __DIR__ . '/../../../utils/Request.php';
require_once __DIR__ . '/../../../services/AuthService.php';

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
    
    $itemId = $_GET['itemId'] ?? null;
    if (!$itemId) {
        Response::error('Menu item ID is required', 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Get current status
    $stmt = $db->prepare("SELECT isAvailable FROM menu_items WHERE id = ?");
    $stmt->execute([$itemId]);
    $item = $stmt->fetch();
    
    if (!$item) {
        Response::error('Menu item not found', 404);
    }
    
    // Toggle status
    $newStatus = $item['isAvailable'] ? 0 : 1;
    $updateStmt = $db->prepare("UPDATE menu_items SET isAvailable = ? WHERE id = ?");
    $updateStmt->execute([$newStatus, $itemId]);
    
    Response::json([
        'success' => true,
        'message' => 'Menu item status updated'
    ]);
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

