#!/bin/bash

# Railway Setup Script
# This script sets up the database for Railway deployment

echo "🚀 Setting up Railway deployment..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set!"
    echo "Please set DATABASE_URL in Railway dashboard"
    exit 1
fi

# Check if DATABASE_URL is PostgreSQL
if [[ "$DATABASE_URL" == *"postgresql"* ]] || [[ "$DATABASE_URL" == *"postgres"* ]]; then
    echo "✅ PostgreSQL detected"
    
    # Use production schema for PostgreSQL
    if [ -f "prisma/schema.production.prisma" ]; then
        echo "📝 Using production Prisma schema..."
        cp prisma/schema.production.prisma prisma/schema.prisma
    fi
else
    echo "ℹ️  SQLite detected (using default schema)"
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

echo "✅ Railway setup complete!"

