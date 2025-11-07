# 🚀 XAMPP Setup Guide

## Quick Start

1. **Start XAMPP**
   - Open XAMPP Control Panel
   - Start **Apache**
   - Start **MySQL**

2. **Access Application**
   - Frontend: `http://localhost/fda/build/`
   - Backend API: `http://localhost/fda/backend-php/`

## Database Setup

1. **Create Database**
   ```sql
   CREATE DATABASE monda_food_delivery;
   ```

2. **Configure Backend**
   - Navigate to `backend-php/` folder
   - Copy `ENV_TEMPLATE.txt` to `.env`
   - Edit `.env` with your MySQL credentials:
     ```env
     DB_HOST=localhost
     DB_NAME=monda_food_delivery
     DB_USER=root
     DB_PASS=
     JWT_SECRET=your_secret_key_min_32_chars
     CORS_ORIGIN=http://localhost
     ```

3. **Run Setup Script**
   ```bash
   cd backend-php
   php setup-database.php
   ```

## File Structure

```
htdocs/
└── fda/
    ├── build/              # Frontend (React app)
    ├── backend-php/        # PHP Backend API
    ├── src/                # Frontend source code
    └── ...
```

## API Endpoints

All API calls automatically use `/fda/backend-php/` when running on XAMPP.

- Health Check: `http://localhost/fda/backend-php/health`
- Menu API: `http://localhost/fda/backend-php/api/menu`
- Auth API: `http://localhost/fda/backend-php/api/auth/login`

## Troubleshooting

### Frontend not loading
- Check Apache is running
- Verify `build/` folder exists
- Check `.htaccess` file in `build/` folder

### API not working
- Check PHP is enabled in Apache
- Verify `backend-php/.env` exists and is configured
- Check database connection
- View error logs: `backend-php/logs/error.log`

### Database connection failed
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists
- Run `php test-connection.php` in `backend-php/`

## Default Credentials

After running `setup-database.php`, you can use:
- **Admin**: `admin@fooddelivery.com` / `admin123`
- **Customer**: `customer@test.com` / `customer123`

## Next Steps

1. ✅ Start Apache and MySQL
2. ✅ Setup database
3. ✅ Configure `.env` file
4. ✅ Access `http://localhost/fda/build/`
5. ✅ Test login and menu display

---

**Ready to use!** 🎉

