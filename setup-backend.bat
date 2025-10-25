@echo off
echo 🚀 Setting up Food Delivery Backend...
echo.

cd backend

echo 📦 Installing dependencies...
call npm install

echo ⚙️  Creating environment file...
(
echo DATABASE_URL="postgresql://postgres:postgres@localhost:5432/food_delivery_db"
echo REDIS_URL="redis://localhost:6379"
echo PORT=5000
echo NODE_ENV=development
echo JWT_SECRET="super_secret_jwt_key_change_this_in_production_min_32_chars"
echo JWT_EXPIRES_IN=7d
echo MPESA_CONSUMER_KEY=sandbox_key
echo MPESA_CONSUMER_SECRET=sandbox_secret
echo MPESA_PASSKEY=sandbox_passkey
echo MPESA_SHORTCODE=174379
echo MPESA_CALLBACK_URL=http://localhost:5000/api/payments/mpesa/callback
echo AFRICASTALKING_API_KEY=sandbox_key
echo AFRICASTALKING_USERNAME=sandbox
echo UNSPLASH_ACCESS_KEY=your_key_here
echo ADMIN_EMAIL=admin@fooddelivery.com
echo ADMIN_PASSWORD=admin123
) > .env

echo 🗄️  Creating database...
createdb food_delivery_db 2>nul

echo 🔧 Generating Prisma client...
call npm run prisma:generate

echo 📊 Running database migrations...
call npm run prisma:migrate

echo 🌱 Seeding database with sample data...
call npm run seed

echo.
echo ✅ Backend setup complete!
echo.
echo To start the backend server, run:
echo   cd backend
echo   npm run dev
echo.
pause

