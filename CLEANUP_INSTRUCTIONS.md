# Repository Cleanup: Node.js → PHP Backend

## ✅ Completed Changes

1. **Frontend API Configuration Updated**
   - `src/config/api.ts` → Points to `http://localhost/mondas-api`
   - `src/utils/imageUtils.ts` → Updated API URL
   - `src/components/HeroSlideshow.tsx` → Updated fallback URL

2. **Environment File**
   - `.env.local` → `VITE_API_URL=http://localhost/mondas-api`

## 🔧 Manual Steps Required

### Step 1: Stop Node.js Backend
```powershell
# Stop any running Node.js processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Step 2: Archive Node.js Backend
```powershell
cd C:\xampp\htdocs\Food-Delivery-App
New-Item -ItemType Directory -Path archive -Force
Move-Item -Path backend -Destination "archive\backend-nodejs-$(Get-Date -Format 'yyyyMMdd-HHmmss')" -Force
```

### Step 3: Remove Node.js References
```powershell
# Remove configuration files
Remove-Item -Path ecosystem.config.js -ErrorAction SilentlyContinue
Remove-Item -Path docker-compose.yml -ErrorAction SilentlyContinue
Remove-Item -Path Dockerfile -ErrorAction SilentlyContinue

# Remove Prisma directory
Get-ChildItem -Recurse -Directory -Filter prisma -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
```

### Step 4: Verify PHP Backend Structure
```powershell
# Check PHP backend exists
Test-Path backend-php
Test-Path backend-php\api
Test-Path backend-php\database\create_database.sql
```

### Step 5: Sync Database
```sql
-- Run this in phpMyAdmin or MySQL command line
SOURCE C:/xampp/htdocs/Food-Delivery-App/backend-php/database/create_database.sql;
```

## 📁 Final Project Structure

```
Food-Delivery-App/
├── src/                          # React frontend
│   ├── components/
│   ├── config/
│   │   └── api.ts                # Points to PHP API
│   └── utils/
├── backend-php/                  # PHP backend (ACTIVE)
│   ├── api/                      # PHP API endpoints
│   ├── utils/
│   └── database/
│       └── create_database.sql
├── database/                     # Additional SQL scripts
├── build/                        # Built React app
├── archive/                     # Archived Node.js backend
├── .env.local                    # VITE_API_URL=http://localhost/mondas-api
├── package.json                  # Frontend dependencies only
└── vite.config.ts
```

## 🌐 API Endpoints

All API calls now go to: `http://localhost/mondas-api/`

Ensure your PHP backend is configured to:
- Accept CORS from `http://localhost`
- Return JSON headers: `Content-Type: application/json`
- Handle all routes under `/mondas-api/api/*`

## ✅ Verification Checklist

- [ ] Node.js backend stopped and archived
- [ ] `.env.local` exists with correct API URL
- [ ] `src/config/api.ts` points to PHP API
- [ ] PHP backend accessible at `http://localhost/mondas-api`
- [ ] Database synced using `create_database.sql`
- [ ] CORS headers configured in PHP backend
- [ ] All API endpoints working




