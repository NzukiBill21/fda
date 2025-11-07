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
    
    $body = Request::getBody();
    
    // First check if the item exists
    $db = Database::getInstance()->getConnection();
    $checkStmt = $db->prepare("SELECT * FROM menu_items WHERE id = ?");
    $checkStmt->execute([$id]);
    $existingItem = $checkStmt->fetch();
    
    if (!$existingItem) {
        Response::error("Menu item with id \"{$id}\" not found", 404);
    }
    
    // Allowed fields
    $allowedFields = [
        'name', 'description', 'price', 'category', 'image', 'rating',
        'isPopular', 'isSpicy', 'isVegetarian', 'isAvailable', 'isFeatured',
        'stock', 'prepTime', 'nutrition', 'allergens'
    ];
    
    $updateFields = [];
    $updateValues = [];
    
    foreach ($allowedFields as $field) {
        if (isset($body[$field])) {
            $updateFields[] = "{$field} = ?";
            
            if ($field === 'nutrition' && is_array($body[$field])) {
                $updateValues[] = json_encode($body[$field]);
            } elseif ($field === 'allergens' && is_array($body[$field])) {
                $updateValues[] = json_encode($body[$field]);
            } elseif (in_array($field, ['isPopular', 'isSpicy', 'isVegetarian', 'isAvailable', 'isFeatured'])) {
                $updateValues[] = (bool)$body[$field] ? 1 : 0;
            } elseif ($field === 'price' || $field === 'rating') {
                $updateValues[] = (float)$body[$field];
            } elseif (in_array($field, ['stock', 'prepTime'])) {
                $updateValues[] = (int)$body[$field];
            } elseif ($field === 'category') {
                $updateValues[] = (string)$body[$field];
            } else {
                $updateValues[] = $body[$field];
            }
        }
    }
    
    if (empty($updateFields)) {
        Response::error('No valid fields to update', 400);
    }
    
    $updateValues[] = $id;
    
    $sql = "UPDATE menu_items SET " . implode(', ', $updateFields) . " WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($updateValues);
    
    // Fetch updated item
    $fetchStmt = $db->prepare("SELECT * FROM menu_items WHERE id = ?");
    $fetchStmt->execute([$id]);
    $menuItem = $fetchStmt->fetch();
    
    // Parse JSON fields
    if ($menuItem['nutrition']) {
        $menuItem['nutrition'] = json_decode($menuItem['nutrition'], true);
    }
    if ($menuItem['allergens']) {
        $menuItem['allergens'] = json_decode($menuItem['allergens'], true);
    }
    
    Response::json([
        'success' => true,
        'message' => 'Menu item updated successfully',
        'menuItem' => $menuItem
    ]);
} catch (Exception $e) {
    error_log('Menu update error: ' . $e->getMessage());
    Response::error($e->getMessage(), 500);
}

