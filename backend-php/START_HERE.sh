#!/bin/bash

# Quick Navigation and Setup Script
# This script will navigate to the correct directory and run setup

echo "🚀 Monda Food Delivery - Quick Setup"
echo "====================================="
echo ""

# Navigate to backend-php directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📍 Current directory: $(pwd)"
echo ""

# Check if we're in the right place
if [ ! -f "run-complete-setup.sh" ]; then
    echo "❌ ERROR: run-complete-setup.sh not found!"
    echo "Please run this script from the backend-php directory"
    exit 1
fi

echo "✅ Found setup script"
echo ""

# Make scripts executable
chmod +x run-complete-setup.sh
chmod +x run-setup.sh

echo "🔧 Running complete setup..."
echo ""

# Run the complete setup
./run-complete-setup.sh

