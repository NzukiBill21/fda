#!/bin/bash

# Railway Build Script
# This script builds the backend for Railway deployment

set -e  # Exit on error

echo "🚀 Starting Railway build..."

# Navigate to backend directory
cd "$(dirname "$0")" || exit 1

echo "📦 Installing dependencies..."
npm install

echo "🔧 Detecting database type..."
node use-postgresql.js

echo "🏗️  Building TypeScript..."
npm run build

echo "🔧 Generating Prisma Client..."
npx prisma generate --schema=./prisma/schema.prisma

echo "✅ Build complete!"

