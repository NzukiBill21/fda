<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../utils/Response.php';
require_once __DIR__ . '/../../utils/Request.php';

try {
    $db = Database::getInstance()->getConnection();
    $stmt = $db->query("SELECT * FROM menu_items ORDER BY createdAt DESC");
    $items = $stmt->fetchAll();
    
    // Parse JSON fields
    foreach ($items as &$item) {
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
    }
    
    Response::json(['success' => true, 'menuItems' => $items]);
} catch (Exception $e) {
    Response::error($e->getMessage(), 500);
}

