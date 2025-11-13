# Database Connection Fix

## Issue
The API was returning: `{"status":"ERROR","database":"disconnected"}`

## Fixes Applied

### 1. ✅ Fixed Health Check Endpoint
- **Problem**: The health check was missing the `Database::testConnection()` call
- **Fixed**: Added proper database connection test in `backend-php/api/index.php`

### 2. ⚠️ Start MySQL
The database connection requires MySQL to be running.

---

## Steps to Fix

### Step 1: Start MySQL

1. **Open XAMPP Control Panel**
   - Look for XAMPP icon in system tray, or
   - Open from Start Menu

2. **Start MySQL**
   - Click **"Start"** button next to MySQL
   - Wait until it shows **"Running"** (green status)

3. **Verify MySQL is Running**
   - You should see "Running" in green next to MySQL
   - Port should show `3306`

---

### Step 2: Test the Connection

After starting MySQL, test the API:

```
http://localhost/mondas-api/api/health
```

**Expected Response (Success):**
```json
{
  "status": "OK",
  "database": "connected",
  "version": "1.0.0",
  "timestamp": "2025-11-12T..."
}
```

---

## Database Configuration

The PHP backend is configured to connect to:

- **Host**: `localhost`
- **Database**: `u614661615_mondas`
- **User**: `root`
- **Password**: (empty - default XAMPP)

These settings are in:
- `backend-php/.env`
- `backend-php/config/database.php`

---

## Troubleshooting

### If MySQL Won't Start:

1. **Check Port 3306**
   - Another application might be using port 3306
   - Check XAMPP Control Panel for port conflicts

2. **Check MySQL Logs**
   - `C:\xampp\mysql\data\mysql_error.log`
   - Look for error messages

3. **Try Restarting MySQL**
   - Stop MySQL in XAMPP
   - Wait 5 seconds
   - Start MySQL again

### If Database Still Not Connecting:

1. **Verify Database Exists**
   - Open phpMyAdmin: `http://localhost/phpmyadmin`
   - Check if `u614661615_mondas` database exists
   - If not, create it or update `.env` with correct database name

2. **Check Database Credentials**
   - Open: `backend-php/.env`
   - Verify:
     ```
     DB_HOST=localhost
     DB_NAME=u614661615_mondas
     DB_USER=root
     DB_PASS=
     ```
   - If your MySQL has a password, add it to `DB_PASS=`

3. **Check Apache Error Log**
   - `C:\xampp\apache\logs\error.log`
   - Look for PHP/PDO errors

---

## Quick Test

After starting MySQL, you can test the connection with:

```powershell
# Test health endpoint
Invoke-WebRequest -Uri "http://localhost/mondas-api/api/health" | Select-Object StatusCode, Content
```

Or open in browser:
```
http://localhost/mondas-api/api/health
```

---

**Remember: Both Apache AND MySQL must be running for the app to work!**



