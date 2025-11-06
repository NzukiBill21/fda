# 🚀 Quick Deployment Guide

## Step-by-Step Deployment

### 1. Prepare Your Environment

#### Backend:
```bash
cd backend
cp .env.example .env
# Edit .env with your production values
```

#### Frontend:
```bash
cp .env.example .env.production
# Edit .env.production with your backend URL
```

---

### 2. Set Up Database (PostgreSQL)

**Option A: Supabase (Recommended - Free)**
1. Go to https://supabase.com
2. Create new project
3. Copy connection string from Settings > Database
4. Add to backend/.env: `DATABASE_URL=your_connection_string`

**Option B: Railway**
1. Go to https://railway.app
2. Create new PostgreSQL database
3. Copy connection string
4. Add to backend/.env

**Option C: Neon**
1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Add to backend/.env

---

### 3. Update Prisma Schema

```bash
cd backend
# Copy production schema
cp prisma/schema.production.prisma prisma/schema.prisma
# Or manually update schema.prisma to use PostgreSQL
```

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

### 4. Run Database Migrations

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
```

---

### 5. Deploy Backend

#### Railway:
1. Connect GitHub repository
2. Select `backend` folder
3. Add environment variables from .env
4. Deploy!

#### Render:
1. Create new Web Service
2. Connect repository
3. Root directory: `backend`
4. Build: `npm install && npm run build`
5. Start: `npm start`
6. Add environment variables

---

### 6. Deploy Frontend

#### Vercel:
1. Import repository
2. Root directory: `.` (root)
3. Build command: `npm run build`
4. Output directory: `build`
5. Add environment variable: `VITE_API_URL=https://your-backend-url.com`

#### Netlify:
1. Connect repository
2. Build command: `npm run build`
3. Publish directory: `build`
4. Add environment variable: `VITE_API_URL`

---

### 7. Update API URLs in Code

Run the update script:
```bash
node update-api-urls.js
```

Or manually update files to use:
```typescript
import { API_URL, createApiUrl } from '@/config/api';
```

---

### 8. Test Deployment

1. Visit your frontend URL
2. Test login/register
3. Test menu loading
4. Check backend logs for errors

---

## Environment Variables Checklist

### Backend (.env):
- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL=postgresql://...`
- [ ] `JWT_SECRET=secure_random_string_32_chars_min`
- [ ] `CORS_ORIGIN=https://your-frontend-domain.com`
- [ ] `PORT=5000` (or your hosting port)

### Frontend (.env.production):
- [ ] `VITE_API_URL=https://your-backend-domain.com`

---

## Common Issues

### CORS Errors:
- Check `CORS_ORIGIN` in backend .env
- Ensure frontend URL is included

### Database Connection:
- Verify `DATABASE_URL` format
- Check database is accessible
- Run migrations: `npx prisma migrate deploy`

### Build Failures:
- Check Node.js version (18+)
- Verify all dependencies installed
- Check build logs

---

## Post-Deployment

1. Test all features
2. Monitor logs
3. Set up backups
4. Configure SSL (HTTPS)
5. Set up monitoring

---

## Need Help?

Check:
- Backend logs in hosting dashboard
- Frontend build logs
- Database connection status
- Environment variables

