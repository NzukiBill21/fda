# 🧪 TESTING GUIDE - Monda App (Option 2 Full Integration)

**Date: October 23, 2025**

---

## ⚡ **BEFORE YOU START:**

You should see **2 new PowerShell windows** that just opened:
1. **Window 1**: FRONTEND - Running at http://localhost:5173
2. **Window 2**: BACKEND - Running at http://localhost:5000

**Wait 10-15 seconds** for both to fully start.

---

## ✅ **TEST 1: Check Backend is Running**

### In your browser, open:
```
http://localhost:5000/health
```

### You should see:
```json
{
  "status": "OK",
  "message": "Monda Food Delivery Backend is running!",
  "version": "1.0.0",
  "features": ["RBAC", "Authentication", "SQLite Database"]
}
```

✅ **If you see this = Backend is working!**

---

## ✅ **TEST 2: Open the App**

### In your browser, open:
```
http://localhost:5173
```

### You should see:
1. ✅ The food delivery app
2. ✅ **"Login" button** in top-right (new!)
3. ✅ **Green badge** bottom-right saying "Backend Connected v1.0.0" (new!)
4. ✅ Fonts look crisper/clearer (new!)

---

## ✅ **TEST 3: Test Login (Super Admin)**

### Step-by-Step:

1. **Click "Login"** button (top-right)
   - Beautiful modal should appear

2. **Enter credentials:**
   ```
   Email: admin@monda.com
   Password: admin123
   ```

3. **Click "Login"**

### Expected Result:
- ✅ Success toast message: "Welcome back, Super Admin!"
- ✅ Modal closes
- ✅ Top-right now shows: "Super Admin" with "SUPER_ADMIN" role
- ✅ Logout button appears (icon)

---

## ✅ **TEST 4: Test Logout**

1. **Click the logout button** (top-right, looks like an arrow/icon)

### Expected Result:
- ✅ Toast message: "Logged out successfully"
- ✅ Top-right back to "Login" button
- ✅ User info disappears

---

## ✅ **TEST 5: Test Registration**

1. **Click "Login"** again

2. **Click** "Don't have an account? Sign up" (bottom of modal)

3. **Fill in details:**
   ```
   Name: Test User
   Email: test@example.com
   Phone: +254 712 345 678
   Password: test123
   ```

4. **Click "Create Account"**

### Expected Result:
- ✅ Success toast: "Account created!"
- ✅ Automatically logged in
- ✅ Shows "Test User" in header
- ✅ Role shows "USER"

---

## ✅ **TEST 6: Test Different Accounts**

### Try logging in as each role:

#### 1. **Admin/Manager**
```
Email: manager@monda.com
Password: admin123
Role: ADMIN
```

#### 2. **Customer**
```
Email: customer@test.com
Password: customer123
Role: USER
```

#### 3. **Delivery Guy**
```
Email: delivery@monda.com
Password: admin123
Role: DELIVERY_GUY
```

### Each should:
- ✅ Login successfully
- ✅ Show correct name
- ✅ Show correct role

---

## ✅ **TEST 7: Test Account Lockout (Security)**

1. **Click "Login"**

2. **Enter wrong password 5 times:**
   ```
   Email: admin@monda.com
   Password: wrongpassword
   ```

3. **On 5th attempt:**

### Expected Result:
- ✅ Error message: "Account locked. Try again in 15 minutes"
- ✅ Can't login even with correct password (for 15 min)

---

## ✅ **TEST 8: Test Cart (Original Features Still Work)**

1. **Scroll down** to menu

2. **Click "Add to Cart"** on any item

### Expected Result:
- ✅ Success toast with sparkle emoji
- ✅ Cart count increases in header
- ✅ Cart button shows number badge

---

## ✅ **TEST 9: Backend Connection Indicator**

Look at **bottom-right corner**:

### Should see:
- 🟢 **Green badge** = "Backend Connected v1.0.0"
- Badge pulses slightly
- Checks connection every 10 seconds

### If backend stops:
- 🔴 **Red badge** = "Backend Offline"

---

## ✅ **TEST 10: API Test (Advanced)**

### Open browser console (F12), then in console type:

```javascript
fetch('http://localhost:5000/api/menu')
  .then(r => r.json())
  .then(d => console.log(d))
```

### Expected Result:
```javascript
{
  success: true,
  items: [
    { name: "Chicken Biryani", price: 12.99, ... },
    { name: "Margherita Pizza", price: 9.99, ... },
    // ... more items
  ]
}
```

---

## 🎯 **QUICK CHECKLIST:**

Use this to verify everything:

- [ ] Backend health check works (http://localhost:5000/health)
- [ ] Frontend loads (http://localhost:5173)
- [ ] "Login" button visible
- [ ] Green "Backend Connected" badge visible
- [ ] Can login as Super Admin
- [ ] Shows correct name and role after login
- [ ] Logout works
- [ ] Can create new account
- [ ] Account lockout works (5 failed attempts)
- [ ] Original features still work (cart, menu, etc.)

---

## ❌ **TROUBLESHOOTING:**

### Backend not responding?
1. Check the **BACKEND window** - any errors?
2. Make sure it says "Monda Food Delivery Backend Running!"
3. Wait 15 seconds for it to fully start

### Frontend shows old version?
1. **Hard refresh**: Ctrl + Shift + R (Windows)
2. Or **Clear cache** and reload

### "Backend Offline" badge?
1. Check backend window is running
2. Check http://localhost:5000/health in browser
3. Restart backend if needed

### Can't login?
1. Check backend window for errors
2. Make sure database file exists: `backend/prisma/dev.db`
3. Try re-seeding: `cd backend; npx ts-node src/database/seed.ts`

---

## 📊 **WHAT TO REPORT BACK:**

After testing, tell me:

1. ✅ or ❌ for each test
2. Any error messages you see
3. Screenshots if something looks wrong
4. Which tests passed/failed

---

## 🎉 **IF ALL TESTS PASS:**

You have a **fully working system** with:
- ✅ Complete authentication
- ✅ RBAC (5 roles)
- ✅ Security (lockout, JWT)
- ✅ Database (SQLite)
- ✅ All original features

**Then we can continue with:**
- Admin dashboard UI
- Delivery guy dashboard
- African navigation UI
- More features!

---

## 🚀 **START TESTING:**

1. Open http://localhost:5000/health
2. Open http://localhost:5173
3. Click "Login"
4. Try admin@monda.com / admin123

**Good luck! Report back what you find!** 🎯


