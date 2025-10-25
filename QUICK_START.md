# ⚡ QUICK START - Super Simple!

## 🎯 The Easiest Way (Windows)

### **Just Double-Click This File:**
```
RUN_ME.bat
```

**That's it!** It will:
1. Ask if you want to Setup or Start
2. Show you progress with colors
3. Open everything automatically

---

## 🚀 Or Use These Commands:

### **First Time Setup:**
```powershell
.\setup.ps1
```

You'll see:
```
🚀 Food Delivery App - Complete Setup
======================================

📱 [1/6] Installing Frontend Dependencies...
✅ Frontend dependencies installed!

🔧 [2/6] Installing Backend Dependencies...
✅ Backend dependencies installed!

⚙️  [3/6] Creating Environment Configuration...
✅ Environment file created!

🗄️  [4/6] Creating Database...
✅ Database created!

🔧 [5/6] Setting up Prisma & Database...
✅ Prisma client generated!
✅ Database migrations complete!

🌱 [6/6] Adding Sample Data...
✅ Sample data added!

🎉 SETUP COMPLETE! Ready to start!
```

### **Then Start the App:**
```powershell
.\start.ps1
```

Opens 2 windows automatically:
- 📱 Frontend at http://localhost:5173
- 🔧 Backend at http://localhost:5000

---

## 🌐 What You'll See

Open **http://localhost:5173** in your browser:

1. ✨ Beautiful slideshow
2. 🍔 Menu with food items
3. 🔍 Search bar (try "spicy chicken")
4. 🛒 Shopping cart with AI recommendations
5. 📍 Order tracking with real-time updates

---

## 👤 Login Accounts

**Customer:**
- Email: `customer@test.com`
- Password: `customer123`

**Admin:**
- Email: `admin@fooddelivery.com`
- Password: `admin123`

---

## ⚠️ Prerequisites

Install these first (if you haven't):

1. **Node.js 18+** → https://nodejs.org/
2. **PostgreSQL 14+** → https://www.postgresql.org/download/windows/
3. **Redis** → https://github.com/tporadowski/redis/releases

---

## 🛑 To Stop

Just close the PowerShell windows that opened.

---

## 🎮 Test These Features

### **1. AI Search**
- Search: "spicy chicken"
- Search: "cheap vegetarian"
- See smart results!

### **2. Recommendations**
- Add 2-3 items to cart
- Open cart
- Scroll down
- See AI suggestions!

### **3. Order Tracking**
- Complete checkout
- Watch real-time tracking
- See GPS map

---

## 🐛 Troubleshooting

### "Execution Policy" Error
Run this once:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### PostgreSQL Not Found
Make sure PostgreSQL is installed and in your PATH, or update the DATABASE_URL in `backend/.env`

### Redis Not Running
Download and run Redis for Windows, or use Docker:
```bash
docker run -d -p 6379:6379 redis
```

---

## 📖 Full Documentation

- **Architecture**: [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- **Setup Guide**: [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
- **API Docs**: [backend/README.md](backend/README.md)
- **Complete Summary**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

---

## 🎉 That's It!

**Choose One:**
1. Double-click `RUN_ME.bat` (easiest)
2. Run `.\setup.ps1` then `.\start.ps1`

**Then open:** http://localhost:5173

Enjoy! 🚀
