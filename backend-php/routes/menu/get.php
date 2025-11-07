<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/Response.php';
require_once __DIR__ . '/../../utils/Request.php';

try {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        Response::error('Menu item ID is required', 400);
    }
    
    $db = Database::getInstance()->getConnection();
    $stmt = $db->prepare("SELECT * FROM menu_items WHERE id = ?");
    $stmt->execute([$id]);
    $item = $stmt->fetch();
    
    if (!$item) {
        Response::error('Menu item not found', 404);
    }
    
    // Parse JSON fields
    if ($item['nutrition']) {
        $item['nutrition'] = json_decode($item['nutrition'], true);
    }
    if ($item['allergens']) {
        $item['allergens'] = json_decode($item['allergens'], true);
    }
    // Convert boolean fields
    $item['isPopular'] = (bool)$item['isPopular'];
    $item['isSpicy'] = (bool)$item['isSpicy'];
    $item['isVegetarian'] = (bool)$item['isVegetarian'];
    $item['isAvailable'] = (bool)$item['isAvailable'];
    $item['isFeatured'] = (bool)$item['isFeatured'];
    $item['price'] = (float)$item['price'];
    $item['rating'] = $item['rating'] ? (float)$item['rating'] : null;
    
    Response::json(['success' => true, 'item' => $item]);
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

