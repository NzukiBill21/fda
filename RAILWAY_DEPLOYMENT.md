# 🚂 Railway Deployment Guide

## Current Issue: 502 Bad Gateway

The error shows "connection refused" which means the app isn't starting properly on Railway.

## Quick Fixes

### 1. **Server Binding**
The server now listens on `0.0.0.0` instead of default (localhost), which is required for Railway.

### 2. **Required Environment Variables**

Set these in Railway dashboard:

```env
NODE_ENV=production
PORT=5000  # Railway will override this automatically
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_secret_min_32_chars
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.com
```

### 3. **Database Setup**

**Important:** Railway uses PostgreSQL, not SQLite!

1. Add PostgreSQL service in Railway
2. Copy the `DATABASE_URL` from Railway
3. Update Prisma schema to use PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

### 4. **Build Configuration**

Railway should auto-detect, but ensure:
- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run build && npx prisma generate`
- **Start Command:** `npm start` (runs `node dist/server.js`)

### 5. **Health Check**

Railway will check `/health` endpoint. Make sure it's working:
```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

## Common Issues

### Issue: Connection Refused
- **Fix:** Server now listens on `0.0.0.0` ✅

### Issue: Database Connection Failed
- **Fix:** Use PostgreSQL, not SQLite. Update `DATABASE_URL`

### Issue: Prisma Client Not Generated
- **Fix:** Add `npx prisma generate` to build command

### Issue: Missing Environment Variables
- **Fix:** Set all required env vars in Railway dashboard

## Deployment Steps

1. **Connect Repository to Railway**
   - Import from GitHub
   - Select repository

2. **Add PostgreSQL Service**
   - Click "New" → "Database" → "PostgreSQL"
   - Copy `DATABASE_URL`

3. **Configure Backend Service**
   - Set root directory: `backend`
   - Add environment variables
   - Set build/start commands

4. **Run Migrations**
   - Add service command: `npx prisma migrate deploy`
   - Or run manually in Railway shell

5. **Deploy**
   - Railway will auto-deploy on push
   - Check logs for errors

## Monitoring

- Check Railway logs for startup errors
- Verify `/health` endpoint responds
- Check database connection in logs
- Verify all environment variables are set

## Next Steps

After fixing the server binding, check:
1. Railway logs for specific errors
2. Database connection status
3. Environment variables are set correctly
4. Build completes successfully

