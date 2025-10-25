# 🚀 Complete Setup Instructions

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **PostgreSQL** 14.x or higher ([Download](https://www.postgresql.org/download/))
- **Redis** 6.x or higher ([Download](https://redis.io/download))
- **Git** ([Download](https://git-scm.com/downloads))

### Optional (Recommended)
- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Prisma
  - TypeScript
- **Postman** for API testing
- **PostgreSQL GUI** (pgAdmin, TablePlus, DBeaver)
- **Redis GUI** (RedisInsight)

---

## 📥 Step 1: Clone the Project

```bash
git clone <repository-url>
cd "Food Delivery App"
```

---

## 🎨 Step 2: Frontend Setup

### 2.1 Navigate to Frontend Directory
```bash
# You're already in the root directory (Food Delivery App)
pwd  # Should show: .../Food Delivery App
```

### 2.2 Install Frontend Dependencies
```bash
npm install
```

### 2.3 Run Frontend Development Server
```bash
npm run dev
```

The frontend will start on **http://localhost:5173**

---

## 🔧 Step 3: Backend Setup

### 3.1 Navigate to Backend Directory
```bash
cd backend
```

### 3.2 Install Backend Dependencies
```bash
npm install
```

### 3.3 Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp ENV_TEMPLATE.md .env
```

Edit `.env` with your credentials:

```env
# Database - Update with your PostgreSQL credentials
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/food_delivery_db"

# Redis - Default local Redis
REDIS_URL="redis://localhost:6379"

# Server
PORT=5000
NODE_ENV=development

# JWT - Generate a strong secret (32+ characters)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_long
JWT_EXPIRES_IN=7d

# M-Pesa (Sandbox for testing)
MPESA_CONSUMER_KEY=get_from_daraja_portal
MPESA_CONSUMER_SECRET=get_from_daraja_portal
MPESA_PASSKEY=get_from_daraja_portal
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://your-domain.com/api/payments/mpesa/callback

# Africa's Talking (SMS)
AFRICASTALKING_API_KEY=get_from_africastalking
AFRICASTALKING_USERNAME=sandbox

# Unsplash API
UNSPLASH_ACCESS_KEY=get_from_unsplash_developers

# Admin
ADMIN_EMAIL=admin@fooddelivery.com
ADMIN_PASSWORD=change_in_production_123
```

### How to Get API Keys:

#### M-Pesa Daraja API (Kenya):
1. Visit [Safaricom Daraja](https://developer.safaricom.co.ke/)
2. Create account
3. Create an app
4. Get Consumer Key & Secret
5. Get Passkey from sandbox credentials

#### Africa's Talking:
1. Visit [Africa's Talking](https://africastalking.com/)
2. Sign up for free
3. Get API key from dashboard
4. Use 'sandbox' as username for testing

#### Unsplash:
1. Visit [Unsplash Developers](https://unsplash.com/developers)
2. Register as developer
3. Create new application
4. Get Access Key

---

## 🗄️ Step 4: Database Setup

### 4.1 Create PostgreSQL Database

#### On macOS/Linux:
```bash
# Start PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start    # Linux

# Create database
createdb food_delivery_db

# Or using psql
psql postgres
CREATE DATABASE food_delivery_db;
\q
```

#### On Windows:
```bash
# Open Command Prompt as Administrator
# Start PostgreSQL service
net start postgresql-x64-14

# Create database using pgAdmin or psql
psql -U postgres
CREATE DATABASE food_delivery_db;
\q
```

### 4.2 Generate Prisma Client
```bash
npm run prisma:generate
```

### 4.3 Run Database Migrations
```bash
npm run prisma:migrate
```

### 4.4 Seed Database with Sample Data
```bash
npm run seed
```

This creates:
- Admin user: `admin@fooddelivery.com` / `admin123`
- Test customer: `customer@test.com` / `customer123`
- Sample menu items
- Sample address

### 4.5 (Optional) View Database
```bash
npm run prisma:studio
```

Opens Prisma Studio on **http://localhost:5555**

---

## 🔴 Step 5: Start Redis

### On macOS:
```bash
brew services start redis
# Or manually:
redis-server
```

### On Linux:
```bash
sudo service redis-server start
# Or manually:
redis-server
```

### On Windows:
```bash
# Download Redis for Windows or use WSL
# Start Redis
redis-server.exe
```

Verify Redis is running:
```bash
redis-cli ping
# Should return: PONG
```

---

## 🚀 Step 6: Start Backend Server

```bash
# In backend directory
npm run dev
```

The backend will start on **http://localhost:5000**

You should see:
```
🚀 Server running on port 5000
🌍 Environment: development
📡 Socket.IO ready for real-time connections
✅ Database connected successfully
✅ Redis Client Connected
```

---

## ✅ Step 7: Verify Everything Works

### 7.1 Check Backend Health
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 123.45
}
```

### 7.2 Test Frontend
1. Open **http://localhost:5173** in browser
2. You should see the food delivery homepage
3. Click "Browse Menu" - menu items should load
4. Try adding an item to cart

### 7.3 Test Authentication
```bash
# Register a new user
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+254700000002",
    "password": "password123",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

You should receive a JWT token.

---

## 🖼️ Step 8: (Optional) Fetch Images from Unsplash

```bash
# In backend directory
npx ts-node src/scripts/fetchUnsplashImages.ts
```

This will:
- Find menu items needing images
- Fetch high-quality food images from Unsplash
- Update database with new image URLs

---

## 🧪 Step 9: Test Complete Flow

### Test Order Flow:
1. **Frontend**: Add items to cart
2. **Checkout**: Fill in delivery details
3. **Payment**: Select M-Pesa or Cash
4. **Track Order**: See real-time tracking
5. **Backend**: Check logs for order processing

### Test ML Features:
1. **Search**: Try "spicy chicken" in search bar
2. **Recommendations**: Add items to cart, check AI suggestions
3. **Popular Items**: Browse popular section

---

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Check connection string in .env
# Make sure DATABASE_URL matches your setup
```

### Redis Connection Issues
```bash
# Check Redis is running
redis-cli ping

# If fails, start Redis manually
redis-server
```

### Port Already in Use
```bash
# Frontend (5173)
lsof -ti:5173 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5173    # Windows (find PID, then kill)

# Backend (5000)
lsof -ti:5000 | xargs kill -9
```

### Prisma Issues
```bash
# Reset database (WARNING: Deletes all data!)
npm run prisma:migrate reset

# Regenerate client
npm run prisma:generate
```

### Module Not Found Errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 🔄 Common Development Workflows

### Starting Development (Every Day)
```bash
# Terminal 1: Start Redis
redis-server

# Terminal 2: Start PostgreSQL (if not running as service)
postgres -D /usr/local/var/postgres

# Terminal 3: Start Backend
cd backend
npm run dev

# Terminal 4: Start Frontend
cd "Food Delivery App"
npm run dev
```

### Viewing Logs
```bash
# Backend logs
cd backend
tail -f logs/combined.log

# Error logs only
tail -f logs/error.log
```

### Database Management
```bash
# View data
npm run prisma:studio

# Create new migration
npm run prisma:migrate

# Reset database
npm run prisma:migrate reset
```

---

## 📚 Next Steps

1. **Read Documentation**:
   - `PROJECT_OVERVIEW.md` - Complete system overview
   - `backend/README.md` - Backend API reference
   - `README.md` - Frontend information

2. **Explore API**:
   - Use Postman to test endpoints
   - Check `backend/src/routes/` for all routes

3. **Customize**:
   - Add your own menu items
   - Customize branding
   - Configure payment providers

4. **Deploy**:
   - See deployment sections in documentation
   - Set up production environment

---

## 🆘 Getting Help

- **Issues**: Check GitHub Issues
- **Documentation**: Read all .md files
- **Community**: Join our Discord/Slack
- **Email**: support@fooddelivery.com

---

## 🎉 Congratulations!

You've successfully set up the Food Delivery App!

### Quick Links:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Health: http://localhost:5000/health
- Prisma Studio: http://localhost:5555

Happy coding! 🚀

