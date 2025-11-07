@echo off
echo ========================================
echo Starting Monda Food Delivery on XAMPP
echo ========================================
echo.

REM Check if XAMPP is installed
if not exist "C:\xampp\xampp-control.exe" (
    echo ERROR: XAMPP not found at C:\xampp\
    echo Please install XAMPP or update the path in this script
    pause
    exit /b 1
)

echo Starting XAMPP Control Panel...
start "" "C:\xampp\xampp-control.exe"

echo.
echo ========================================
echo Setup Instructions:
echo ========================================
echo 1. In XAMPP Control Panel, click START for Apache
echo 2. Click START for MySQL
echo 3. Wait for both to show green "Running"
echo 4. Open browser and go to:
echo    http://localhost/fda/build/
echo.
echo ========================================
echo Database Setup:
echo ========================================
echo Run this command to setup database:
echo   cd backend-php
echo   php setup-database.php
echo.
pause

