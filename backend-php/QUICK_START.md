# Quick Start Guide

## 🚀 Fast Setup (3 Steps)

### Step 1: Create .env File

Copy the template and edit with your MySQL credentials:
```bash
cp ENV_TEMPLATE.txt .env
```

Edit `.env`:
```
DB_HOST=localhost
DB_NAME=monda_food_delivery
DB_USER=your_username
DB_PASS=your_password
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000
```

### Step 2: Run Setup Script

```bash
php setup-database.php
```

This will:
- ✅ Create MySQL database
- ✅ Import all tables
- ✅ Seed default roles

### Step 3: Migrate Data (If You Have Existing SQLite Data)

```bash
php migrate-sqlite-to-mysql.php
```

This will transfer all your data from `backend/prisma/dev.db` to MySQL.

## ✅ Verify Setup

Test your connection:
```bash
php test-connection.php
```

## 🎉 Done!

Your database is now ready. Next:
1. Configure your web server
2. Update frontend API URL
3. Test API endpoints

## 📝 All-in-One Setup

For interactive setup:
```bash
php quick-setup.php
```

This will guide you through all steps interactively.

