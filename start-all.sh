#!/bin/bash

echo "🚀 Starting Food Delivery App..."
echo ""

# Check if setup has been done
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

# Start Redis if not running
if ! redis-cli ping > /dev/null 2>&1; then
    echo "🔴 Starting Redis..."
    redis-server --daemonize yes 2>/dev/null || echo "⚠️  Please start Redis manually: redis-server"
fi

# Start PostgreSQL if not running (macOS)
if command -v pg_isready > /dev/null 2>&1; then
    if ! pg_isready > /dev/null 2>&1; then
        echo "🐘 Starting PostgreSQL..."
        brew services start postgresql 2>/dev/null || sudo service postgresql start 2>/dev/null || echo "⚠️  Please start PostgreSQL manually"
    fi
fi

echo ""
echo "✨ Starting services..."
echo ""
echo "📱 Frontend will be available at: http://localhost:5173"
echo "🔧 Backend will be available at: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start both in parallel
npm run dev &
FRONTEND_PID=$!

cd backend
npm run dev &
BACKEND_PID=$!

# Wait for both processes
wait $FRONTEND_PID $BACKEND_PID

