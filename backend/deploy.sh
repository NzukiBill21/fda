#!/bin/bash

# Deployment script for backend
echo "🚀 Starting deployment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file from .env.example"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Build TypeScript
echo "🏗️  Building TypeScript..."
npm run build

# Check if build succeeded
if [ ! -d "dist" ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"
echo "📝 To start the server, run: npm start"
echo "📝 Or use PM2: pm2 start ecosystem.config.js"

