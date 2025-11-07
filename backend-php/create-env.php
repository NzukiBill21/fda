<?php
/**
 * Create .env file from template
 */

$envFile = __DIR__ . '/.env';
$templateFile = __DIR__ . '/ENV_TEMPLATE.txt';

if (file_exists($envFile)) {
    echo "⚠️  .env file already exists. Overwriting...\n";
}

if (!file_exists($templateFile)) {
    echo "❌ Template file not found: {$templateFile}\n";
    exit(1);
}

// Copy template
copy($templateFile, $envFile);

echo "✅ .env file created from template!\n";
echo "📝 Please edit .env file with your MySQL credentials:\n";
echo "   - DB_HOST (usually localhost)\n";
echo "   - DB_NAME (monda_food_delivery)\n";
echo "   - DB_USER (your MySQL username)\n";
echo "   - DB_PASS (your MySQL password)\n";
echo "\n";

