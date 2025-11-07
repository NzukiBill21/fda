# Database Setup Instructions

Follow these steps to set up your MySQL database and transfer data from SQLite.

## Step 1: Configure Environment Variables

1. Copy the environment template:
   ```bash
   cp ENV_TEMPLATE.txt .env
   ```

2. Edit `.env` file with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_NAME=monda_food_delivery
   DB_USER=your_mysql_username
   DB_PASS=your_mysql_password
   JWT_SECRET=your_jwt_secret_key
   CORS_ORIGIN=http://localhost:3000
   ```

## Step 2: Create Database and Import Schema

Run the setup script:
```bash
php setup-database.php
```

This will:
- ✅ Connect to MySQL server
- ✅ Create the database if it doesn't exist
- ✅ Import all tables and schema
- ✅ Seed default roles

## Step 3: Transfer Data from SQLite (If You Have Existing Data)

If you have an existing SQLite database with data, run:
```bash
php migrate-sqlite-to-mysql.php
```

This will:
- ✅ Connect to your SQLite database (`backend/prisma/dev.db`)
- ✅ Transfer all data to MySQL
- ✅ Preserve all relationships and foreign keys
- ✅ Show progress for each table

**Note:** If you don't have existing data, you can skip this step.

## Step 4: Test Database Connection

Verify everything is working:
```bash
php test-connection.php
```

This will:
- ✅ Test database connection
- ✅ List all tables and record counts
- ✅ Check roles, users, menu items, and orders

## Step 5: Update Frontend API URL

Update your frontend to point to the PHP backend:

1. Find your frontend API configuration (usually in `src/config/api.ts` or similar)
2. Change the API URL from `http://localhost:5000` to your PHP backend URL
3. For local development: `http://localhost/backend-php` or your configured path
4. For production: `https://yourdomain.com/api` or your configured path

## Troubleshooting

### Database Connection Error
- Check MySQL server is running
- Verify credentials in `.env` file
- Ensure user has CREATE DATABASE privileges
- Check firewall settings

### Migration Errors
- Ensure SQLite database exists at `backend/prisma/dev.db`
- Check file permissions
- Verify MySQL tables were created successfully
- Check for data type mismatches

### Missing Tables
- Run `setup-database.php` again
- Check `database/schema.sql` file exists
- Verify MySQL user has CREATE TABLE privileges

### Foreign Key Errors
- Ensure tables are created in correct order
- Check that referenced tables exist
- Verify foreign key constraints in schema

## Manual Database Setup (Alternative)

If the scripts don't work, you can set up manually:

1. **Create database:**
   ```sql
   CREATE DATABASE monda_food_delivery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Import schema:**
   ```bash
   mysql -u your_username -p monda_food_delivery < database/schema.sql
   ```

3. **Verify tables:**
   ```sql
   USE monda_food_delivery;
   SHOW TABLES;
   ```

## Next Steps

After database setup:
1. ✅ Configure web server (Apache/Nginx)
2. ✅ Point document root to `backend-php/` directory
3. ✅ Test API endpoints
4. ✅ Update frontend API URL
5. ✅ Deploy to production

## Support

If you encounter issues:
1. Check PHP error logs
2. Check MySQL error logs
3. Verify all file permissions
4. Ensure PHP extensions are installed (PDO, PDO_MySQL)

