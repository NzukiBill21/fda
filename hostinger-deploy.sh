#!/bin/bash

# Hostinger Deployment Script
# Run this on your Hostinger server after uploading files

echo "🚀 Starting Hostinger Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd backend
npm install --production

# Generate Prisma Client
echo -e "${YELLOW}🔧 Generating Prisma Client...${NC}"
npx prisma generate

# Run database migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
npx prisma migrate deploy

# Build backend
echo -e "${YELLOW}🏗️  Building backend...${NC}"
npm run build

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PM2...${NC}"
    npm install -g pm2
fi

# Start/restart application with PM2
echo -e "${YELLOW}🚀 Starting application with PM2...${NC}"
pm2 delete food-delivery-api 2>/dev/null || true
pm2 start dist/server.js --name "food-delivery-api"
pm2 save

echo -e "${GREEN}✅ Backend deployed successfully!${NC}"
echo -e "${GREEN}📊 Check status: pm2 status${NC}"
echo -e "${GREEN}📋 View logs: pm2 logs food-delivery-api${NC}"

# Frontend build (if needed)
cd ..
if [ -f "package.json" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
    
    echo -e "${YELLOW}🏗️  Building frontend...${NC}"
    npm run build
    
    echo -e "${GREEN}✅ Frontend built successfully!${NC}"
    echo -e "${YELLOW}📁 Upload contents of 'dist' folder to your public_html directory${NC}"
fi

echo -e "${GREEN}🎉 Deployment complete!${NC}"

