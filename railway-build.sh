#!/bin/bash

# Railway Build Script - Root Level
# This script builds both frontend and backend for Railway

set -e  # Exit on error

echo "🚀 Starting Railway build..."

# Build frontend
echo "📦 Building frontend..."
npm install
npm run build

# Build backend
echo "📦 Building backend..."
cd backend

echo "📦 Installing backend dependencies..."
npm install

echo "🔧 Detecting database type..."
node use-postgresql.js

echo "🏗️  Building TypeScript..."
npm run build

echo "🔧 Generating Prisma Client..."
npx prisma generate --schema=./prisma/schema.prisma

echo "✅ Build complete!"

