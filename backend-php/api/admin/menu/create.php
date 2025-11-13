<?php
requireRole(['ADMIN', 'SUPER_ADMIN']);

$data = json_decode(file_get_contents('php://input'), true);
$name = $data['name'] ?? null;
$price = $data['price'] ?? null;
$category = $data['category'] ?? null;

if (!$name || !$price || !$category) {
    http_response_code(400);
    echo json_encode(['error' => 'Name, price, and category are required']);
    exit;
}

$itemId = bin2hex(random_bytes(16));
$sql = "INSERT INTO menu_items (id, name, description, price, category, image, isAvailable, 
        isFeatured, stock, prepTime, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

Database::query($sql, [
    $itemId,
    $name,
    $data['description'] ?? null,
    floatval($price),
    $category,
    $data['image'] ?? null,
    isset($data['isAvailable']) ? ($data['isAvailable'] ? 1 : 0) : 1,
    isset($data['isFeatured']) ? ($data['isFeatured'] ? 1 : 0) : 0,
    intval($data['stock'] ?? 0),
    intval($data['prepTime'] ?? 15)
]);

$item = DatabaseService::getMenuItemById($itemId);
echo json_encode(['success' => true, 'item' => $item]);




