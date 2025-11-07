<?php
/**
 * Migration Script: SQLite to MySQL
 * Transfers all data from SQLite database to MySQL database
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

// SQLite database path
$sqlitePath = __DIR__ . '/../backend/prisma/dev.db';

if (!file_exists($sqlitePath)) {
    echo "❌ SQLite database not found at: {$sqlitePath}\n";
    echo "ℹ️  If you don't have existing data, you can skip this migration.\n";
    echo "ℹ️  Just run the schema.sql file to create empty tables.\n";
    exit(1);
}

echo "🔄 Starting migration from SQLite to MySQL...\n\n";

try {
    // Connect to SQLite
    $sqlite = new PDO("sqlite:{$sqlitePath}");
    $sqlite->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Connect to MySQL
    $mysql = Database::getInstance()->getConnection();
    
    // Disable foreign key checks temporarily
    $mysql->exec("SET FOREIGN_KEY_CHECKS = 0");
    
    // Tables to migrate (in order to respect foreign keys)
    $tables = [
        'users',
        'roles',
        'user_roles',
        'delivery_guy_profiles',
        'menu_items',
        'orders',
        'order_items',
        'order_tracking',
        'activity_logs'
    ];
    
    $totalRecords = 0;
    
    foreach ($tables as $table) {
        echo "📦 Migrating table: {$table}...\n";
        
        // Check if table exists in SQLite
        $checkStmt = $sqlite->query("SELECT name FROM sqlite_master WHERE type='table' AND name='{$table}'");
        if (!$checkStmt->fetch()) {
            echo "   ⚠️  Table '{$table}' not found in SQLite, skipping...\n";
            continue;
        }
        
        // Get all records from SQLite
        $sqliteStmt = $sqlite->query("SELECT * FROM {$table}");
        $records = $sqliteStmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($records)) {
            echo "   ℹ️  No records to migrate.\n";
            continue;
        }
        
        // Get column names
        $columns = array_keys($records[0]);
        $columnList = implode(', ', array_map(function($col) { return "`{$col}`"; }, $columns));
        $placeholders = implode(', ', array_fill(0, count($columns), '?'));
        
        // Clear existing data in MySQL (optional - comment out if you want to keep existing data)
        $mysql->exec("DELETE FROM `{$table}`");
        
        // Prepare insert statement
        $insertSql = "INSERT INTO `{$table}` ({$columnList}) VALUES ({$placeholders})";
        $mysqlStmt = $mysql->prepare($insertSql);
        
        // Insert records
        $count = 0;
        foreach ($records as $record) {
            $values = array_values($record);
            
            // Convert boolean values for MySQL
            foreach ($values as $key => $value) {
                if (is_bool($value)) {
                    $values[$key] = $value ? 1 : 0;
                } elseif ($value === null) {
                    $values[$key] = null;
                }
            }
            
            try {
                $mysqlStmt->execute($values);
                $count++;
            } catch (PDOException $e) {
                echo "   ⚠️  Error inserting record: " . $e->getMessage() . "\n";
                // Continue with next record
            }
        }
        
        echo "   ✅ Migrated {$count} records from {$table}\n";
        $totalRecords += $count;
    }
    
    // Re-enable foreign key checks
    $mysql->exec("SET FOREIGN_KEY_CHECKS = 1");
    
    echo "\n✅ Migration completed successfully!\n";
    echo "📊 Total records migrated: {$totalRecords}\n";
    echo "\n🎉 Your database has been successfully transferred to MySQL!\n";
    
} catch (PDOException $e) {
    echo "\n❌ Migration error: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

