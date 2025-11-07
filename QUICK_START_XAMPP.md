# ⚡ Quick Start - XAMPP

## 🚀 3 Simple Steps

### Step 1: Start XAMPP
1. Open **XAMPP Control Panel**
2. Click **Start** for **Apache**
3. Click **Start** for **MySQL**

### Step 2: Setup Database
```bash
# Navigate to backend-php folder
cd backend-php

# Create .env file (if not exists)
copy ENV_TEMPLATE.txt .env

# Edit .env with your MySQL credentials:
# DB_HOST=localhost
# DB_NAME=monda_food_delivery
# DB_USER=root
# DB_PASS= (leave empty for default XAMPP)

# Run setup
php setup-database.php
```

### Step 3: Access Application
- **Frontend**: http://localhost/fda/build/
- **Backend API**: http://localhost/fda/backend-php/

## ✅ That's It!

Your application is now running on XAMPP!

## 🔑 Default Login Credentials

After database setup:
- **Admin**: `admin@fooddelivery.com` / `admin123`
- **Customer**: `customer@test.com` / `customer123`

## 🐛 Troubleshooting

**Frontend not loading?**
- Check Apache is running
- Verify URL: `http://localhost/fda/build/`

**API not working?**
- Check PHP is enabled
- Verify `backend-php/.env` exists
- Check database connection

**Database error?**
- Verify MySQL is running
- Check database credentials in `.env`
- Run `php test-connection.php` in `backend-php/`

---

**Need more help?** See `XAMPP_SETUP.md` for detailed instructions.

