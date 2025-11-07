@echo off
echo ========================================
echo Monda Food Delivery - Database Setup
echo ========================================
echo.

REM Check if PHP is available
where php >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PHP is not installed or not in PATH
    echo Please install PHP or add it to your PATH
    echo.
    pause
    exit /b 1
)

echo Step 1: Creating .env file...
php create-env.php
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create .env file
    pause
    exit /b 1
)

echo.
echo Step 2: Setting up database...
php setup-database.php
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Database setup failed
    pause
    exit /b 1
)

echo.
echo Step 3: Migrating data from SQLite...
php migrate-sqlite-to-mysql.php
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Migration failed or no SQLite database found
    echo This is OK if you don't have existing data
)

echo.
echo Step 4: Testing connection...
php test-connection.php
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Connection test failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
pause

