# Store Delivery System - Heroku Deployment Guide

## Quick Deploy to Heroku

### Prerequisites
1. Install Heroku CLI: `brew install heroku/brew/heroku`
2. Create Heroku account at https://heroku.com
3. Have your project ready for deployment

### Step 1: Initialize Heroku App
```bash
# Login to Heroku
heroku login

# Create new Heroku app (replace 'your-store-name' with your desired name)
heroku create your-store-name

# Add PostgreSQL database
heroku addons:create heroku-postgresql:hobby-dev

# Set environment to production
heroku config:set NODE_ENV=production
```

### Step 2: Configure Database
```bash
# Get database URL (automatically set by Heroku)
heroku config:get DATABASE_URL

# The DATABASE_URL will be automatically available in your app
```

### Step 3: Deploy Application
```bash
# Add and commit all files
git add .
git commit -m "Initial cloud deployment"

# Deploy to Heroku
git push heroku main
```

### Step 4: Initialize Database
```bash
# The database will automatically initialize with sample data on first run
# Check logs to verify
heroku logs --tail
```

### Step 5: Open Your Store
```bash
# Open customer store
heroku open

# Get your app URLs
echo "Customer Store: https://your-app-name.herokuapp.com/customer"
echo "Admin Panel: https://your-app-name.herokuapp.com/admin"
```

## Environment Variables

Your app uses these environment variables (automatically set by Heroku):
- `DATABASE_URL` - PostgreSQL connection string (auto-set by addon)
- `NODE_ENV` - Set to 'production' 
- `PORT` - Set by Heroku automatically

## File Structure for Cloud
```
📁 Your Project/
├── 📄 cloud-server.js      # Main server file (combines frontend + backend)
├── 📄 cloud-database.js    # PostgreSQL database operations
├── 📄 package-cloud.json   # Cloud dependencies
├── 📄 Procfile             # Heroku process definition
├── 📄 .env                 # Local environment (not deployed)
├── 📁 uploads/             # Image uploads (created automatically)
├── 📄 index.html           # Landing page
├── 📄 customer.html        # Customer store interface
├── 📄 admin.html           # Admin panel
└── 📄 README-DEPLOY.md     # This guide
```

## Database Schema
The app automatically creates these tables:
- `products` - Store inventory with images
- `orders` - Customer orders with status tracking
- `categories` - Product categories

## Admin Panel Features
- 📊 Dashboard with analytics
- 🛍️ Product management (add/edit/delete)
- 📋 Order management and status updates
- 📷 Image upload for products
- 💰 Revenue tracking

## Customer Store Features
- 🏪 Browse products by category
- 🔍 Search functionality
- 🛒 Shopping cart
- 📱 Mobile-responsive design
- 📦 Order tracking
- ⭐ Product ratings and reviews

## Troubleshooting

### Check App Status
```bash
heroku ps
heroku logs --tail
```

### Database Issues
```bash
# Reset database (WARNING: Deletes all data)
heroku pg:reset DATABASE_URL --confirm your-app-name

# The app will recreate tables and sample data on next restart
heroku restart
```

### Scale App
```bash
# Check current dynos
heroku ps

# Scale to ensure app is running
heroku ps:scale web=1
```

## Production Features
✅ PostgreSQL database with automatic backups  
✅ Professional cloud hosting (24/7 uptime)  
✅ Automatic SSL certificates  
✅ Scalable architecture  
✅ Image upload and storage  
✅ Real-time order management  
✅ Mobile-responsive design  
✅ Security headers and CORS  
✅ Error logging and monitoring  

## Support
- Heroku Dashboard: https://dashboard.heroku.com/apps
- PostgreSQL Addon: View in Heroku dashboard → Resources tab
- App Metrics: Available in Heroku dashboard → Metrics tab

Your store is now live at: https://your-app-name.herokuapp.com! 🎉