<?php
/**
 * Seed Menu Items
 * Adds sample menu items to the database
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

// Simple UUID generator
function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

echo "🌱 Seeding menu items...\n\n";

try {
    $db = Database::getInstance()->getConnection();
    
    // Sample menu items
    $menuItems = [
        [
            'name' => 'Pilau Special',
            'description' => 'Aromatic rice cooked with spices and tender meat',
            'price' => 570,
            'category' => 'African Specials',
            'image' => 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1200&h=800&fit=crop&q=85',
            'rating' => 4.8,
            'isPopular' => true,
            'isSpicy' => false,
            'isVegetarian' => false,
            'isAvailable' => true,
            'isFeatured' => true,
        ],
        [
            'name' => 'Ugali Nyama',
            'description' => 'Traditional maize meal with grilled meat',
            'price' => 350,
            'category' => 'main-courses',
            'image' => 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&h=800&fit=crop&q=85',
            'rating' => 4.6,
            'isPopular' => true,
            'isSpicy' => false,
            'isVegetarian' => false,
            'isAvailable' => true,
            'isFeatured' => false,
        ],
        [
            'name' => 'Sangweni',
            'description' => 'Delicious traditional dish with rich flavors',
            'price' => 670,
            'category' => 'African Specials',
            'image' => 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1200&h=800&fit=crop&q=85',
            'rating' => 4.7,
            'isPopular' => true,
            'isSpicy' => true,
            'isVegetarian' => false,
            'isAvailable' => true,
            'isFeatured' => true,
        ],
        [
            'name' => 'Rice beans cabbage',
            'description' => 'Hearty meal with rice, beans, and fresh cabbage',
            'price' => 350,
            'category' => 'main-courses',
            'image' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=800&fit=crop&q=85',
            'rating' => 4.5,
            'isPopular' => false,
            'isSpicy' => false,
            'isVegetarian' => true,
            'isAvailable' => true,
            'isFeatured' => false,
        ],
        [
            'name' => 'Nyama choma',
            'description' => 'Tender grilled meat, perfectly seasoned',
            'price' => 1050,
            'category' => 'Premium',
            'image' => 'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&h=800&fit=crop&q=85',
            'rating' => 4.9,
            'isPopular' => true,
            'isSpicy' => false,
            'isVegetarian' => false,
            'isAvailable' => true,
            'isFeatured' => true,
        ],
        [
            'name' => 'Mukimo',
            'description' => 'Traditional mashed potatoes with vegetables',
            'price' => 346,
            'category' => 'African Specials',
            'image' => 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=1200&h=800&fit=crop&q=85',
            'rating' => 4.4,
            'isPopular' => false,
            'isSpicy' => false,
            'isVegetarian' => true,
            'isAvailable' => true,
            'isFeatured' => false,
        ],
    ];
    
    $added = 0;
    $skipped = 0;
    
    foreach ($menuItems as $item) {
        // Check if item already exists
        $checkStmt = $db->prepare("SELECT id FROM menu_items WHERE name = ?");
        $checkStmt->execute([$item['name']]);
        
        if ($checkStmt->fetch()) {
            echo "⏭️  Skipping: {$item['name']} (already exists)\n";
            $skipped++;
            continue;
        }
        
        // Insert item
        $id = generateUUID();
        $stmt = $db->prepare("
            INSERT INTO menu_items (
                id, name, description, price, category, image, rating,
                isPopular, isSpicy, isVegetarian, isAvailable, isFeatured,
                stock, prepTime, nutrition, allergens
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $id,
            $item['name'],
            $item['description'],
            $item['price'],
            $item['category'],
            $item['image'],
            $item['rating'],
            $item['isPopular'] ? 1 : 0,
            $item['isSpicy'] ? 1 : 0,
            $item['isVegetarian'] ? 1 : 0,
            $item['isAvailable'] ? 1 : 0,
            $item['isFeatured'] ? 1 : 0,
            100, // stock
            15,  // prepTime
            null, // nutrition
            json_encode([]) // allergens
        ]);
        
        echo "✅ Added: {$item['name']} - KES {$item['price']}\n";
        $added++;
    }
    
    echo "\n";
    echo "✅ Seeding complete!\n";
    echo "   Added: {$added} items\n";
    echo "   Skipped: {$skipped} items\n";
    echo "\n";
    echo "🎉 Menu items are now available!\n";
    
} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

