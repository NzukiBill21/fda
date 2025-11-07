# 📍 Where is the .env File?

## ✅ Location

The `.env` file is located at:

```
C:\Users\billn\Downloads\Food Delivery App\backend-php\.env
```

## 🔍 How to Find It

### Method 1: File Explorer
1. Open File Explorer
2. Navigate to: `C:\Users\billn\Downloads\Food Delivery App\backend-php`
3. Look for `.env` file (it might be hidden, enable "Show hidden files")

### Method 2: Command Line
```bash
cd "C:/Users/billn/Downloads/Food Delivery App/backend-php"
ls -la .env
```

### Method 3: VS Code
1. Open VS Code
2. File → Open Folder
3. Navigate to `backend-php` folder
4. You'll see `.env` in the file list

## 📝 How to Edit It

### Windows Notepad:
```bash
notepad "C:\Users\billn\Downloads\Food Delivery App\backend-php\.env"
```

### VS Code:
```bash
code "C:\Users\billn\Downloads\Food Delivery App\backend-php\.env"
```

### Or use the helper script:
```bash
cd "C:/Users/billn/Downloads/Food Delivery App/backend-php"
php edit-env.php
```

## 🔑 What to Edit

Open the `.env` file and change these 4 lines:

```
DB_HOST=localhost              ← Usually "localhost" for Hostinger
DB_NAME=monda_food_delivery    ← Your MySQL database name from Hostinger
DB_USER=root                   ← Your MySQL username from Hostinger
DB_PASS=                       ← Your MySQL password from Hostinger
```

## 📖 Where to Get MySQL Credentials

**From Hostinger hPanel:**

1. Login: https://hpanel.hostinger.com
2. Go to: **Databases** → **MySQL Databases**
3. You'll see:
   - Database Name (e.g., `u123456789_mondas`)
   - Database Username (e.g., `u123456789_admin`)
   - Database Password (click "Show" to see it)
   - Database Host (usually `localhost`)

**Copy these values into your .env file!**

## ✅ After Editing

1. Save the `.env` file
2. Run: `php setup-database.php`
3. Run: `php migrate-sqlite-to-mysql.php`
4. Run: `php verify-migration.php`

Then you're done! 🎉

