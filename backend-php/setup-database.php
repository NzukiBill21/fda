<?php
/**
 * Database Setup Script
 * Creates database and imports schema
 */

require_once __DIR__ . '/config/config.php';

// Load environment variables
$envFile = __DIR__ . '/.env';
if (!file_exists($envFile)) {
    echo "❌ .env file not found!\n";
    echo "ℹ️  Please copy ENV_TEMPLATE.txt to .env and configure your database credentials.\n";
    exit(1);
}

$lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($lines as $line) {
    if (strpos(trim($line), '#') === 0) continue;
    if (strpos($line, '=') === false) continue;
    list($name, $value) = explode('=', $line, 2);
    $_ENV[trim($name)] = trim($value);
}

$host = $_ENV['DB_HOST'] ?? 'localhost';
$dbname = $_ENV['DB_NAME'] ?? 'monda_food_delivery';
$username = $_ENV['DB_USER'] ?? 'root';
$password = $_ENV['DB_PASS'] ?? '';

echo "🔧 Setting up database...\n\n";

try {
    // Connect to MySQL server (without database)
    $dsn = "mysql:host={$host};charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    
    echo "✅ Connected to MySQL server\n";
    
    // Create database if it doesn't exist
    echo "📦 Creating database '{$dbname}'...\n";
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbname}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "✅ Database created/exists\n";
    
    // Select database
    $pdo->exec("USE `{$dbname}`");
    
    // Read and execute schema file
    $schemaFile = __DIR__ . '/database/schema.sql';
    if (!file_exists($schemaFile)) {
        echo "❌ Schema file not found: {$schemaFile}\n";
        exit(1);
    }
    
    echo "📥 Importing schema...\n";
    $schema = file_get_contents($schemaFile);
    
    // Split by semicolons and execute each statement
    $statements = array_filter(
        array_map('trim', explode(';', $schema)),
        function($stmt) {
            return !empty($stmt) && 
                   strpos($stmt, '--') !== 0 && 
                   strpos(strtoupper($stmt), 'SET') === false;
        }
    );
    
    foreach ($statements as $statement) {
        if (empty(trim($statement))) continue;
        try {
            $pdo->exec($statement);
        } catch (PDOException $e) {
            // Ignore "table already exists" errors
            if (strpos($e->getMessage(), 'already exists') === false) {
                echo "⚠️  Warning: " . $e->getMessage() . "\n";
            }
        }
    }
    
    echo "✅ Schema imported successfully\n";
    
    // Check tables
    $tablesStmt = $pdo->query("SHOW TABLES");
    $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "\n📊 Database tables created:\n";
    foreach ($tables as $table) {
        $countStmt = $pdo->query("SELECT COUNT(*) FROM `{$table}`");
        $count = $countStmt->fetchColumn();
        echo "   - {$table} ({$count} records)\n";
    }
    
    echo "\n🎉 Database setup completed successfully!\n";
    echo "\n📝 Next steps:\n";
    echo "   1. Run 'php migrate-sqlite-to-mysql.php' to transfer data from SQLite (if you have existing data)\n";
    echo "   2. Update your frontend API URL to point to this PHP backend\n";
    echo "   3. Test the API endpoints\n";
    
} catch (PDOException $e) {
    echo "\n❌ Database error: " . $e->getMessage() . "\n";
    echo "\n💡 Troubleshooting:\n";
    echo "   - Check your database credentials in .env file\n";
    echo "   - Ensure MySQL server is running\n";
    echo "   - Verify user has CREATE DATABASE privileges\n";
    exit(1);
} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}

