# 🔧 Railway Manual Configuration

## If Railway Doesn't Auto-Detect Configuration

If Railway doesn't automatically use `railway.json` or `nixpacks.toml`, manually set these in Railway dashboard:

### Backend Service Settings

1. **Go to your Backend service in Railway**
2. **Click "Settings" tab**
3. **Set these values:**

#### Root Directory
```
backend
```

#### Build Command
```bash
npm install && node use-postgresql.js && npm run build && npx prisma generate --schema=./prisma/schema.prisma
```

#### Start Command
```bash
npm start
```

---

## Alternative: Use the Build Script

You can also use the build script I created:

#### Build Command
```bash
bash railway-build.sh
```

#### Start Command
```bash
npm start
```

---

## Environment Variables

Make sure these are set in Railway:

```
DATABASE_URL=postgresql://... (from PostgreSQL service)
NODE_ENV=production
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.com
```

---

## After Configuration

1. **Click "Redeploy"** in Railway
2. **Check logs** - should see:
   - ✅ "PostgreSQL detected" (if DATABASE_URL is set)
   - ✅ "Schema updated to use PostgreSQL"
   - ✅ "Monda Food Delivery Backend Running!"

3. **Test your app:**
   - Visit: `https://food-delivery-app-production-4207.up.railway.app/health`
   - Should return: `{"status":"ok"}`

---

## Troubleshooting

### Still getting "Prisma Schema not found"?
- Make sure **Root Directory** is set to `backend`
- Or use full path: `--schema=backend/prisma/schema.prisma`

### Build still failing?
- Check Railway logs for specific errors
- Verify all environment variables are set
- Make sure PostgreSQL service is running

---

**The configuration files are ready. Just set them in Railway dashboard if auto-detection doesn't work!** 🚀

