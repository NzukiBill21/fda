# 🎯 Quick Deployment Guide

## For XAMPP (Local Development)

1. **Start XAMPP**
   - Start Apache
   - Start MySQL

2. **Access Application**
   - Frontend: `http://localhost/fda/build/`
   - Backend: `http://localhost/fda/backend-php/`

3. **Setup Database**
   ```bash
   cd backend-php
   php setup-database.php
   ```

## For Shared Hosting (cPanel, Hostinger)

1. **Upload Files**
   - Upload `build/` → `public_html/`
   - Upload `backend-php/` → `public_html/api/`

2. **Create Database**
   - Create MySQL database via cPanel
   - Note database credentials

3. **Configure Backend**
   - Create `backend-php/.env` with database credentials
   - Run `php setup-database.php`

4. **Update Frontend**
   - Update API URLs to point to `/api/`

## For VPS/Cloud

1. **Install Requirements**
   - Nginx/Apache
   - PHP 7.4+
   - MySQL/MariaDB
   - Node.js (if using Node backend)

2. **Deploy**
   - Clone repository
   - Configure web server
   - Set up database
   - Configure environment variables

3. **Start Services**
   - Web server
   - Database
   - PHP-FPM (if using PHP backend)

---

**Need help?** Check `DEPLOYMENT_README.md` for detailed instructions.

