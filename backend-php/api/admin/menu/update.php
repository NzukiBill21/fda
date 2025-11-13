<?php
requireRole(['ADMIN', 'SUPER_ADMIN']);

$id = $_GET['id'] ?? null;
$data = json_decode(file_get_contents('php://input'), true);

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Menu item ID is required']);
    exit;
}

$existing = DatabaseService::getMenuItemById($id);
if (!$existing) {
    http_response_code(404);
    echo json_encode(['error' => 'Menu item not found']);
    exit;
}

$sql = "UPDATE menu_items SET name = ?, description = ?, price = ?, category = ?, 
        image = ?, isAvailable = ?, isFeatured = ?, stock = ?, prepTime = ?, updatedAt = NOW()
        WHERE id = ?";

Database::query($sql, [
    $data['name'] ?? $existing['name'],
    $data['description'] ?? $existing['description'],
    isset($data['price']) ? floatval($data['price']) : $existing['price'],
    $data['category'] ?? $existing['category'],
    $data['image'] ?? $existing['image'],
    isset($data['isAvailable']) ? ($data['isAvailable'] ? 1 : 0) : $existing['isAvailable'],
    isset($data['isFeatured']) ? ($data['isFeatured'] ? 1 : 0) : $existing['isFeatured'],
    isset($data['stock']) ? intval($data['stock']) : $existing['stock'],
    isset($data['prepTime']) ? intval($data['prepTime']) : $existing['prepTime'],
    $id
]);

$item = DatabaseService::getMenuItemById($id);
echo json_encode(['success' => true, 'item' => $item]);




