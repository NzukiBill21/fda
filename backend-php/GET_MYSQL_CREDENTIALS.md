# 🔑 How to Get MySQL Credentials from Hostinger

## Where to Find Your MySQL Credentials

### Option 1: Hostinger hPanel (Most Common)

1. **Login to Hostinger hPanel**
   - Go to https://hpanel.hostinger.com
   - Login with your Hostinger account

2. **Navigate to Databases**
   - Click on **"Databases"** in the left menu
   - Or search for "MySQL Databases"

3. **Find Your Database**
   - You'll see a list of databases
   - Look for your database name (or create a new one)
   - Note down:
     - **Database Name** (e.g., `u123456789_mondas`)
     - **Database Username** (e.g., `u123456789_admin`)
     - **Database Password** (click "Show" to reveal)
     - **Database Host** (usually `localhost` or `mysql.hostinger.com`)

4. **Create Database (If Needed)**
   - Click "Create Database"
   - Name it: `monda_food_delivery` or similar
   - Note the username and password created

### Option 2: Hostinger File Manager

1. **Login to File Manager**
   - In hPanel, go to **"Files"** → **"File Manager"**

2. **Check for Configuration Files**
   - Look for `wp-config.php` (if WordPress) or other config files
   - These might contain database credentials

### Option 3: Contact Hostinger Support

If you can't find credentials:
- Contact Hostinger support
- Ask for: MySQL database name, username, password, and host
- They'll provide these in your support ticket

## 📝 What You Need

You need these 4 pieces of information:

1. **DB_HOST** - Usually `localhost` or `mysql.hostinger.com`
2. **DB_NAME** - Your database name (e.g., `u123456789_mondas`)
3. **DB_USER** - Your database username (e.g., `u123456789_admin`)
4. **DB_PASS** - Your database password

## 🔧 How to Edit .env File

### Method 1: Using Notepad (Windows)

1. Navigate to: `C:\Users\billn\Downloads\Food Delivery App\backend-php`
2. Right-click on `.env` file
3. Select "Open with" → "Notepad"
4. Edit these lines:
   ```
   DB_HOST=localhost
   DB_NAME=your_database_name_here
   DB_USER=your_username_here
   DB_PASS=your_password_here
   ```
5. Save the file

### Method 2: Using VS Code

1. Open VS Code
2. File → Open Folder
3. Navigate to `backend-php` folder
4. Open `.env` file
5. Edit and save

### Method 3: Using Command Line (Git Bash)

```bash
cd "C:/Users/billn/Downloads/Food Delivery App/backend-php"
nano .env
# Or
notepad .env
```

## ✅ Example .env File

After editing, your `.env` should look like:

```
# Database Configuration
DB_HOST=localhost
DB_NAME=u123456789_mondas
DB_USER=u123456789_admin
DB_PASS=YourActualPassword123!

# JWT Secret (Change this in production!)
JWT_SECRET=super_secret_jwt_key_for_monda_app_change_in_production_min_32_chars

# CORS Origins (comma-separated)
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Environment
NODE_ENV=production
```

## ⚠️ Important Notes

- **Never commit .env to Git** - It contains sensitive credentials
- **Keep password secure** - Don't share it
- **Test connection** - After editing, run `php test-connection.php` to verify

## 🎯 Quick Checklist

- [ ] Logged into Hostinger hPanel
- [ ] Found MySQL Databases section
- [ ] Noted database name
- [ ] Noted database username
- [ ] Noted database password
- [ ] Noted database host (usually localhost)
- [ ] Edited .env file with these credentials
- [ ] Saved .env file

## 🚀 After Getting Credentials

Once you have the credentials:

1. Edit `.env` file with your credentials
2. Run: `php setup-database.php`
3. Run: `php migrate-sqlite-to-mysql.php`
4. Run: `php verify-migration.php`

Then you're done! 🎉

