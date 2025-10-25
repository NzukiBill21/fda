@echo off
echo 🚀 Starting Food Delivery App...
echo.

REM Check if setup has been done
if not exist "node_modules\" (
    echo 📦 Installing frontend dependencies...
    call npm install
)

if not exist "backend\node_modules\" (
    echo 📦 Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

echo.
echo ✨ Starting services...
echo.
echo 📱 Frontend will be available at: http://localhost:5173
echo 🔧 Backend will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop all services
echo.

REM Start both in new windows
start "Food Delivery Frontend" cmd /k "npm run dev"
start "Food Delivery Backend" cmd /k "cd backend && npm run dev"

echo.
echo ✅ Services started in separate windows!
echo Close the terminal windows to stop the services.
echo.
pause

