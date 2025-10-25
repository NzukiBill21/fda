#!/bin/bash

echo "🚀 Setting up Food Delivery Backend..."
echo ""

# Navigate to backend directory
cd backend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file with defaults
echo "⚙️  Creating environment file..."
cat > .env << 'EOF'
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/food_delivery_db"
REDIS_URL="redis://localhost:6379"
PORT=5000
NODE_ENV=development
JWT_SECRET="super_secret_jwt_key_change_this_in_production_min_32_chars"
JWT_EXPIRES_IN=7d
MPESA_CONSUMER_KEY=sandbox_key
MPESA_CONSUMER_SECRET=sandbox_secret
MPESA_PASSKEY=sandbox_passkey
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=http://localhost:5000/api/payments/mpesa/callback
AFRICASTALKING_API_KEY=sandbox_key
AFRICASTALKING_USERNAME=sandbox
UNSPLASH_ACCESS_KEY=your_key_here
ADMIN_EMAIL=admin@fooddelivery.com
ADMIN_PASSWORD=admin123
EOF

# Create database
echo "🗄️  Creating database..."
createdb food_delivery_db 2>/dev/null || echo "Database already exists, continuing..."

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run prisma:generate

# Run migrations
echo "📊 Running database migrations..."
npm run prisma:migrate

# Seed database
echo "🌱 Seeding database with sample data..."
npm run seed

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "To start the backend server, run:"
echo "  cd backend && npm run dev"
echo ""

