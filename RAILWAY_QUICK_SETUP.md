# ⚡ Railway PostgreSQL - Quick Setup (5 Minutes)

## 🎯 What You Need to Do

### 1️⃣ Add PostgreSQL in Railway (2 minutes)

1. Open Railway dashboard: https://railway.app/dashboard
2. Select your project
3. Click **"New"** → **"Database"** → **"PostgreSQL"**
4. Click the PostgreSQL service → **"Variables"** tab
5. Copy the **`DATABASE_URL`** value

### 2️⃣ Add DATABASE_URL to Backend (1 minute)

1. Click your **Backend service** (not PostgreSQL)
2. Go to **"Variables"** tab
3. Click **"New Variable"**
4. Name: `DATABASE_URL`
5. Value: Paste the PostgreSQL URL you copied
6. Click **"Add"**

### 3️⃣ Update Prisma for Railway (I'll do this)

I'll create a script that automatically uses PostgreSQL when `DATABASE_URL` contains "postgresql".

### 4️⃣ Redeploy (2 minutes)

1. Railway will auto-redeploy when you push changes
2. Or click **"Redeploy"** in Railway dashboard
3. Check logs to see if it works

---

## ✅ That's It!

After these steps:
- ✅ PostgreSQL database is connected
- ✅ Backend will use PostgreSQL instead of SQLite
- ✅ Migrations will run automatically
- ✅ Your app will work on Railway!

---

## 🔍 How to Check If It Worked

1. **Check Railway Logs:**
   - Backend service → Deployments → Latest → View Logs
   - Look for: "Monda Food Delivery Backend Running!"

2. **Test Health Endpoint:**
   - Visit: `https://food-delivery-app-production-4207.up.railway.app/health`
   - Should show: `{"status":"ok"}`

3. **No More 502 Errors!**
   - The connection refused error should be gone

---

## 📝 I'll Help You With:

- ✅ Updating Prisma to automatically detect PostgreSQL
- ✅ Creating migration scripts
- ✅ Setting up the build process
- ✅ Troubleshooting any errors

**Just tell me when you've added PostgreSQL in Railway and I'll help with the rest!** 🚀

