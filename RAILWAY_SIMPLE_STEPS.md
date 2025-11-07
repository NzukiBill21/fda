# 🚂 Railway PostgreSQL - Simple 3 Steps

## ✅ Step 1: Add PostgreSQL in Railway (2 minutes)

1. **Open Railway Dashboard**
   - Go to: https://railway.app/dashboard
   - Click on your project

2. **Add PostgreSQL**
   - Click **"New"** button (top right)
   - Click **"Database"**
   - Click **"PostgreSQL"**
   - Wait for it to create (takes ~30 seconds)

3. **Get Database URL**
   - Click on the **PostgreSQL** service (the one you just created)
   - Click **"Variables"** tab
   - Find **`DATABASE_URL`** - it looks like:
     ```
     postgresql://postgres:xxxxx@containers-us-west-xxx.railway.app:5432/railway
     ```
   - **Click the copy icon** next to it (or click "Reveal" then copy)

---

## ✅ Step 2: Add DATABASE_URL to Backend (1 minute)

1. **Go to Backend Service**
   - Click on your **Backend** service (not PostgreSQL)
   - Click **"Variables"** tab

2. **Add DATABASE_URL**
   - Click **"New Variable"** button
   - **Name:** `DATABASE_URL`
   - **Value:** Paste the PostgreSQL URL you copied from Step 1
   - Click **"Add"**

3. **Add Other Variables** (if not already set):
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = (generate a random 32+ character string)
   - `JWT_EXPIRES_IN` = `7d`
   - `CORS_ORIGIN` = `https://your-frontend-domain.com`

---

## ✅ Step 3: Redeploy (Automatic!)

Railway will **automatically redeploy** when you:
- Push new code to GitHub (if connected)
- Or click **"Redeploy"** button in Railway

**That's it!** The script I created will automatically:
- ✅ Detect PostgreSQL from `DATABASE_URL`
- ✅ Use the PostgreSQL schema
- ✅ Generate Prisma Client
- ✅ Run migrations

---

## 🎉 Done!

After Railway redeploys:
- ✅ Your app will use PostgreSQL
- ✅ Database tables will be created automatically
- ✅ No more 502 errors!

---

## 🔍 How to Check If It Worked

1. **Check Railway Logs:**
   - Backend service → **"Deployments"** → Latest → **"View Logs"**
   - Look for: "✅ PostgreSQL detected" or "Monda Food Delivery Backend Running!"

2. **Test Your App:**
   - Visit: `https://food-delivery-app-production-4207.up.railway.app/health`
   - Should show: `{"status":"ok"}`

3. **No More Errors!**
   - The 502 Bad Gateway error should be gone
   - Connection refused errors should be fixed

---

## ❓ Need Help?

If something doesn't work:
1. Check Railway logs for error messages
2. Make sure `DATABASE_URL` is set correctly
3. Verify PostgreSQL service is running
4. Check that all environment variables are set

**That's all you need to do! Just 3 simple steps!** 🚀

