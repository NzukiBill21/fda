<?php
/**
 * Interactive .env Editor
 * Helps you edit .env file with MySQL credentials
 */

$envFile = __DIR__ . '/.env';

echo "==========================================\n";
echo "🔧 .env File Editor\n";
echo "==========================================\n\n";

// Check if .env exists
if (!file_exists($envFile)) {
    echo "⚠️  .env file not found. Creating from template...\n";
    $templateFile = __DIR__ . '/ENV_TEMPLATE.txt';
    if (file_exists($templateFile)) {
        copy($templateFile, $envFile);
        echo "✅ .env file created!\n\n";
    } else {
        echo "❌ Template file not found!\n";
        exit(1);
    }
}

// Read current .env
$envContent = file_get_contents($envFile);
$lines = explode("\n", $envContent);

echo "Current .env file location: {$envFile}\n\n";

// Show current values (masked)
echo "Current Configuration:\n";
echo str_repeat("-", 50) . "\n";
foreach ($lines as $line) {
    $line = trim($line);
    if (empty($line) || strpos($line, '#') === 0) {
        continue;
    }
    if (strpos($line, '=') === false) {
        continue;
    }
    list($key, $value) = explode('=', $line, 2);
    $key = trim($key);
    $value = trim($value);
    
    // Mask password
    if (strpos($key, 'PASS') !== false || strpos($key, 'SECRET') !== false) {
        $value = str_repeat('*', min(strlen($value), 20));
    }
    
    echo sprintf("%-20s = %s\n", $key, $value);
}
echo str_repeat("-", 50) . "\n\n";

echo "📝 To edit .env file:\n\n";
echo "Option 1: Open in Notepad\n";
echo "   notepad {$envFile}\n\n";
echo "Option 2: Open in VS Code\n";
echo "   code {$envFile}\n\n";
echo "Option 3: Edit manually\n";
echo "   Location: {$envFile}\n\n";

echo "🔑 You need to edit these values:\n";
echo "   - DB_HOST (usually localhost)\n";
echo "   - DB_NAME (your MySQL database name)\n";
echo "   - DB_USER (your MySQL username)\n";
echo "   - DB_PASS (your MySQL password)\n\n";

echo "📖 Where to get MySQL credentials:\n";
echo "   1. Login to Hostinger hPanel\n";
echo "   2. Go to Databases → MySQL Databases\n";
echo "   3. Find your database and note:\n";
echo "      - Database Name\n";
echo "      - Database Username\n";
echo "      - Database Password\n";
echo "      - Database Host (usually localhost)\n\n";

echo "✅ After editing, save the file and run:\n";
echo "   php setup-database.php\n\n";

