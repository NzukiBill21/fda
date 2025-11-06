# 🚀 Hostinger Deployment Guide - Step by Step

## 📋 What You Need From Hostinger

When you log into your Hostinger account, you'll need:
1. **FTP/SFTP credentials** (for file upload)
2. **SSH access** (for running commands)
3. **Database credentials** (MySQL/PostgreSQL)
4. **Domain name** (your website URL)
5. **Server IP address**

---

## 🎯 Step 1: Prepare Your Files

### A. Backend Setup

1. **Create production environment file:**
   - Copy `backend/.env.example` to `backend/.env.production`
   - Fill in your Hostinger database credentials

2. **Update database connection:**
   - Use the database credentials from Hostinger
   - Format: `postgresql://user:password@host:port/database` or MySQL equivalent

### B. Frontend Setup

1. **Create production environment file:**
   - Create `.env.production` in root directory
   - Set your backend API URL

---

## 🔧 Step 2: Configure Hostinger Server

### Option A: VPS/Cloud Hosting (Recommended for Node.js)

1. **SSH into your server:**
   ```bash
   ssh username@your-server-ip
   ```

2. **Install Node.js 18+ and PM2:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

3. **Install PostgreSQL (if not included):**
   ```bash
   sudo apt-get update
   sudo apt-get install postgresql postgresql-contrib
   ```

### Option B: Shared Hosting (cPanel)

1. **Use Node.js Selector** in cPanel
2. **Create Node.js app** with version 18+
3. **Set startup file** to `backend/dist/server.js`

---

## 📦 Step 3: Upload Your Files

### Using SFTP/FTP:

1. **Connect to Hostinger via FileZilla or similar**
2. **Upload files to:**
   - Backend: `/home/username/backend/`
   - Frontend: `/home/username/public_html/` or `/home/username/domains/yourdomain.com/public_html/`

### Using Git (if SSH access available):

```bash
cd /home/username
git clone your-repo-url
cd Food-Delivery-App
```

---

## 🗄️ Step 4: Set Up Database

1. **Create database in Hostinger control panel:**
   - Go to MySQL/PostgreSQL databases
   - Create new database
   - Note: database name, username, password, host

2. **Update Prisma schema for production:**
   ```prisma
   datasource db {
     provider = "postgresql"  // or "mysql" if using MySQL
     url      = env("DATABASE_URL")
   }
   ```

3. **Run migrations:**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate deploy
   ```

---

## ⚙️ Step 5: Configure Environment Variables

### Backend `.env.production`:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://username:password@host:5432/database_name
JWT_SECRET=your_super_secret_key_min_32_characters_long_change_this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

### Frontend `.env.production`:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
# or if backend on same domain:
VITE_API_BASE_URL=https://yourdomain.com/api
```

---

## 🚀 Step 6: Build and Deploy

### Backend:

```bash
cd backend
npm install --production
npm run build
npx prisma generate
npx prisma migrate deploy
```

### Frontend:

```bash
npm install
npm run build
# Upload 'dist' folder contents to public_html
```

---

## 🔄 Step 7: Start Application

### Using PM2 (Recommended):

```bash
cd backend
pm2 start dist/server.js --name "food-delivery-api"
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

### Using Node.js Selector (cPanel):

1. Go to Node.js Selector
2. Select your app
3. Set startup file: `backend/dist/server.js`
4. Click "Run"

---

## 🌐 Step 8: Configure Domain & SSL

1. **Point domain to your server:**
   - Add A record: `@` → your server IP
   - Add C record: `www` → your domain

2. **Enable SSL:**
   - Use Hostinger's free SSL (Let's Encrypt)
   - Enable in control panel

3. **Configure reverse proxy (if needed):**
   - Use Nginx or Apache to proxy requests
   - See `nginx.conf` for configuration

---

## ✅ Step 9: Verify Deployment

1. **Check backend health:**
   ```bash
   curl https://api.yourdomain.com/health
   ```

2. **Test frontend:**
   - Visit `https://yourdomain.com`
   - Check browser console for errors

3. **Test API:**
   - Try login endpoint
   - Check database connections

---

## 📝 Hostinger-Specific Settings

### If using cPanel Node.js Selector:

1. **Application root:** `/home/username/backend`
2. **Application URL:** `yourdomain.com/api` or subdomain
3. **Application startup file:** `dist/server.js`
4. **Application port:** `5000` (or port assigned by Hostinger)

### If using VPS:

1. **Use PM2** for process management
2. **Configure Nginx** as reverse proxy
3. **Set up firewall** rules
4. **Enable auto-start** on server reboot

---

## 🔍 Troubleshooting

### Backend not starting:
- Check PM2 logs: `pm2 logs food-delivery-api`
- Verify environment variables
- Check database connection
- Verify port is not blocked

### Frontend not loading:
- Check build output in `dist` folder
- Verify API URL in `.env.production`
- Check browser console for errors
- Verify CORS settings in backend

### Database connection errors:
- Verify DATABASE_URL format
- Check database credentials
- Ensure database is accessible from server
- Run migrations: `npx prisma migrate deploy`

---

## 📞 Next Steps

Once you provide your Hostinger server details, I'll:
1. ✅ Create custom configuration files
2. ✅ Set up deployment scripts
3. ✅ Configure environment variables
4. ✅ Guide you through each step
5. ✅ Help troubleshoot any issues

**Ready? Share your Hostinger details and let's deploy! 🚀**

