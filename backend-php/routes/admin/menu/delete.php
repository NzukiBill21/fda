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
    
    $id = $_GET['id'] ?? null;
    if (!$id) {
        Response::error('Menu item ID is required', 400);
    }
    
    // Validate UUID format
    if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $id)) {
        Response::error('Invalid menu item ID format', 400);
    }
    
    $db = Database::getInstance()->getConnection();
    
    // Check if item exists first
    $stmt = $db->prepare("SELECT id FROM menu_items WHERE id = ?");
    $stmt->execute([$id]);
    $existingItem = $stmt->fetch();
    
    if (!$existingItem) {
        Response::error('Menu item not found. It may have already been deleted.', 404);
    }
    
    // Check if item is referenced in orders
    $checkStmt = $db->prepare("SELECT COUNT(*) as count FROM order_items WHERE menuItemId = ?");
    $checkStmt->execute([$id]);
    $checkResult = $checkStmt->fetch();
    
    if ($checkResult['count'] > 0) {
        Response::error('Cannot delete: This item is in orders or carts. Mark it as unavailable instead.', 400);
    }
    
    // Delete the item
    $deleteStmt = $db->prepare("DELETE FROM menu_items WHERE id = ?");
    $deleteStmt->execute([$id]);
    
    // Log activity
    $logStmt = $db->prepare("
        INSERT INTO activity_logs (id, userId, action, entity, details, ipAddress, userAgent)
        VALUES (?, ?, 'MENU_ITEM_DELETED', 'MenuItem', ?, ?, ?)
    ");
    $logStmt->execute([
        $authService->generateUUID(),
        $decoded['userId'],
        "Menu item {$id} deleted",
        $_SERVER['REMOTE_ADDR'] ?? null,
        $_SERVER['HTTP_USER_AGENT'] ?? null
    ]);
    
    Response::json([
        'success' => true,
        'message' => 'Menu item deleted successfully'
    ]);
} catch (PDOException $e) {
    $errorMessage = $e->getMessage();
    
    // Check for foreign key constraint errors
    if (strpos($errorMessage, 'foreign key') !== false || 
        strpos($errorMessage, 'referenced') !== false ||
        strpos($errorMessage, 'orders') !== false ||
        strpos($errorMessage, 'carts') !== false) {
        Response::error('Cannot delete: This item is in orders or carts. Mark it as unavailable instead.', 400);
    }
    
    error_log('Menu deletion error: ' . $errorMessage);
    Response::error('Failed to delete menu item', 500);
} catch (Exception $e) {
    error_log('Menu deletion error: ' . $e->getMessage());
    Response::error($e->getMessage(), 500);
}

