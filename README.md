# DoorDash-Style Food Delivery System

A complete single-store food delivery system with customer ordering, admin management, and real-time order tracking.

## 🚀 Quick Start

### Run the App
```bash
# Install dependencies
npm install

# Start the server
npm start
```

### Access Your Store
- **Customer Store**: http://localhost:3000/customer
- **Admin Panel**: http://localhost:3000/admin
- **Landing Page**: http://localhost:3000

## ✨ Features

### 🛒 Customer Store
- Browse 20 food items across categories
- Search and filter products
- Shopping cart with quantity management
- Order placement with customer details
- Mobile-responsive design

### 👨‍💼 Admin Panel
- Product management (add, edit, delete with images)
- Order tracking and status updates
- Analytics dashboard with revenue tracking
- Image upload for products
- Real-time order management

## 🏗️ Project Structure
```
├── local-server.js         # Main server (frontend + backend)
├── backend/
│   ├── server.js           # Original backend server
│   ├── database.js         # JSON database operations
│   └── data/
│       ├── products.json   # 20 sample products
│       └── orders.json     # Order storage
├── uploads/                # Product images
├── index.html              # Landing page
├── customer.html           # Customer store interface
├── admin.html              # Admin management panel
└── package.json            # Dependencies
```

## 🛠️ Tech Stack
- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express
- **Database**: JSON file storage
- **Security**: Helmet.js, CORS
- **File Upload**: Multer for images

## 📊 Sample Data
Includes 20 pre-loaded food items:
- 🍔 Burgers & Sandwiches
- 🍕 Pizza & Italian  
- 🍜 Asian Cuisine
- 🍟 Appetizers & Sides
- 🍰 Desserts
- 🥤 Beverages

## 🔧 Commands
```bash
npm start          # Start the server
npm run dev        # Start with nodemon (if installed)
```

Ready to take orders! 🎉