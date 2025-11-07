#!/bin/bash
# Deployment Setup Script for Monda Food Delivery App

echo "🚀 Monda Food Delivery - Deployment Setup"
echo "=========================================="
echo ""

# Check if build folder exists
if [ ! -d "build" ]; then
    echo "⚠️  Build folder not found. Building frontend..."
    npm run build
fi

# Check if backend-php .env exists
if [ ! -f "backend-php/.env" ]; then
    echo "⚠️  backend-php/.env not found. Creating from template..."
    if [ -f "backend-php/ENV_TEMPLATE.txt" ]; then
        cp backend-php/ENV_TEMPLATE.txt backend-php/.env
        echo "✅ Created backend-php/.env from template"
        echo "⚠️  Please edit backend-php/.env with your database credentials"
    fi
fi

# Create .htaccess for build if it doesn't exist
if [ ! -f "build/.htaccess" ]; then
    echo "Creating build/.htaccess..."
    cat > build/.htaccess << 'EOF'
RewriteEngine On
RewriteBase /
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]
EOF
    echo "✅ Created build/.htaccess"
fi

echo ""
echo "✅ Deployment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Configure backend-php/.env with your database credentials"
echo "2. Run: cd backend-php && php setup-database.php"
echo "3. Upload files to your hosting"
echo "4. Test your deployment"
echo ""
echo "📖 See DEPLOYMENT_README.md for detailed instructions"

