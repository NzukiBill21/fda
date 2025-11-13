<?php
requireRole(['ADMIN', 'SUPER_ADMIN']);

if (empty($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No image file provided']);
    exit;
}

$file = $_FILES['image'];
$uploadDir = __DIR__ . '/../../uploads/items/';

if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate unique filename
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = bin2hex(random_bytes(16)) . '.' . $ext;
$filepath = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $filepath)) {
    $imageUrl = "http://" . $_SERVER['HTTP_HOST'] . "/mondas-api/uploads/items/" . $filename;
    echo json_encode(['success' => true, 'imageUrl' => $imageUrl, 'filename' => $filename]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to upload image']);
}




