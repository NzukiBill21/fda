# 🚨 RESTART APACHE NOW!

## Apache Configuration Complete ✅

The Apache virtual host has been configured. **You MUST restart Apache for changes to take effect.**

---

## Steps to Restart Apache:

1. **Open XAMPP Control Panel**
   - Look for the XAMPP icon in your system tray, or
   - Open it from Start Menu

2. **Stop Apache**
   - Click the **"Stop"** button next to Apache
   - Wait 2-3 seconds until it shows "Stopped"

3. **Start Apache**
   - Click the **"Start"** button next to Apache
   - Wait until it shows "Running" (green)

---

## Test the Configuration:

After restarting, open your browser and go to:

```
http://localhost/mondas-api/api/health
```

**Expected Response:**
```json
{
  "status": "OK",
  "database": "connected",
  "version": "1.0.0",
  "timestamp": "2025-01-12T..."
}
```

---

## If You Still Get 404:

1. **Check Apache Error Log:**
   - `C:\xampp\apache\logs\error.log`
   - Look for any errors related to "mondas-api"

2. **Verify Configuration:**
   - Open: `C:\xampp\apache\conf\extra\httpd-vhosts.conf`
   - Make sure you see the Alias line:
     ```apache
     Alias /mondas-api "C:/xampp/htdocs/Food-Delivery-App/backend-php"
     ```

3. **Check mod_rewrite:**
   - Open: `C:\xampp\apache\conf\httpd.conf`
   - Search for: `LoadModule rewrite_module`
   - Make sure it's NOT commented (no `#` at the start)

---

## Quick Test Commands:

After restarting Apache, you can test with PowerShell:

```powershell
# Test health endpoint
Invoke-WebRequest -Uri "http://localhost/mondas-api/api/health" | Select-Object StatusCode, Content
```

---

**Remember: Apache must be restarted for the configuration to take effect!**



