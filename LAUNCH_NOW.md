# 🚀 LAUNCH THE APP NOW

## Quick Launch Steps

### Step 1: Start XAMPP
1. Open **XAMPP Control Panel** (or double-click `START_XAMPP.bat`)
2. Click **START** for **Apache**
3. Click **START** for **MySQL**
4. Wait until both show **green "Running"**

### Step 2: Setup Database
Open PowerShell or Command Prompt in the project folder:
```bash
cd c:\xampp\htdocs\fda\backend-php
php setup-database.php
```

Or if PHP is not in PATH:
```bash
C:\xampp\php\php.exe setup-database.php
```

### Step 3: Access the App
Open your browser and go to:
```
http://localhost/fda/build/
```

## ✅ That's It!

Your app should now be running on XAMPP!

## 🧪 Test Backend
- Health Check: `http://localhost/fda/backend-php/health`
- Menu API: `http://localhost/fda/backend-php/api/menu`

## 🐛 If Not Working

1. **Apache not starting?**
   - Check if port 80 is in use
   - Run XAMPP as Administrator

2. **MySQL not starting?**
   - Check if port 3306 is in use
   - Run XAMPP as Administrator

3. **Page not loading?**
   - Check Apache is running (green in XAMPP)
   - Verify URL: `http://localhost/fda/build/`
   - Check browser console (F12) for errors

4. **Backend not working?**
   - Check `backend-php/.env` exists
   - Run `php setup-database.php`
   - Check `http://localhost/fda/backend-php/health`

---

**Ready to launch!** 🎉

