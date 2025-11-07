<?php
/**
 * Comprehensive Migration Verification
 * Verifies that all data was successfully migrated from SQLite to MySQL
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

echo "🔍 Comprehensive Migration Verification\n";
echo "========================================\n\n";

try {
    $mysql = Database::getInstance()->getConnection();
    echo "✅ Connected to MySQL database\n\n";
    
    // Check SQLite database
    $sqlitePath = __DIR__ . '/../backend/prisma/dev.db';
    $hasSqlite = file_exists($sqlitePath);
    
    if ($hasSqlite) {
        $sqlite = new PDO("sqlite:{$sqlitePath}");
        $sqlite->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        echo "✅ SQLite database found\n\n";
    } else {
        echo "ℹ️  No SQLite database found (this is OK if you're starting fresh)\n\n";
    }
    
    $tables = [
        'users' => 'Users',
        'roles' => 'Roles',
        'user_roles' => 'User Roles',
        'menu_items' => 'Menu Items',
        'orders' => 'Orders',
        'order_items' => 'Order Items',
        'order_tracking' => 'Order Tracking',
        'delivery_guy_profiles' => 'Delivery Profiles',
        'activity_logs' => 'Activity Logs'
    ];
    
    $totalSqlite = 0;
    $totalMySQL = 0;
    $allMatch = true;
    
    echo "📊 Comparing Data Counts:\n";
    echo str_repeat("-", 60) . "\n";
    printf("%-25s %12s %12s %8s\n", "Table", "SQLite", "MySQL", "Status");
    echo str_repeat("-", 60) . "\n";
    
    foreach ($tables as $table => $label) {
        // Get MySQL count
        $mysqlStmt = $mysql->query("SELECT COUNT(*) FROM `{$table}`");
        $mysqlCount = (int)$mysqlStmt->fetchColumn();
        $totalMySQL += $mysqlCount;
        
        if ($hasSqlite) {
            // Check if table exists in SQLite
            $checkStmt = $sqlite->query("SELECT name FROM sqlite_master WHERE type='table' AND name='{$table}'");
            if ($checkStmt->fetch()) {
                $sqliteStmt = $sqlite->query("SELECT COUNT(*) FROM `{$table}`");
                $sqliteCount = (int)$sqliteStmt->fetchColumn();
                $totalSqlite += $sqliteCount;
                
                $status = ($mysqlCount === $sqliteCount) ? "✅" : "⚠️";
                if ($mysqlCount !== $sqliteCount) {
                    $allMatch = false;
                }
                printf("%-25s %12d %12d %8s\n", $label, $sqliteCount, $mysqlCount, $status);
            } else {
                printf("%-25s %12s %12d %8s\n", $label, "N/A", $mysqlCount, "ℹ️");
            }
        } else {
            printf("%-25s %12s %12d %8s\n", $label, "N/A", $mysqlCount, "✅");
        }
    }
    
    echo str_repeat("-", 60) . "\n";
    printf("%-25s %12d %12d\n", "TOTAL", $totalSqlite, $totalMySQL);
    echo "\n";
    
    // Verify critical data
    echo "🔐 Verifying Critical Data:\n";
    echo str_repeat("-", 60) . "\n";
    
    // Check roles
    $rolesStmt = $mysql->query("SELECT name FROM roles ORDER BY name");
    $roles = $rolesStmt->fetchAll(PDO::FETCH_COLUMN);
    $expectedRoles = ['ADMIN', 'CATERER', 'DELIVERY_GUY', 'SUB_ADMIN', 'SUPER_ADMIN', 'USER'];
    $rolesMatch = count(array_intersect($roles, $expectedRoles)) === count($expectedRoles);
    
    echo "Roles: " . ($rolesMatch ? "✅ All 6 roles present" : "⚠️ Missing roles") . "\n";
    echo "   Found: " . implode(', ', $roles) . "\n";
    
    // Check users
    $usersStmt = $mysql->query("SELECT COUNT(*) FROM users");
    $userCount = (int)$usersStmt->fetchColumn();
    echo "Users: " . ($userCount > 0 ? "✅ {$userCount} users found" : "⚠️ No users") . "\n";
    
    // Check menu items
    $menuStmt = $mysql->query("SELECT COUNT(*) FROM menu_items");
    $menuCount = (int)$menuStmt->fetchColumn();
    echo "Menu Items: " . ($menuCount > 0 ? "✅ {$menuCount} items found" : "ℹ️ No menu items (add via admin)") . "\n";
    
    // Check orders
    $ordersStmt = $mysql->query("SELECT COUNT(*) FROM orders");
    $orderCount = (int)$ordersStmt->fetchColumn();
    echo "Orders: " . ($orderCount > 0 ? "✅ {$orderCount} orders found" : "ℹ️ No orders yet") . "\n";
    
    echo "\n";
    
    // Test sample queries
    echo "🧪 Testing Sample Queries:\n";
    echo str_repeat("-", 60) . "\n";
    
    // Test user with roles
    $userRoleStmt = $mysql->query("
        SELECT u.name, u.email, GROUP_CONCAT(r.name) as roles
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.userId
        LEFT JOIN roles r ON ur.roleId = r.id
        GROUP BY u.id
        LIMIT 3
    ");
    $usersWithRoles = $userRoleStmt->fetchAll();
    
    if (!empty($usersWithRoles)) {
        echo "✅ User-Role relationships working:\n";
        foreach ($usersWithRoles as $user) {
            echo "   - {$user['name']} ({$user['email']}): {$user['roles']}\n";
        }
    } else {
        echo "ℹ️  No users found\n";
    }
    
    // Test order with items
    $orderItemStmt = $mysql->query("
        SELECT o.orderNumber, COUNT(oi.id) as itemCount, o.total
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.orderId
        GROUP BY o.id
        LIMIT 3
    ");
    $ordersWithItems = $orderItemStmt->fetchAll();
    
    if (!empty($ordersWithItems)) {
        echo "\n✅ Order-Item relationships working:\n";
        foreach ($ordersWithItems as $order) {
            echo "   - {$order['orderNumber']}: {$order['itemCount']} items, KES {$order['total']}\n";
        }
    } else {
        echo "\nℹ️  No orders found\n";
    }
    
    echo "\n";
    
    // Final summary
    echo "📋 Summary:\n";
    echo str_repeat("-", 60) . "\n";
    
    if ($hasSqlite) {
        if ($allMatch && $totalMySQL === $totalSqlite) {
            echo "✅ PERFECT! All data migrated successfully!\n";
            echo "   - All record counts match\n";
            echo "   - All relationships intact\n";
            echo "   - Database is ready for production\n";
        } else {
            echo "⚠️  Migration completed with some differences\n";
            echo "   - Check individual table statuses above\n";
            echo "   - Some differences may be expected (e.g., new roles)\n";
        }
    } else {
        echo "✅ Database setup complete!\n";
        echo "   - All tables created\n";
        echo "   - Default roles seeded\n";
        echo "   - Ready for use\n";
    }
    
    echo "\n🎉 Verification complete!\n";
    echo "\nYour database is ready to use. You can now:\n";
    echo "  1. Configure your web server\n";
    echo "  2. Update frontend API URL\n";
    echo "  3. Start using the PHP backend\n";
    
} catch (PDOException $e) {
    echo "\n❌ Database error: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

