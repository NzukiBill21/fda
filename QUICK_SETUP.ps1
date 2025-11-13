# Quick Setup Script for PHP Backend
# Run this in PowerShell as Administrator

Write-Host "=== MONDAS PHP BACKEND SETUP ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create .env file
Write-Host "Step 1: Creating .env file..." -ForegroundColor Yellow
$envPath = "C:\xampp\htdocs\Food-Delivery-App\backend-php\.env"
if (-not (Test-Path $envPath)) {
    @"
DB_HOST=localhost
DB_NAME=mondas_db
DB_USER=root
DB_PASS=
JWT_SECRET=your_super_secret_jwt_key_change_in_production
"@ | Out-File -FilePath $envPath -Encoding UTF8
    Write-Host "✅ Created .env file" -ForegroundColor Green
    Write-Host "📝 Please edit $envPath with your database password if needed" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Step 2: Check Apache config
Write-Host "`nStep 2: Checking Apache configuration..." -ForegroundColor Yellow
$httpdConf = "C:\xampp\apache\conf\httpd.conf"

if (Test-Path $httpdConf) {
    $content = Get-Content $httpdConf -Raw
    
    # Check mod_rewrite
    if ($content -match "LoadModule rewrite_module.*modules/mod_rewrite\.so" -and 
        $content -notmatch "#LoadModule rewrite_module") {
        Write-Host "✅ mod_rewrite is enabled" -ForegroundColor Green
    } else {
        Write-Host "⚠️  mod_rewrite needs to be enabled" -ForegroundColor Yellow
        Write-Host "   Edit: C:\xampp\apache\conf\httpd.conf" -ForegroundColor Gray
        Write-Host "   Find: #LoadModule rewrite_module modules/mod_rewrite.so" -ForegroundColor Gray
        Write-Host "   Remove the # to uncomment it" -ForegroundColor Gray
    }
    
    # Check AllowOverride
    if ($content -match "AllowOverride\s+All") {
        Write-Host "✅ AllowOverride is set to All" -ForegroundColor Green
    } else {
        Write-Host "⚠️  AllowOverride should be set to All" -ForegroundColor Yellow
        Write-Host "   Edit: C:\xampp\apache\conf\httpd.conf" -ForegroundColor Gray
        Write-Host "   Find the <Directory> section for htdocs" -ForegroundColor Gray
        Write-Host "   Set: AllowOverride All" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ httpd.conf not found at $httpdConf" -ForegroundColor Red
}

# Step 3: Instructions
Write-Host "`nStep 3: Next Steps" -ForegroundColor Yellow
Write-Host "1. Edit backend-php/.env with your database credentials" -ForegroundColor White
Write-Host "2. Enable mod_rewrite in httpd.conf (if not already)" -ForegroundColor White
Write-Host "3. Restart Apache from XAMPP Control Panel" -ForegroundColor White
Write-Host "4. Test: http://localhost/mondas-api/api/health" -ForegroundColor White
Write-Host ""
Write-Host "📄 See APACHE_SETUP_GUIDE.md for detailed instructions" -ForegroundColor Cyan




