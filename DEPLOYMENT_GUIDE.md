# 🚀 Food Delivery App - Deployment Guide

## Overview
This guide will help you deploy your Food Delivery App to production hosting.

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database (Supabase, Railway, Neon, or self-hosted)
- Git repository
- Hosting accounts (see options below)

---

## 📋 Deployment Steps

### Step 1: Choose Your Hosting

#### Frontend Options:
- **Vercel** (Recommended) - Free tier, automatic deployments
- **Netlify** - Free tier, easy setup
- **Render** - Free tier available

#### Backend Options:
- **Railway** (Recommended) - Easy PostgreSQL setup
- **Render** - Free tier available
- **DigitalOcean** - More control, paid
- **Heroku** - Paid, reliable

#### Database Options:
- **Supabase** (Recommended) - Free tier, PostgreSQL
- **Railway** - Included with backend
- **Neon** - Serverless PostgreSQL
- **Self-hosted** - Full control

---

### Step 2: Set Up Database

1. **Create PostgreSQL Database:**
   - Sign up for Supabase/Railway/Neon
   - Create a new PostgreSQL database
   - Copy the connection string

2. **Update Prisma Schema:**
   ```bash
   cd backend
   # Update schema.prisma to use PostgreSQL
   ```

3. **Run Migrations:**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate deploy
   ```

---

### Step 3: Configure Environment Variables

#### Backend (.env):
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_random_secret_min_32_chars
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.com
```

#### Frontend (.env.production):
```env
VITE_API_URL=https://your-backend-domain.com
```

---

### Step 4: Deploy Backend

#### Option A: Railway
1. Connect your GitHub repository
2. Select `backend` folder
3. Add environment variables
4. Deploy!

#### Option B: Render
1. Create new Web Service
2. Connect repository
3. Set build command: `cd backend && npm install && npm run build`
4. Set start command: `cd backend && npm start`
5. Add environment variables

---

### Step 5: Deploy Frontend

#### Option A: Vercel
1. Import your repository
2. Set root directory to project root
3. Build command: `npm run build`
4. Output directory: `build`
5. Add environment variable: `VITE_API_URL`

#### Option B: Netlify
1. Connect repository
2. Build command: `npm run build`
3. Publish directory: `build`
4. Add environment variable: `VITE_API_URL`

---

### Step 6: Update CORS

Update `backend/src/server.ts` to include your production frontend URL.

---

### Step 7: Test Deployment

1. Test API endpoints
2. Test authentication
3. Test database connections
4. Monitor logs for errors

---

## 🔧 Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Environment variables set correctly
- [ ] CORS configured for production domain
- [ ] API URLs updated in frontend
- [ ] SSL certificates active (HTTPS)
- [ ] Health checks working
- [ ] Error logging configured
- [ ] Backup strategy in place

---

## 🐛 Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Check CORS_ORIGIN in backend .env
   - Verify frontend URL is correct

2. **Database Connection:**
   - Verify DATABASE_URL format
   - Check database is accessible
   - Run migrations

3. **Build Failures:**
   - Check Node.js version
   - Verify all dependencies installed
   - Check build logs

---

## 📞 Support

For issues, check:
- Backend logs in hosting dashboard
- Frontend build logs
- Database connection status
- Environment variables configuration

