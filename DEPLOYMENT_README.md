# 🚀 Monda Food Delivery App - Deployment Repository

This repository contains the production-ready Monda Food Delivery Application.

## 📁 Repository Structure

```
fda/
├── build/                 # Production frontend build (React/Vite)
├── backend-php/          # PHP Backend API (for XAMPP/hosting)
├── backend/              # Node.js Backend (alternative)
├── src/                  # Frontend source code
├── public/               # Public assets
└── README.md            # Main documentation
```

## 🌐 Deployment Options

### Option 1: XAMPP (Local/Shared Hosting)
- **Frontend**: `http://localhost/fda/build/`
- **Backend**: `http://localhost/fda/backend-php/`
- Requires: Apache, MySQL, PHP 7.4+

### Option 2: Shared Hosting (cPanel, Hostinger, etc.)
- Upload `build/` folder contents to `public_html/`
- Upload `backend-php/` to `api/` or subdomain
- Configure MySQL database
- Set up `.env` file in `backend-php/`

### Option 3: VPS/Cloud (Nginx, Apache)
- Serve `build/` as static files
- Run PHP backend via PHP-FPM
- Configure reverse proxy if needed

## 🔧 Quick Setup for Hosting

### 1. Database Setup
```bash
cd backend-php
php setup-database.php
```

### 2. Environment Configuration
Create `backend-php/.env`:
```env
DB_HOST=localhost
DB_NAME=monda_food_delivery
DB_USER=your_username
DB_PASS=your_password
JWT_SECRET=your_secret_key_min_32_chars
CORS_ORIGIN=https://yourdomain.com
```

### 3. Frontend API Configuration
Update API URLs in `build/` files to point to your backend:
- Search for `localhost:5000` and replace with your API URL
- Or rebuild frontend with correct API URL

## 📦 What's Included

✅ Production-ready frontend build  
✅ PHP backend API (XAMPP compatible)  
✅ Node.js backend (alternative)  
✅ Database schema and migrations  
✅ Complete documentation  
✅ Deployment scripts  

## 🔐 Security Notes

- **Never commit** `.env` files
- Use strong `JWT_SECRET` in production
- Enable HTTPS in production
- Configure CORS properly
- Set proper file permissions

## 📝 Pre-Deployment Checklist

- [ ] Database created and configured
- [ ] `.env` file created (not committed)
- [ ] API URLs updated in frontend
- [ ] CORS configured for your domain
- [ ] SSL certificate installed (production)
- [ ] File permissions set correctly
- [ ] Error logging configured
- [ ] Backup strategy in place

## 🚀 Deployment Steps

1. **Clone/Download** this repository
2. **Upload** files to your hosting
3. **Create** MySQL database
4. **Run** `backend-php/setup-database.php`
5. **Configure** `.env` file
6. **Update** frontend API URLs
7. **Test** all endpoints
8. **Go Live!** 🎉

## 📞 Support

For deployment issues, check:
- `DEPLOYMENT_GUIDE.md`
- `HOSTINGER_DEPLOYMENT.md`
- `backend-php/README.md`

## 📄 License

[Your License Here]

---

**Ready to deploy!** 🚀

