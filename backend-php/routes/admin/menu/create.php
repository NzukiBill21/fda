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
    
    $body = Request::getBody();
    $name = $body['name'] ?? null;
    $description = $body['description'] ?? null;
    $price = $body['price'] ?? null;
    $image = $body['image'] ?? null;
    $category = $body['category'] ?? null;
    $isAvailable = $body['isAvailable'] ?? true;
    $isFeatured = $body['isFeatured'] ?? false;
    $stock = $body['stock'] ?? 0;
    $prepTime = $body['prepTime'] ?? 15;
    $nutrition = $body['nutrition'] ?? null;
    $allergens = $body['allergens'] ?? [];
    
    if (!$name || !$price || !$category) {
        Response::error('Name, price, and category are required', 400);
    }
    
    $db = Database::getInstance()->getConnection();
    $id = $authService->generateUUID();
    
    $stmt = $db->prepare("
        INSERT INTO menu_items (
            id, name, description, price, image, category, 
            isAvailable, isFeatured, stock, prepTime, nutrition, allergens
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $id,
        $name,
        $description,
        (float)$price,
        $image,
        $category,
        (bool)$isAvailable,
        (bool)$isFeatured,
        (int)$stock,
        (int)$prepTime,
        $nutrition ? json_encode($nutrition) : null,
        json_encode($allergens)
    ]);
    
    // Fetch created item
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
        'message' => 'Menu item created successfully',
        'menuItem' => $menuItem
    ]);
} catch (Exception $e) {
    error_log('Menu creation error: ' . $e->getMessage());
    Response::error($e->getMessage(), 500);
}

