# Apache Configuration Guide for PHP Backend

## Step 1: Create .env File

### Option A: Using File Explorer
1. Navigate to: `C:\xampp\htdocs\Food-Delivery-App\backend-php\`
2. Copy `.env.example` and rename to `.env`
3. Open `.env` in Notepad
4. Update with your database credentials:

```env
DB_HOST=localhost
DB_NAME=mondas_db
DB_USER=root
DB_PASS=                    # Leave empty if no password
JWT_SECRET=your_super_secret_jwt_key_change_in_production
```

### Option B: Using PowerShell (Already Done)
The `.env` file has been created automatically. Just edit it with your database credentials.

---

## Step 2: Configure Apache Virtual Host

### Method 1: Using httpd-vhosts.conf (Recommended)

1. **Open XAMPP Control Panel**
   - Stop Apache if it's running

2. **Open httpd-vhosts.conf**
   - Location: `C:\xampp\apache\conf\extra\httpd-vhosts.conf`
   - Right-click → Open with Notepad++ or any text editor

3. **Add this configuration at the end of the file:**

```apache
# Mondas API - PHP Backend
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot "C:/xampp/htdocs"
    
    # Main Food-Delivery-App (React frontend)
    <Directory "C:/xampp/htdocs/Food-Delivery-App">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # PHP Backend API
    Alias /mondas-api "C:/xampp/htdocs/Food-Delivery-App/backend-php"
    <Directory "C:/xampp/htdocs/Food-Delivery-App/backend-php">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        DirectoryIndex index.php
    </Directory>
</VirtualHost>
```

4. **Enable virtual hosts in httpd.conf**
   - Open: `C:\xampp\apache\conf\httpd.conf`
   - Find this line (around line 480):
     ```apache
     #Include conf/extra/httpd-vhosts.conf
     ```
   - Remove the `#` to uncomment:
     ```apache
     Include conf/extra/httpd-vhosts.conf
     ```

5. **Save both files**

6. **Start Apache from XAMPP Control Panel**

---

### Method 2: Using .htaccess (Simpler - Already Created)

The `.htaccess` file is already in `backend-php/`. You just need to:

1. **Enable mod_rewrite in httpd.conf**
   - Open: `C:\xampp\apache\conf\httpd.conf`
   - Find: `#LoadModule rewrite_module modules/mod_rewrite.so`
   - Remove the `#`:
     ```apache
     LoadModule rewrite_module modules/mod_rewrite.so
     ```

2. **Ensure AllowOverride is set**
   - In `httpd.conf`, find the `<Directory>` section for your htdocs:
     ```apache
     <Directory "C:/xampp/htdocs">
         Options Indexes FollowSymLinks
         AllowOverride All    # Make sure this is "All", not "None"
         Require all granted
     </Directory>
     ```

3. **Restart Apache**

---

## Step 3: Test the Configuration

### Test 1: Health Check
Open browser and go to:
```
http://localhost/mondas-api/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "database": "connected",
  "version": "1.0.0",
  "timestamp": "2025-01-XX..."
}
```

### Test 2: Menu Endpoint
```
http://localhost/mondas-api/api/menu
```

**Expected Response:**
```json
{
  "success": true,
  "menuItems": [...]
}
```

### Test 3: Check Apache Error Log
If something doesn't work, check:
- `C:\xampp\apache\logs\error.log`

---

## Step 4: Verify Database Connection

1. **Open phpMyAdmin**: `http://localhost/phpmyadmin`
2. **Create database** (if not exists):
   ```sql
   CREATE DATABASE IF NOT EXISTS mondas_db;
   ```
3. **Import schema**: Run `backend-php/database/create_database.sql`

---

## Troubleshooting

### Issue: 404 Not Found
- **Solution**: Check that `mod_rewrite` is enabled
- **Solution**: Verify `.htaccess` file exists in `backend-php/`
- **Solution**: Check `AllowOverride All` in httpd.conf

### Issue: 500 Internal Server Error
- **Check**: `C:\xampp\apache\logs\error.log`
- **Common causes**: 
  - PHP syntax error
  - Database connection failed
  - Missing .env file

### Issue: CORS Errors
- **Solution**: CORS is already configured in `backend-php/config/cors.php`
- **Verify**: Check browser console for specific CORS error

### Issue: Database Connection Failed
- **Check**: `.env` file has correct credentials
- **Verify**: MySQL is running in XAMPP
- **Test**: Try connecting via phpMyAdmin

---

## Quick Verification Checklist

- [ ] `.env` file created in `backend-php/` with correct DB credentials
- [ ] `mod_rewrite` enabled in `httpd.conf`
- [ ] `AllowOverride All` set in `httpd.conf`
- [ ] Apache restarted
- [ ] `http://localhost/mondas-api/api/health` returns JSON
- [ ] Database `mondas_db` exists
- [ ] Frontend points to `http://localhost/mondas-api` (already done)

---

## Alternative: Direct Access (If Virtual Host Fails)

If virtual host doesn't work, you can access directly:
```
http://localhost/Food-Delivery-App/backend-php/api/index.php
```

But you'll need to update frontend `.env.local` to:
```
VITE_API_URL=http://localhost/Food-Delivery-App/backend-php/api
```




