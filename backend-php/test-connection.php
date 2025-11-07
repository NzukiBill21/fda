<?php
/**
 * Test Database Connection
 * Verifies that the database connection is working correctly
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

echo "🔍 Testing database connection...\n\n";

try {
    $db = Database::getInstance()->getConnection();
    echo "✅ Database connection successful!\n\n";
    
    // Test queries
    echo "📊 Testing database queries...\n";
    
    // Check tables
    $tablesStmt = $db->query("SHOW TABLES");
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "✅ Found " . count($tables) . " tables:\n";
    foreach ($tables as $table) {
        $countStmt = $db->query("SELECT COUNT(*) FROM `{$table}`");
        $count = $countStmt->fetchColumn();
        echo "   - {$table}: {$count} records\n";
    }
    
    // Test roles
    echo "\n🔐 Checking roles...\n";
    $rolesStmt = $db->query("SELECT name, description FROM roles");
    $roles = $rolesStmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($roles)) {
        echo "⚠️  No roles found. Run setup-database.php to seed default roles.\n";
    } else {
        echo "✅ Found " . count($roles) . " roles:\n";
        foreach ($roles as $role) {
            echo "   - {$role['name']}: {$role['description']}\n";
        }
    }
    
    // Test users
    echo "\n👥 Checking users...\n";
    $usersStmt = $db->query("SELECT COUNT(*) FROM users");
    $userCount = $usersStmt->fetchColumn();
    echo "✅ Found {$userCount} users\n";
    
    // Test menu items
    echo "\n🍽️  Checking menu items...\n";
    $menuStmt = $db->query("SELECT COUNT(*) FROM menu_items");
    $menuCount = $menuStmt->fetchColumn();
    echo "✅ Found {$menuCount} menu items\n";
    
    // Test orders
    echo "\n📦 Checking orders...\n";
    $ordersStmt = $db->query("SELECT COUNT(*) FROM orders");
    $orderCount = $ordersStmt->fetchColumn();
    echo "✅ Found {$orderCount} orders\n";
    
    echo "\n🎉 All tests passed! Database is ready to use.\n";
    
} catch (PDOException $e) {
    echo "\n❌ Database connection error: " . $e->getMessage() . "\n";
    echo "\n💡 Troubleshooting:\n";
    echo "   - Check your .env file exists and has correct credentials\n";
    echo "   - Ensure MySQL server is running\n";
    echo "   - Verify database name, username, and password are correct\n";
    echo "   - Run 'php setup-database.php' to create the database\n";
    exit(1);
} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

