# 🍔 Monda Food Delivery App

A professional, modern food delivery application with complete RBAC (Role-Based Access Control) system, beautiful UI, and full-stack implementation.

---

## 🚀 Quick Start

**IMPORTANT**: This app uses PHP backend with MySQL database, served via XAMPP

### **Prerequisites**
- XAMPP installed and running
- Apache and MySQL services started
- Node.js (for frontend build only)

### **Setup Steps**

1. **Start XAMPP Services**
   - Open XAMPP Control Panel
   - Start Apache
   - Start MySQL

2. **Database Setup**
   - Import database: `database/create_database.sql`
   - Or use existing database: `u614661615_mondas`

3. **Backend Configuration**
   - Backend is at: `http://localhost/mondas-api`
   - Configure in: `backend-php/.env`
   - Database config: `backend-php/config/database.php`

4. **Frontend Build**
   ```powershell
   npm install
   npm run build
   ```

5. **Access Application**
   - Frontend: `http://localhost/Food-Delivery-App/`
   - Backend API: `http://localhost/mondas-api/api/health`

---

## 🔐 Login Credentials

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| 👑 **Super Admin** | admin@monda.com | admin123 | Purple - Full system control |
| 💼 **Admin** | manager@monda.com | admin123 | Pink - Analytics & role management |
| 🚗 **Delivery Guy** | delivery@monda.com | admin123 | Green - Delivery management |
| 🛍️ **Customer** | customer@test.com | customer123 | Food ordering interface |

---

## ✨ Features

### **For Customers**
- Browse menu with beautiful UI
- Add items to cart with AI recommendations
- Real-time order tracking
- Leave reviews
- Secure checkout

### **For Delivery Guys**
- Go online/offline
- Accept delivery assignments
- Navigate to customers (Google Maps integration)
- Mark deliveries as complete
- Track daily stats

### **For Admins**
- View analytics dashboard
- Manage orders
- Assign user roles
- Monitor delivery activity
- View recent orders

### **For Super Admins** 
- Full system control
- Database management
- Activity logs
- User management
- System configuration

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Motion (Framer Motion)
- Radix UI components

**Backend:**
- PHP 8+
- MySQL Database
- JWT authentication
- RESTful API

**Infrastructure:**
- XAMPP (Apache + MySQL)
- Served via Apache virtual host

---

## 📱 Responsive Design

- ✅ Desktop (1024px+) - Full featured
- ✅ Tablet (768px-1024px) - Optimized layout
- ✅ Mobile (< 768px) - Touch-friendly

---

## 🔧 Development

### **Backend Configuration**

Create `backend-php/.env`:
```
DB_HOST=localhost
DB_NAME=u614661615_mondas
DB_USER=root
DB_PASS=
JWT_SECRET=your_super_secret_jwt_key_change_in_production
```

### **Apache Configuration**

Add to `C:\xampp\apache\conf\extra\httpd-vhosts.conf`:
```apache
Alias /mondas-api "C:/xampp/htdocs/Food-Delivery-App/backend-php"
<Directory "C:/xampp/htdocs/Food-Delivery-App/backend-php">
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
    DirectoryIndex index.php
</Directory>
```

---

## 📂 Project Structure

```
Food-Delivery-App/
├── src/                    # Frontend source (React + TypeScript)
│   ├── components/         # React components
│   ├── config/            # API configuration
│   └── ...
├── backend-php/           # PHP Backend
│   ├── api/              # API endpoints
│   ├── config/           # Database & CORS config
│   └── services/         # Business logic
├── build/                 # Built frontend files
├── database/              # SQL scripts
└── README.md
```

---

## 🔒 Security Features

- JWT authentication
- Password hashing
- Role-based access control (RBAC)
- Secure API endpoints
- Protected routes
- CORS configuration

---

## 📖 API Endpoints

**Base URL**: `http://localhost/mondas-api`

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### **Menu**
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get menu item by ID

### **Orders**
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details

### **Admin** (Auth required)
- `GET /api/admin/dashboard` - Get admin dashboard data
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users/:id/promote` - Promote user role
- `GET /api/admin/orders` - Get all orders

### **Delivery** (Auth required)
- `GET /api/delivery/orders` - Get delivery assignments

---

## 🎨 Color Themes

- **Super Admin**: Purple/Indigo gradient
- **Admin**: Pink/Purple gradient
- **Delivery Guy**: Green/Teal gradient
- **Customer**: Red/Yellow/Orange gradient (African food theme)

---

## 🐛 Troubleshooting

### **Backend not connecting?**
1. Check if Apache is running in XAMPP
2. Verify MySQL is running
3. Test: `http://localhost/mondas-api/api/health`
4. Check `backend-php/.env` configuration

### **Database connection failed?**
1. Ensure MySQL is running in XAMPP
2. Verify database exists: `u614661615_mondas`
3. Check database credentials in `.env`

### **Frontend not loading?**
1. Ensure build files exist in `build/` folder
2. Check Apache is serving from correct directory
3. Clear browser cache (Ctrl+F5)

---

## 📄 License

MIT License - Free to use and modify

---

## 🤝 Support

For issues or questions, check:
- `SETUP_INSTRUCTIONS.md` for detailed setup
- Apache error logs: `C:\xampp\apache\logs\error.log`
- Browser developer console

---

**Built with ❤️ for Monda Snack Bar**
