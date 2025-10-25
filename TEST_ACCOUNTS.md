# 🔐 TEST ACCOUNTS - All Roles

**Use these to test different role types!**

---

## 👑 **SUPER ADMIN** (Full System Control)

```
Email: admin@monda.com
Password: admin123
```

**Badge Color**: 🟡 Yellow/Orange  
**Icon**: 👑 Crown  
**Permissions**: EVERYTHING (Can manage all users, settings, analytics)

---

## 💼 **ADMIN** (Manager/Boss)

```
Email: manager@monda.com
Password: admin123
```

**Badge Color**: 🟣 Purple/Pink  
**Icon**: 💼 Shield  
**Permissions**: 
- View analytics dashboard
- Manage orders
- Can add/remove people
- View all users

---

## ⚙️ **SUB-ADMIN** (Limited Admin)

```
Email: subadmin@monda.com
Password: admin123
```

**Badge Color**: 🔵 Blue/Cyan  
**Icon**: ⚙️ Settings  
**Permissions**: 
- View orders
- Update order status
- View users
- View menu

*Note: Create this account by registering and then updating the role in database*

---

## 🚗 **DELIVERY DRIVER**

```
Email: delivery@monda.com
Password: admin123
```

**Badge Color**: 🟢 Green/Emerald  
**Icon**: 🚗 Truck  
**Permissions**: 
- View assigned deliveries
- Update delivery status
- GPS tracking
- Delivery completion

---

## 👤 **CUSTOMER** (Regular User)

```
Email: customer@test.com
Password: customer123
```

**Badge Color**: ⚫ Gray  
**Icon**: 👤 User  
**Permissions**: 
- Browse menu
- Order food
- Track delivery
- Write reviews

---

## 📋 **HOW TO TEST EACH ROLE:**

### Step 1: Refresh Browser
Go to: **http://localhost:5173**

### Step 2: Click "Login" (top-right)

### Step 3: Choose a role and login

### Step 4: Look for the ROLE BADGE
**Top-right corner** will show a colorful card with:
- 🎯 Your role icon
- 📝 "Logged in as [Role Name]"
- 👤 Your name
- 📧 Your email
- 🏷️ Role badge with emoji

---

## 🎨 **WHAT EACH ROLE LOOKS LIKE:**

### 👑 Super Admin
```
┌────────────────────────┐
│ 👑  Logged in as       │
│     SUPER ADMIN        │ ← Yellow/Orange gradient
│                        │
│ Super Admin            │
│ admin@monda.com        │
│                        │
│   👑 SUPER_ADMIN       │
└────────────────────────┘
```

### 💼 Admin
```
┌────────────────────────┐
│ 💼  Logged in as       │
│     ADMIN              │ ← Purple/Pink gradient
│                        │
│ Manager Admin          │
│ manager@monda.com      │
│                        │
│   💼 ADMIN             │
└────────────────────────┘
```

### 🚗 Delivery Driver
```
┌────────────────────────┐
│ 🚗  Logged in as       │
│     DELIVERY DRIVER    │ ← Green/Emerald gradient
│                        │
│ Delivery Guy           │
│ delivery@monda.com     │
│                        │
│   🚗 DELIVERY_GUY      │
└────────────────────────┘
```

### 👤 Customer
```
┌────────────────────────┐
│ 👤  Logged in as       │
│     CUSTOMER           │ ← Gray
│                        │
│ Test Customer          │
│ customer@test.com      │
│                        │
│   👤 USER              │
└────────────────────────┘
```

---

## ✅ **QUICK TEST CHECKLIST:**

- [ ] Login as Super Admin → See yellow badge
- [ ] Logout → Badge disappears
- [ ] Login as Admin → See purple badge  
- [ ] Logout → Badge disappears
- [ ] Login as Delivery → See green badge
- [ ] Logout → Badge disappears
- [ ] Login as Customer → See gray badge
- [ ] Create new account → Auto becomes Customer

---

## 🎯 **AFTER LOGGING IN, YOU'LL SEE:**

1. **Top-Right Header**: 
   - Your name + role
   - Logout button

2. **Top-Right Corner** (below header):
   - 🎨 **Colorful role badge card**
   - Clear indication of who you are
   - Your email address
   - Role emoji

3. **Bottom-Right Corner**:
   - 🟢 Backend connection status

---

## 🔄 **TO SWITCH ROLES:**

1. Click logout button
2. Click "Login" again
3. Use different account credentials
4. Watch the role badge change color!

---

## 🎨 **ROLE COLOR GUIDE:**

| Role | Color | Emoji | Description |
|------|-------|-------|-------------|
| Super Admin | 🟡 Yellow/Orange | 👑 | Full control |
| Admin | 🟣 Purple/Pink | 💼 | Manager |
| Sub-Admin | 🔵 Blue/Cyan | ⚙️ | Limited admin |
| Delivery | 🟢 Green | 🚗 | Driver |
| Customer | ⚫ Gray | 👤 | Regular user |

---

## 📱 **WHERE TO FIND THE ROLE INDICATOR:**

```
Browser Window:
┌──────────────────────────────────────────────┐
│ [Header with Login/Logout]                   │
│                           ┌────────────────┐ │ ← ROLE BADGE HERE!
│                           │ 👑 Super Admin │ │   (Top-right corner)
│                           │ admin@...      │ │
│                           └────────────────┘ │
│                                              │
│ [Menu Items]                                 │
│                                              │
│                           ┌────────────────┐ │
│                           │ 🟢 Backend OK  │ │ ← Backend status
│                           └────────────────┘ │
└──────────────────────────────────────────────┘
```

---

## ✅ **ALL FIXED!**

1. ✅ Review popup won't recur anymore
2. ✅ Clear role indicator shows who you're logged in as
3. ✅ Backend is running
4. ✅ High-quality Unsplash images already in place
5. ✅ All 5 roles have distinct colors and icons

---

**Now refresh your browser and try logging in with each account!** 🚀


