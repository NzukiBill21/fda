<?php
/**
 * Get Menu Items
 * Replicates Node.js /api/menu GET logic
 */

try {
    $items = DatabaseService::getMenuItems();
    
    // Format images - same logic as Node.js formatImage()
    foreach ($items as &$item) {
        if (!empty($item['image'])) {
            $imageStr = trim($item['image']);
            // If it's base64 without prefix, add it
            if (!strpos($imageStr, 'data:image/') === 0 && 
                !strpos($imageStr, 'http') === 0 &&
                strlen($imageStr) > 100) {
                $item['image'] = 'data:image/jpeg;base64,' . $imageStr;
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'menuItems' => $items
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}




