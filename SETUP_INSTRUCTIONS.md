# Quick Setup Instructions

## ✅ Step 1: Create .env File (DONE!)

The `.env` file has been created at:
```
C:\xampp\htdocs\Food-Delivery-App\backend-php\.env
```

**Edit it if your MySQL has a password:**
1. Open: `backend-php\.env` in Notepad
2. If your MySQL root user has a password, add it:
   ```
   DB_PASS=your_mysql_password
   ```
3. Save the file

---

## ✅ Step 2: Configure Apache (ALREADY CHECKED!)

Good news! Your Apache is already configured:
- ✅ `mod_rewrite` is ENABLED
- ✅ Virtual hosts are ENABLED

**You just need to add the virtual host entry:**

### Quick Method:

1. **Open**: `C:\xampp\apache\conf\extra\httpd-vhosts.conf`

2. **Add this at the end of the file:**

```apache
# Mondas API - PHP Backend
<VirtualHost *:80>
    ServerName localhost
    
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

3. **Save the file**

4. **Restart Apache** from XAMPP Control Panel

---

## ✅ Step 3: Test It!

1. **Open browser**: `http://localhost/mondas-api/api/health`

2. **You should see:**
```json
{
  "status": "OK",
  "database": "connected",
  "version": "1.0.0",
  "timestamp": "..."
}
```

3. **If you see this, it's working!** ✅

---

## 🐛 Troubleshooting

### If you get 404:
- Make sure Apache is restarted
- Check that the virtual host was added correctly
- Verify the path in the Alias matches your actual path

### If you get 500 error:
- Check: `C:\xampp\apache\logs\error.log`
- Make sure `.env` file exists in `backend-php/`
- Verify database credentials in `.env`

### If database connection fails:
- Make sure MySQL is running in XAMPP
- Check database name in `.env` matches your database
- Verify username/password in `.env`

---

## 📝 Summary

1. ✅ `.env` file created (edit if MySQL has password)
2. ⚠️  Add virtual host to `httpd-vhosts.conf` (see above)
3. ✅ Restart Apache
4. ✅ Test: `http://localhost/mondas-api/api/health`

That's it! Your PHP backend will be ready to use.




