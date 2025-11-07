# Complete Database Setup Guide

## 🚀 Automated Setup (Recommended)

### For Windows:
```bash
run-setup.bat
```

### For Linux/Mac/Bash:
```bash
chmod +x run-setup.sh
./run-setup.sh
```

This will automatically:
1. ✅ Create .env file
2. ✅ Setup MySQL database
3. ✅ Migrate data from SQLite
4. ✅ Test connection

## 📝 Manual Setup

### Step 1: Create .env File

**Option A: Use the script**
```bash
php create-env.php
```

**Option B: Manual copy**
```bash
cp ENV_TEMPLATE.txt .env
```

Then edit `.env` with your MySQL credentials:
```
DB_HOST=localhost
DB_NAME=monda_food_delivery
DB_USER=your_mysql_username
DB_PASS=your_mysql_password
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:3000
```

### Step 2: Setup Database

```bash
php setup-database.php
```

This will:
- Connect to MySQL
- Create database `monda_food_delivery`
- Import all tables
- Seed default roles

### Step 3: Migrate Existing Data

```bash
php migrate-sqlite-to-mysql.php
```

This will transfer all data from `backend/prisma/dev.db` to MySQL.

**Note:** If you don't have existing data, you can skip this step.

### Step 4: Verify Setup

```bash
php test-connection.php
```

This will:
- Test database connection
- List all tables
- Show record counts
- Verify roles are seeded

## ✅ Verification Checklist

After running setup, verify:

- [ ] `.env` file exists with correct credentials
- [ ] Database `monda_food_delivery` exists
- [ ] All 9 tables created (users, roles, menu_items, orders, etc.)
- [ ] Default roles seeded (SUPER_ADMIN, ADMIN, USER, DELIVERY_GUY, CATERER)
- [ ] Data migrated (if you had existing SQLite data)
- [ ] Connection test passes

## 🔧 Troubleshooting

### PHP Not Found
- Install PHP 7.4+ from https://www.php.net/downloads
- Add PHP to your PATH
- Restart terminal

### MySQL Connection Error
- Check MySQL server is running
- Verify credentials in `.env`
- Ensure user has CREATE DATABASE privileges
- Check firewall settings

### Migration Errors
- Ensure SQLite database exists at `../backend/prisma/dev.db`
- Check file permissions
- Verify MySQL tables were created first

### Permission Errors
- Ensure PHP has read/write permissions
- Check MySQL user has necessary privileges
- Verify database user can create tables

## 📊 Expected Results

After successful setup, you should see:

```
✅ Database connection successful!
✅ Found 9 tables:
   - users: X records
   - roles: 6 records
   - user_roles: X records
   - menu_items: X records
   - orders: X records
   - order_items: X records
   - order_tracking: X records
   - delivery_guy_profiles: X records
   - activity_logs: X records
✅ Found 6 roles:
   - SUPER_ADMIN: Super Administrator with full system access
   - ADMIN: Administrator with management access
   - SUB_ADMIN: Sub Administrator with limited access
   - USER: Regular user
   - DELIVERY_GUY: Delivery personnel
   - CATERER: Kitchen staff
```

## 🎉 Next Steps

Once setup is complete:

1. **Configure Web Server**
   - Point document root to `backend-php/`
   - Ensure `.htaccess` is enabled (Apache)
   - Configure URL rewriting (Nginx)

2. **Update Frontend**
   - Change API URL from `http://localhost:5000` to your PHP backend URL
   - Test API endpoints

3. **Deploy to Hostinger**
   - Upload all files to your hosting
   - Update `.env` with production credentials
   - Run setup scripts on server
   - Test production endpoints

## 📞 Support

If you encounter issues:
1. Check PHP error logs
2. Check MySQL error logs
3. Verify all file permissions
4. Ensure PHP extensions are installed (PDO, PDO_MySQL)

