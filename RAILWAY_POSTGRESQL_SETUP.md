# 🗄️ Railway PostgreSQL Setup - Step by Step

## Step 1: Add PostgreSQL Database in Railway

1. **Go to your Railway project dashboard**
   - Visit: https://railway.app/dashboard
   - Select your project: "Food Delivery App"

2. **Add PostgreSQL Service**
   - Click the **"New"** button (or **"+"** icon)
   - Select **"Database"**
   - Choose **"PostgreSQL"**
   - Railway will automatically create a PostgreSQL database

3. **Get Your Database URL**
   - Click on the PostgreSQL service you just created
   - Go to the **"Variables"** tab
   - Find **`DATABASE_URL`** - it looks like:
     ```
     postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
     ```
   - **Copy this entire URL** - you'll need it!

---

## Step 2: Update Your Backend Service Environment Variables

1. **Go to your Backend Service in Railway**
   - Click on your backend service (not the PostgreSQL one)

2. **Add Environment Variables**
   - Click on **"Variables"** tab
   - Click **"New Variable"**
   - Add these variables:

   ```
   DATABASE_URL = [paste the PostgreSQL URL you copied]
   NODE_ENV = production
   JWT_SECRET = [generate a random 32+ character string]
   JWT_EXPIRES_IN = 7d
   CORS_ORIGIN = https://your-frontend-domain.com
   ```

3. **Generate JWT Secret** (if you don't have one):
   - You can use: https://randomkeygen.com/
   - Or run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Copy the result and paste as `JWT_SECRET`

---

## Step 3: Update Prisma Schema for PostgreSQL

I'll update your Prisma schema file to use PostgreSQL. The file is already prepared at `backend/prisma/schema.production.prisma`.

**What I'll do:**
- Update the main schema to use PostgreSQL when `DATABASE_URL` is set
- Or use the production schema for Railway

---

## Step 4: Run Database Migrations

After Railway redeploys, you need to run migrations:

1. **Option A: Railway Shell (Recommended)**
   - Go to your backend service in Railway
   - Click **"Deployments"** tab
   - Click on the latest deployment
   - Click **"Shell"** or **"View Logs"**
   - Run:
     ```bash
     cd backend
     npx prisma generate
     npx prisma migrate deploy
     ```

2. **Option B: Add to Build Command**
   - In Railway backend service settings
   - Update **"Build Command"** to:
     ```
     npm install && npm run build && npx prisma generate
     ```
   - Add **"Deploy Command"** (if available):
     ```
     npx prisma migrate deploy
     ```

---

## Step 5: Verify It Works

1. **Check Railway Logs**
   - Go to your backend service
   - Click **"Deployments"** → Latest deployment → **"View Logs"**
   - Look for:
     - ✅ "Monda Food Delivery Backend Running!"
     - ✅ "Port: [number]"
     - ❌ Any database connection errors

2. **Test Health Endpoint**
   - Visit: `https://food-delivery-app-production-4207.up.railway.app/health`
   - Should return: `{"status":"ok"}`

3. **Test API**
   - Visit: `https://food-delivery-app-production-4207.up.railway.app/api/menu`
   - Should return menu items (or empty array if no items)

---

## Troubleshooting

### Issue: "Can't reach database server"
- **Fix:** Make sure `DATABASE_URL` is set correctly in backend service variables
- **Fix:** Verify PostgreSQL service is running in Railway

### Issue: "Prisma Client not generated"
- **Fix:** Add `npx prisma generate` to build command
- **Fix:** Run manually in Railway shell

### Issue: "Migration failed"
- **Fix:** Make sure `DATABASE_URL` points to PostgreSQL (not SQLite)
- **Fix:** Check Prisma schema uses `provider = "postgresql"`

### Issue: "Connection refused"
- **Fix:** Server now listens on `0.0.0.0` ✅ (already fixed)
- **Fix:** Check Railway logs for specific errors

---

## Quick Checklist

- [ ] PostgreSQL service added in Railway
- [ ] `DATABASE_URL` copied from PostgreSQL service
- [ ] `DATABASE_URL` added to backend service variables
- [ ] Other environment variables set (JWT_SECRET, etc.)
- [ ] Prisma schema updated to use PostgreSQL
- [ ] Migrations run (`npx prisma migrate deploy`)
- [ ] Server restarted/redeployed
- [ ] Health endpoint works
- [ ] API endpoints work

---

## Need Help?

If you get stuck:
1. Check Railway logs for specific error messages
2. Verify all environment variables are set
3. Make sure PostgreSQL service is running
4. Verify `DATABASE_URL` format is correct

Let me know what step you're on and I'll help you through it! 🚀

