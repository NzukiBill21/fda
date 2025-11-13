<?php
/**
 * Check which tables exist in the database
 * This will help us identify the correct table names to use
 */

require_once __DIR__ . '/config/database.php';

// Load environment variables
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

header('Content-Type: application/json');

try {
    $conn = Database::getConnection();
    
    // Get all tables
    $tables = $conn->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    
    $tableInfo = [];
    
    foreach ($tables as $table) {
        // Count rows
        $count = $conn->query("SELECT COUNT(*) as count FROM `$table`")->fetch()['count'];
        
        // Get column names
        $columns = $conn->query("SHOW COLUMNS FROM `$table`")->fetchAll(PDO::FETCH_COLUMN);
        
        $tableInfo[$table] = [
            'exists' => true,
            'rowCount' => (int)$count,
            'columns' => $columns
        ];
    }
    
    // Check which naming convention we should use
    $recommendations = [];
    
    // Check for users vs user
    if (isset($tableInfo['users']) && isset($tableInfo['user'])) {
        $recommendations['users'] = $tableInfo['users']['rowCount'] > $tableInfo['user']['rowCount'] ? 'users' : 'user';
    } elseif (isset($tableInfo['users'])) {
        $recommendations['users'] = 'users';
    } elseif (isset($tableInfo['user'])) {
        $recommendations['users'] = 'user';
    }
    
    // Check for menu_items vs menuitem
    if (isset($tableInfo['menu_items']) && isset($tableInfo['menuitem'])) {
        $recommendations['menu_items'] = $tableInfo['menu_items']['rowCount'] > $tableInfo['menuitem']['rowCount'] ? 'menu_items' : 'menuitem';
    } elseif (isset($tableInfo['menu_items'])) {
        $recommendations['menu_items'] = 'menu_items';
    } elseif (isset($tableInfo['menuitem'])) {
        $recommendations['menu_items'] = 'menuitem';
    }
    
    // Check for orders vs order
    if (isset($tableInfo['orders']) && isset($tableInfo['order'])) {
        $recommendations['orders'] = $tableInfo['orders']['rowCount'] > $tableInfo['order']['rowCount'] ? 'orders' : 'order';
    } elseif (isset($tableInfo['orders'])) {
        $recommendations['orders'] = 'orders';
    } elseif (isset($tableInfo['order'])) {
        $recommendations['orders'] = 'order';
    }
    
    // Check for order_items vs orderitem
    if (isset($tableInfo['order_items']) && isset($tableInfo['orderitem'])) {
        $recommendations['order_items'] = $tableInfo['order_items']['rowCount'] > $tableInfo['orderitem']['rowCount'] ? 'order_items' : 'orderitem';
    } elseif (isset($tableInfo['order_items'])) {
        $recommendations['order_items'] = 'order_items';
    } elseif (isset($tableInfo['orderitem'])) {
        $recommendations['order_items'] = 'orderitem';
    }
    
    // Check for order_tracking vs ordertracking
    if (isset($tableInfo['order_tracking']) && isset($tableInfo['ordertracking'])) {
        $recommendations['order_tracking'] = $tableInfo['order_tracking']['rowCount'] > $tableInfo['ordertracking']['rowCount'] ? 'order_tracking' : 'ordertracking';
    } elseif (isset($tableInfo['order_tracking'])) {
        $recommendations['order_tracking'] = 'order_tracking';
    } elseif (isset($tableInfo['ordertracking'])) {
        $recommendations['order_tracking'] = 'ordertracking';
    }
    
    // Check for roles vs role
    if (isset($tableInfo['roles']) && isset($tableInfo['role'])) {
        $recommendations['roles'] = $tableInfo['roles']['rowCount'] > $tableInfo['role']['rowCount'] ? 'roles' : 'role';
    } elseif (isset($tableInfo['roles'])) {
        $recommendations['roles'] = 'roles';
    } elseif (isset($tableInfo['role'])) {
        $recommendations['roles'] = 'role';
    }
    
    // Check for user_roles vs userrole
    if (isset($tableInfo['user_roles']) && isset($tableInfo['userrole'])) {
        $recommendations['user_roles'] = $tableInfo['user_roles']['rowCount'] > $tableInfo['userrole']['rowCount'] ? 'user_roles' : 'userrole';
    } elseif (isset($tableInfo['user_roles'])) {
        $recommendations['user_roles'] = 'user_roles';
    } elseif (isset($tableInfo['userrole'])) {
        $recommendations['user_roles'] = 'userrole';
    }
    
    echo json_encode([
        'success' => true,
        'database' => $_ENV['DB_NAME'] ?? 'u614661615_mondas',
        'tables' => $tableInfo,
        'recommendations' => $recommendations,
        'summary' => [
            'totalTables' => count($tables),
            'tablesWithData' => count(array_filter($tableInfo, fn($info) => $info['rowCount'] > 0))
        ]
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}


