#!/bin/bash

# Complete Database Setup Script
# This script does EVERYTHING: creates .env, sets up database, migrates data, and verifies

set -e  # Exit on any error

echo "=========================================="
echo "🚀 Monda Food Delivery - Complete Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PHP is available
if ! command -v php &> /dev/null; then
    echo -e "${RED}❌ ERROR: PHP is not installed or not in PATH${NC}"
    echo "Please install PHP 7.4+ and add it to your PATH"
    exit 1
fi

echo -e "${GREEN}✅ PHP found: $(php -v | head -n 1)${NC}"
echo ""

# Step 1: Create .env file
echo "=========================================="
echo "Step 1: Creating .env file"
echo "=========================================="
php create-env.php
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to create .env file${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Please edit .env file with your MySQL credentials:${NC}"
echo "   - DB_HOST (usually localhost)"
echo "   - DB_NAME (monda_food_delivery)"
echo "   - DB_USER (your MySQL username)"
echo "   - DB_PASS (your MySQL password)"
echo ""
read -p "Press Enter after you've edited .env file with your MySQL credentials..."

# Step 2: Setup database
echo ""
echo "=========================================="
echo "Step 2: Setting up MySQL database"
echo "=========================================="
php setup-database.php
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Database setup failed${NC}"
    echo "Please check your MySQL credentials in .env file"
    exit 1
fi

# Step 3: Migrate data
echo ""
echo "=========================================="
echo "Step 3: Migrating data from SQLite"
echo "=========================================="
php migrate-sqlite-to-mysql.php
MIGRATION_EXIT_CODE=$?
if [ $MIGRATION_EXIT_CODE -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Migration failed or no SQLite database found${NC}"
    echo "This is OK if you don't have existing data"
else
    echo -e "${GREEN}✅ Data migration completed${NC}"
fi

# Step 4: Verify everything
echo ""
echo "=========================================="
echo "Step 4: Verifying setup"
echo "=========================================="
php verify-migration.php
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Verification failed${NC}"
    exit 1
fi

# Final summary
echo ""
echo "=========================================="
echo -e "${GREEN}🎉 SETUP COMPLETE!${NC}"
echo "=========================================="
echo ""
echo "✅ Database created and configured"
echo "✅ Schema imported"
echo "✅ Data migrated (if applicable)"
echo "✅ All relationships verified"
echo ""
echo "Your PHP backend is ready to host!"
echo ""
echo "Next steps:"
echo "1. Configure your web server (Apache/Nginx)"
echo "2. Point document root to: $(pwd)"
echo "3. Update frontend API URL to point to this backend"
echo "4. Test API endpoints"
echo ""

