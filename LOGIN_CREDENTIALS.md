# 🔐 LOGIN CREDENTIALS - HOW TO ACCESS EACH ROLE

---

## 🎯 **QUICK ACCESS**

### **👑 SUPER ADMIN (Developer Access)**
```
Email: admin@monda.com
Password: admin123
```
**What you see:**
- Purple/Indigo dashboard
- System controls (database backup, migrations, etc.)
- Full developer tools
- Activity logs
- Complete system overview

---

### **💼 ADMIN (Manager Access)**
```
Email: manager@monda.com
Password: admin123
```
**What you see:**
- Pink/Purple dashboard
- Analytics & order stats
- Assign roles to users
- View recent orders
- Manage deliveries

---

### **🚗 DELIVERY GUY (Driver Access)**
```
Email: delivery@monda.com
Password: admin123
```
**What you see:**
- Green/Teal dashboard
- Go Online/Offline toggle
- View delivery assignments
- Accept orders
- Mark as delivered
- Navigate to customer location

---

### **🛍️ CUSTOMER (Regular User)**
```
Email: customer@test.com
Password: customer123
```
**What you see:**
- Regular food ordering interface
- Browse menu
- Add to cart
- Place orders
- Track delivery

---

## 🔄 **HOW TO SWITCH ROLES**

1. **Logout** (click user icon → Logout button)
2. **Click Login** button in header
3. **Enter credentials** from above
4. **Dashboard changes** based on your role

---

## ✨ **FEATURES BY ROLE**

### **SUPER ADMIN** 👑
- ✅ Backup database
- ✅ Restore database
- ✅ Run migrations
- ✅ Clear cache
- ✅ View system logs
- ✅ Manage API keys
- ✅ See all system stats

### **ADMIN** 💼
- ✅ View analytics
- ✅ See all orders
- ✅ Track deliveries
- ✅ Assign roles (Delivery Guy, Sub-Admin, User)
- ✅ Manage users
- ✅ View recent activity

### **DELIVERY GUY** 🚗
- ✅ Toggle online/offline status
- ✅ See assigned deliveries
- ✅ Accept new orders
- ✅ Navigate to customer (Google Maps integration)
- ✅ Mark orders as delivered
- ✅ Track daily deliveries

### **CUSTOMER** 🛍️
- ✅ Browse menu
- ✅ Add items to cart
- ✅ Place orders
- ✅ Track delivery in real-time
- ✅ Leave reviews
- ✅ Get AI recommendations

---

## 🎨 **VISUAL INDICATORS**

### **Role Badges** (Top of page):
- 👑 **SUPER_ADMIN** - Purple/Gold badge
- 💼 **ADMIN** - Pink badge
- 🚗 **DELIVERY_GUY** - Green badge
- 🛍️ **USER** - Blue badge (when logged in)

### **Dashboard Colors**:
- **Super Admin** - Purple/Indigo gradient
- **Admin** - Pink/Purple gradient
- **Delivery Guy** - Green/Teal gradient
- **Customer** - Red/Yellow gradient (food theme)

---

## 🚀 **TESTING WORKFLOW**

### **1. Test Super Admin**:
```
1. Login as admin@monda.com
2. You should see purple dashboard
3. Try clicking "Backup Database" button
4. Check activity logs
5. Logout
```

### **2. Test Admin**:
```
1. Login as manager@monda.com
2. You should see pink dashboard
3. Try assigning a role (enter email + select role)
4. View recent orders
5. Logout
```

### **3. Test Delivery Guy**:
```
1. Login as delivery@monda.com
2. You should see green dashboard
3. Click "Go Online"
4. Check for available deliveries
5. Logout
```

### **4. Test Customer**:
```
1. Login as customer@test.com
2. You should see regular food ordering page
3. Add items to cart
4. Place an order
5. Track delivery
```

---

## ⚠️ **IMPORTANT NOTES**

1. **Passwords** are all "admin123" for admin accounts, "customer123" for customer
2. **Backend must be running** on port 5000
3. **Frontend must be running** on port 5173
4. **Database must be seeded** (run: `cd backend && npm run seed`)
5. **Each role sees different UI** - this is RBAC working correctly!

---

## 🐛 **TROUBLESHOOTING**

### **Problem: Can't login**
- Check backend is running (should see green "Backend Connected" badge)
- Make sure database is seeded
- Try refreshing the page

### **Problem: Wrong dashboard shows**
- Logout completely
- Clear browser localStorage
- Login again

### **Problem: No orders for delivery guy**
- Login as customer
- Place an order first
- Then login as delivery guy to see it

---

## 📱 **RESPONSIVE DESIGN**

- **Desktop** (1024px+): Full dashboards with all features
- **Tablet** (768px-1024px): 2-column layouts
- **Mobile** (< 768px): Stacked layouts, optimized for touch

Test on different screen sizes to see responsive design in action!

---

**ENJOY TESTING! 🎉**


