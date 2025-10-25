# 🚀 Getting Started - Food Delivery App

## 🎯 Quick Overview

This is a **production-ready food delivery platform** with ML-powered recommendations, real-time tracking, and M-Pesa payment integration.

### What You Can Do:
- 🛒 Browse and order food
- 💳 Pay with M-Pesa or cash
- 📍 Track orders in real-time
- 🤖 Get AI-powered recommendations
- 🔍 Search using natural language
- ⭐ Leave reviews

---

## ⚡ 5-Minute Quick Start

### Prerequisites Check
```bash
node --version  # Should be 18+
npm --version   # Should be 9+
psql --version  # Should be 14+
redis-cli ping  # Should return PONG
```

### 1. Frontend Setup (2 minutes)
```bash
# Install and run
npm install
npm run dev

# ✅ Frontend ready at http://localhost:5173
```

### 2. Backend Setup (3 minutes)
```bash
cd backend

# Install
npm install

# Quick setup with defaults
cat > .env << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/food_delivery_db"
REDIS_URL="redis://localhost:6379"
PORT=5000
NODE_ENV=development
JWT_SECRET="super_secret_jwt_key_min_32_characters_long_for_security"
JWT_EXPIRES_IN=7d
EOF

# Setup database
createdb food_delivery_db
npm run prisma:generate
npm run prisma:migrate
npm run seed

# Start server
npm run dev

# ✅ Backend ready at http://localhost:5000
```

---

## 🎮 Test the System

### Step 1: Browse Menu
1. Open http://localhost:5173
2. Click "Browse Menu"
3. See menu items load

### Step 2: Test Search
1. Search for "chicken"
2. Try "spicy food"
3. Check autocomplete

### Step 3: Add to Cart
1. Click "+" on any item
2. See cart count increase
3. Open cart (top right)

### Step 4: Test Recommendations
1. Add 2-3 items to cart
2. Scroll down in cart
3. See AI recommendations

### Step 5: Checkout
1. Click "Proceed to Checkout"
2. Fill form:
   - Name: John Doe
   - Phone: +254700000002
   - Address: Westlands, Nairobi
3. Select payment method
4. Confirm order

### Step 6: Track Order
1. See order confirmation
2. Scroll to tracking section
3. Watch real-time updates
4. See GPS map (when out for delivery)

---

## 🔍 Test ML Features

### 1. Personalized Recommendations
```bash
# Login first
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@test.com","password":"customer123"}'

# Copy the token

# Get personalized recommendations
curl http://localhost:5000/api/v1/menu/recommendations/personalized \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. NLP Search
```bash
# Natural language search
curl "http://localhost:5000/api/v1/menu/search?q=spicy+african+food"

# Intent-based search
curl "http://localhost:5000/api/v1/menu/search?q=cheap+vegetarian"

# Autocomplete
curl "http://localhost:5000/api/v1/menu/autocomplete?q=chick"
```

### 3. Demand Forecasting
```bash
# Login as admin
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fooddelivery.com","password":"admin123"}'

# Get forecast for an item
curl http://localhost:5000/api/v1/analytics/forecast/ITEM_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 💳 Test M-Pesa Integration

### Setup (Sandbox)
1. Get sandbox credentials from [Daraja Portal](https://developer.safaricom.co.ke/)
2. Update `.env`:
```env
MPESA_CONSUMER_KEY=your_sandbox_key
MPESA_CONSUMER_SECRET=your_sandbox_secret
MPESA_PASSKEY=sandbox_passkey
MPESA_SHORTCODE=174379
```

### Test Payment
```bash
# Create order first (returns orderId)

# Initiate M-Pesa payment
curl -X POST http://localhost:5000/api/v1/payments/mpesa/initiate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID",
    "phone": "+254700000000"
  }'

# Check your sandbox phone for STK Push
```

---

## 📱 Test SMS Notifications

### Setup
1. Sign up at [Africa's Talking](https://africastalking.com/)
2. Get API key
3. Update `.env`:
```env
AFRICASTALKING_API_KEY=your_api_key
AFRICASTALKING_USERNAME=sandbox
```

### SMS will be sent on:
- Order confirmation
- Payment success
- Status updates
- Delivery notifications

---

## 🔄 Test Real-time Features

### Using Browser
1. Open browser console (F12)
2. Paste:
```javascript
const socket = io('http://localhost:5000');
socket.emit('join_order', 'ORDER_ID');
socket.on('order_update', (data) => console.log('Update:', data));
```

### Trigger Updates
```bash
# Update order status (as admin)
curl -X PATCH http://localhost:5000/api/v1/orders/ORDER_ID/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"PREPARING"}'

# Watch console for real-time update
```

---

## 📊 View Analytics Dashboard

### Access Dashboard
```bash
# Login as admin
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fooddelivery.com","password":"admin123"}'

# Get dashboard data
curl http://localhost:5000/api/v1/analytics/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### View Insights
```bash
# Peak hours
curl http://localhost:5000/api/v1/analytics/peak-hours \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Customer segments
curl http://localhost:5000/api/v1/analytics/customers/segments \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Inventory optimization
curl http://localhost:5000/api/v1/analytics/inventory/optimize \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 🖼️ Update Images from Unsplash

```bash
# Get Unsplash API key from https://unsplash.com/developers
# Update .env
UNSPLASH_ACCESS_KEY=your_access_key

# Run image fetch script
cd backend
npx ts-node src/scripts/fetchUnsplashImages.ts

# Images will be updated in database
```

---

## 🗄️ Database Management

### View Data
```bash
cd backend
npm run prisma:studio
# Opens at http://localhost:5555
```

### Reset Database
```bash
npm run prisma:migrate reset
npm run seed
```

### Create New Migration
```bash
# After changing schema.prisma
npm run prisma:migrate
```

---

## 📝 View Logs

### Real-time Logs
```bash
cd backend

# All logs
tail -f logs/combined.log

# Errors only
tail -f logs/error.log
```

### Log Levels
- `info` - General information
- `warn` - Warnings
- `error` - Errors
- `debug` - Debug info

---

## 🐛 Common Issues & Fixes

### Port Already in Use
```bash
# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5173    # Windows

# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9
```

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_isready

# Start PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start    # Linux

# Verify connection string in .env
```

### Redis Connection Error
```bash
# Check Redis is running
redis-cli ping

# Start Redis
redis-server  # or brew services start redis
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Prisma Client Issues
```bash
npm run prisma:generate
```

---

## 🚀 Production Deployment

### Frontend (Vercel/Netlify)
```bash
# Build
npm run build

# Deploy (Vercel)
vercel --prod

# Or Netlify
netlify deploy --prod --dir=dist
```

### Backend (Railway/Heroku/AWS)

#### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create project
railway init

# Add PostgreSQL
railway add

# Deploy
railway up
```

#### Heroku
```bash
# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main
```

#### Environment Variables
Set these in your deployment platform:
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=...
MPESA_CONSUMER_KEY=...
AFRICASTALKING_API_KEY=...
NODE_ENV=production
```

---

## 📚 Next Steps

1. **Read Documentation**
   - [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - System architecture
   - [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) - Detailed setup
   - [backend/README.md](backend/README.md) - API reference

2. **Customize**
   - Add your menu items
   - Update branding
   - Configure payment providers
   - Set up production APIs

3. **Extend**
   - Add email notifications
   - Build mobile apps
   - Add more payment methods
   - Implement loyalty program

4. **Monitor**
   - Set up error tracking (Sentry)
   - Add monitoring (DataDog)
   - Configure alerts
   - Track metrics

---

## 🆘 Getting Help

### Documentation
- All `.md` files in project root
- Inline code comments
- API documentation in backend/README.md

### Support Channels
- GitHub Issues
- Email: support@fooddelivery.com
- Discord/Slack community

### Useful Commands
```bash
# Check system health
curl http://localhost:5000/health

# View database
npm run prisma:studio

# View logs
tail -f backend/logs/combined.log

# Test API
curl http://localhost:5000/api/v1/menu
```

---

## ✅ Verification Checklist

Before going to production, verify:

- [ ] All tests pass
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Redis connected
- [ ] SSL/TLS configured
- [ ] API keys in production mode
- [ ] Logging configured
- [ ] Error tracking setup
- [ ] Monitoring active
- [ ] Backup strategy in place
- [ ] Security headers enabled
- [ ] Rate limiting active

---

## 🎉 You're All Set!

Your food delivery platform is ready to serve customers!

### Key URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/v1
- Database UI: http://localhost:5555
- API Health: http://localhost:5000/health

### Default Credentials
- Admin: `admin@fooddelivery.com` / `admin123`
- Customer: `customer@test.com` / `customer123`

**Happy building! 🚀**

---

**Questions? Check the documentation or reach out for support!**

