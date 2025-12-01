#!/bin/bash
# Script to change admin credentials for your Walmart Grocery Store

echo "🔐 Walmart Grocery Store - Admin Credentials Manager"
echo "=================================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    touch .env
fi

echo "Current admin settings:"
echo "Username: $(grep ADMIN_USERNAME .env 2>/dev/null | cut -d= -f2 || echo 'admin (default)')"
echo "Password: $(grep ADMIN_PASSWORD .env 2>/dev/null | cut -d= -f2 | sed 's/./*/g' || echo 'admin123 (default)')"
echo ""

read -p "Enter new admin username: " new_username
read -s -p "Enter new admin password: " new_password
echo ""

# Remove existing admin credentials from .env
grep -v "ADMIN_USERNAME=" .env > .env.tmp && mv .env.tmp .env
grep -v "ADMIN_PASSWORD=" .env > .env.tmp && mv .env.tmp .env

# Add new credentials
echo "ADMIN_USERNAME=$new_username" >> .env
echo "ADMIN_PASSWORD=$new_password" >> .env

echo ""
echo "✅ Admin credentials updated successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. For LOCAL testing: Restart your server (node cloud-server.js)"
echo "2. For HEROKU deployment:"
echo "   heroku config:set ADMIN_USERNAME=$new_username -a nepali-store"
echo "   heroku config:set ADMIN_PASSWORD=$new_password -a nepali-store"
echo ""
echo "🔒 Your admin panel: https://nepali-store-0ec657b3f22f.herokuapp.com/admin"
echo "   Username: $new_username"
echo "   Password: [hidden]"