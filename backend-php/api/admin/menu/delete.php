<?php
requireRole(['ADMIN', 'SUPER_ADMIN']);

$id = $_GET['id'] ?? null;
if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Menu item ID is required']);
    exit;
}

$sql = "DELETE FROM menu_items WHERE id = ?";
Database::query($sql, [$id]);

echo json_encode(['success' => true]);




