# 🍔 Monda Food Delivery App

A professional, modern food delivery application with complete RBAC (Role-Based Access Control) system, beautiful UI, and full-stack TypeScript implementation.

---

## 🚀 Quick Start

**IMPORTANT**: Backend must be running on port 5000, frontend on port 5173

### **Option 1: Automated Start (Recommended)**
```powershell
.\start.ps1
```

### **Option 2: Manual Start**
```powershell
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend  
npm install
npm run dev
```

**Access**: Open `http://localhost:5173` in your browser

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
- Node.js + Express
- TypeScript
- SQLite database
- Prisma ORM
- JWT authentication

---

## 📱 Responsive Design

- ✅ Desktop (1024px+) - Full featured
- ✅ Tablet (768px-1024px) - Optimized layout
- ✅ Mobile (< 768px) - Touch-friendly

---

## 🔧 Development

### **Database Setup**
```powershell
cd backend
npm run migrate  # Run migrations
npm run seed     # Seed test data
```

### **Environment Variables**
Create `backend/.env`:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_secret_key"
PORT=5000
```

---

## 📂 Project Structure

```
Food Delivery App/
├── src/                    # Frontend source
│   ├── components/         # React components
│   │   ├── SuperAdminDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── DeliveryDashboard.tsx
│   │   └── ...
│   ├── styles/            # CSS files
│   └── App.tsx            # Main app component
├── backend/               # Backend source
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── server.ts      # Express server
│   ├── prisma/            # Database schema
│   └── package.json
└── LOGIN_CREDENTIALS.md   # Detailed login guide
```

---

## 🔒 Security Features

- JWT authentication
- Password hashing (bcrypt)
- Role-based access control (RBAC)
- Secure API endpoints
- Protected routes

---

## 📖 API Endpoints

### **Authentication**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### **Menu**
- `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get menu item by ID

### **Orders**
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details

### **Delivery** (Auth required)
- `GET /api/delivery/assignments` - Get delivery assignments
- `POST /api/delivery/status` - Update online/offline status
- `POST /api/delivery/accept/:orderId` - Accept delivery
- `POST /api/delivery/complete/:orderId` - Mark as delivered

### **Admin** (Auth required)
- `GET /api/admin/dashboard` - Get admin dashboard data

---

## 🎨 Color Themes

- **Super Admin**: Purple/Indigo gradient
- **Admin**: Pink/Purple gradient
- **Delivery Guy**: Green/Teal gradient
- **Customer**: Red/Yellow/Orange gradient (African food theme)

---

## 🐛 Troubleshooting

### **Backend not connecting?**
1. Check if backend is running on port 5000
2. Verify database is seeded: `npm run seed`
3. Check browser console for errors

### **Login not working?**
1. Ensure backend is running
2. Check credentials match those above
3. Clear browser localStorage and try again

### **Orders not showing for delivery guy?**
1. Login as customer first
2. Place an order
3. Then login as delivery guy to see it

---

## 📄 License

MIT License - Free to use and modify

---

## 🤝 Support

For issues or questions, check:
- `LOGIN_CREDENTIALS.md` for login help
- Backend logs in terminal
- Browser developer console

---

**Built with ❤️ for Monda Snack Bar**
