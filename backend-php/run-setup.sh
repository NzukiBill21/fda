#!/bin/bash

echo "========================================"
echo "Monda Food Delivery - Database Setup"
echo "========================================"
echo ""

# Check if PHP is available
if ! command -v php &> /dev/null; then
    echo "ERROR: PHP is not installed or not in PATH"
    echo "Please install PHP"
    exit 1
fi

echo "Step 1: Creating .env file..."
php create-env.php
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to create .env file"
    exit 1
fi

echo ""
echo "Step 2: Setting up database..."
php setup-database.php
if [ $? -ne 0 ]; then
    echo "ERROR: Database setup failed"
    echo "Please check your MySQL credentials in .env file"
    exit 1
fi

echo ""
echo "Step 3: Migrating data from SQLite..."
php migrate-sqlite-to-mysql.php
if [ $? -ne 0 ]; then
    echo "WARNING: Migration failed or no SQLite database found"
    echo "This is OK if you don't have existing data"
fi

echo ""
echo "Step 4: Testing connection..."
php test-connection.php
if [ $? -ne 0 ]; then
    echo "ERROR: Connection test failed"
    exit 1
fi

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""

