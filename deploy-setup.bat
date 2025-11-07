@echo off
REM Deployment Setup Script for Monda Food Delivery App (Windows)

echo 🚀 Monda Food Delivery - Deployment Setup
echo ==========================================
echo.

REM Check if build folder exists
if not exist "build" (
    echo ⚠️  Build folder not found. Building frontend...
    call npm run build
)

REM Check if backend-php .env exists
if not exist "backend-php\.env" (
    echo ⚠️  backend-php\.env not found. Creating from template...
    if exist "backend-php\ENV_TEMPLATE.txt" (
        copy "backend-php\ENV_TEMPLATE.txt" "backend-php\.env"
        echo ✅ Created backend-php\.env from template
        echo ⚠️  Please edit backend-php\.env with your database credentials
    )
)

REM Create .htaccess for build if it doesn't exist
if not exist "build\.htaccess" (
    echo Creating build\.htaccess...
    (
        echo RewriteEngine On
        echo RewriteBase /
        echo RewriteCond %%{REQUEST_FILENAME} !-f
        echo RewriteCond %%{REQUEST_FILENAME} !-d
        echo RewriteRule ^^(.*^)$ index.html [QSA,L]
    ) > "build\.htaccess"
    echo ✅ Created build\.htaccess
)

echo.
echo ✅ Deployment setup complete!
echo.
echo 📋 Next steps:
echo 1. Configure backend-php\.env with your database credentials
echo 2. Run: cd backend-php ^&^& php setup-database.php
echo 3. Upload files to your hosting
echo 4. Test your deployment
echo.
echo 📖 See DEPLOYMENT_README.md for detailed instructions
pause

