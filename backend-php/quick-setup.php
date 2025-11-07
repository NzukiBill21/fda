<?php
/**
 * Quick Setup Script
 * Interactive setup for database configuration
 */

echo "🚀 Monda Food Delivery - PHP Backend Setup\n";
echo "==========================================\n\n";

// Check if .env exists
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    echo "⚠️  .env file already exists.\n";
    echo "Do you want to overwrite it? (y/n): ";
    $handle = fopen("php://stdin", "r");
    $line = trim(fgets($handle));
    fclose($handle);
    
    if (strtolower($line) !== 'y') {
        echo "ℹ️  Keeping existing .env file.\n\n";
    } else {
        createEnvFile();
    }
} else {
    createEnvFile();
}

// Run database setup
echo "\n📦 Setting up database...\n";
include __DIR__ . '/setup-database.php';

// Check for SQLite database
$sqlitePath = __DIR__ . '/../backend/prisma/dev.db';
if (file_exists($sqlitePath)) {
    echo "\n📥 SQLite database found. Do you want to migrate data? (y/n): ";
    $handle = fopen("php://stdin", "r");
    $line = trim(fgets($handle));
    fclose($handle);
    
    if (strtolower($line) === 'y') {
        echo "\n🔄 Migrating data from SQLite...\n";
        include __DIR__ . '/migrate-sqlite-to-mysql.php';
    }
} else {
    echo "\nℹ️  No SQLite database found. Skipping migration.\n";
}

// Test connection
echo "\n🔍 Testing connection...\n";
include __DIR__ . '/test-connection.php';

echo "\n✅ Setup complete!\n";
echo "\n📝 Next steps:\n";
echo "   1. Configure your web server\n";
echo "   2. Update frontend API URL\n";
echo "   3. Test API endpoints\n";

function createEnvFile() {
    echo "📝 Creating .env file...\n\n";
    
    echo "Enter MySQL host (default: localhost): ";
    $host = readInput('localhost');
    
    echo "Enter MySQL database name (default: monda_food_delivery): ";
    $dbname = readInput('monda_food_delivery');
    
    echo "Enter MySQL username (default: root): ";
    $username = readInput('root');
    
    echo "Enter MySQL password: ";
    $password = readInput('');
    
    echo "Enter JWT secret (default: auto-generated): ";
    $jwtSecret = readInput(bin2hex(random_bytes(32)));
    
    echo "Enter CORS origins (comma-separated, default: http://localhost:3000): ";
    $corsOrigin = readInput('http://localhost:3000');
    
    $envContent = <<<ENV
# Database Configuration
DB_HOST={$host}
DB_NAME={$dbname}
DB_USER={$username}
DB_PASS={$password}

# JWT Secret
JWT_SECRET={$jwtSecret}

# CORS Origins (comma-separated)
CORS_ORIGIN={$corsOrigin}

# Environment
NODE_ENV=production
ENV;
    
    file_put_contents(__DIR__ . '/.env', $envContent);
    echo "✅ .env file created!\n\n";
}

function readInput($default = '') {
    $handle = fopen("php://stdin", "r");
    $line = trim(fgets($handle));
    fclose($handle);
    return !empty($line) ? $line : $default;
}

