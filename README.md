# 🍕 DoorDash-Style Food Delivery System

A professional, production-ready food delivery system designed for single stores. Features customer ordering, admin management, real-time order tracking, and cloud deployment capabilities.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Heroku-430098)](https://nepali-store.herokuapp.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791)](https://www.postgresql.org/)

## 🚀 Quick Start

### Local Development
```bash
# Clone repository
git clone https://github.com/ArSubba/doordash-store-delivery.git
cd doordash-store-delivery

# Install dependencies
npm install

# Start local server (uses JSON database)
npm run local

# Access your store
open http://localhost:3000
```

### Cloud Deployment (Heroku)
```bash
# Start cloud server (uses PostgreSQL)
npm start

# Deploy to Heroku
git push heroku main
```

## ✨ Features

### 🛒 Customer Experience
- **Product Browsing**: 10+ food categories with search and filters
- **Shopping Cart**: Dynamic cart with quantity management
- **Order Placement**: Secure checkout with customer details
- **Real-time Updates**: Live order status tracking
- **Mobile Responsive**: Perfect experience on all devices
- **Fast Loading**: Optimized performance and caching

### 👨‍💼 Admin Dashboard
- **Product Management**: Full CRUD operations with image uploads
- **Order Management**: Real-time order tracking and status updates
- **Analytics Dashboard**: Revenue tracking, sales metrics, customer insights
- **Inventory Control**: Stock management and availability settings
- **Image Upload**: Professional product photo management
- **Security**: Admin-only access with proper authentication

### 🔧 Technical Features
- **Dual Database Support**: JSON (development) + PostgreSQL (production)
- **Cloud Ready**: Heroku deployment with one-click setup
- **Security First**: Helmet.js, CORS, input validation, CSP policies
- **API-First**: RESTful API architecture for future mobile apps
- **Error Handling**: Comprehensive error logging and user feedback
- **Scalable Architecture**: Easy to extend for multiple stores

## 🏗️ Project Structure

```
📦 doordash-store-delivery/
├── 🌐 Frontend
│   ├── index.html              # Landing page with store navigation
│   ├── customer.html           # Customer store interface
│   └── admin.html              # Admin management dashboard
├── 🚀 Cloud Deployment
│   ├── cloud-server.js         # Production server (PostgreSQL)
│   ├── cloud-database.js       # PostgreSQL database operations
│   └── Procfile                # Heroku deployment configuration
├── 💻 Local Development
│   ├── local-server.js         # Development server (JSON)
│   └── backend/
│       ├── server.js           # Original backend server
│       ├── database.js         # JSON database operations
│       └── data/
│           ├── products.json   # Sample products
│           └── orders.json     # Order storage
├── 📸 Assets
│   └── uploads/                # Product images
├── ⚙️ Configuration
│   ├── package.json            # Dependencies and scripts
│   ├── .gitignore              # Git ignore rules
│   └── .env                    # Environment variables
└── 📚 Documentation
    └── README.md               # This file
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL (production) / JSON files (development)
- **Security**: Helmet.js, CORS, input validation
- **File Upload**: Multer with image validation
- **Environment**: dotenv for configuration

### Frontend
- **Languages**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS 3.x
- **Icons**: Lucide Icons
- **Architecture**: Responsive, mobile-first design
- **API Communication**: Fetch API with error handling

### Deployment
- **Platform**: Heroku
- **Database**: Heroku Postgres (Hobby tier - Free)
- **Storage**: File system (local) / Heroku filesystem
- **SSL**: Automatic HTTPS with Heroku
- **Process**: Web dyno with automatic scaling

## 📊 Sample Data

The system comes pre-loaded with:
- **10 Food Categories**: Burgers, Pizza, Asian, Appetizers, Desserts, etc.
- **20+ Sample Products**: Complete with descriptions, prices, and categories
- **Order Status Flow**: Pending → Preparing → Ready → Delivered
- **Analytics Data**: Revenue tracking and customer metrics

## 🎯 API Endpoints

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/admin/products` - Create product (Admin)
- `PUT /api/admin/products/:id` - Update product (Admin)
- `DELETE /api/admin/products/:id` - Delete product (Admin)

### Orders
- `GET /api/orders` - Get all orders (Admin)
- `POST /api/orders` - Create new order
- `PUT /api/admin/orders/:id` - Update order status (Admin)

### System
- `GET /api/categories` - Get product categories
- `GET /api/admin/analytics` - Get dashboard analytics (Admin)
- `POST /api/upload-image` - Upload product image (Admin)
- `GET /api/health` - System health check

## 🚀 Deployment Guide

### Heroku Deployment
1. **Create Heroku App**
   ```bash
   heroku create your-store-name
   ```

2. **Add PostgreSQL Database**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   ```

4. **Deploy Application**
   ```bash
   git push heroku main
   ```

5. **Open Your Store**
   ```bash
   heroku open
   ```

### Environment Variables
```env
NODE_ENV=production
DATABASE_URL=postgresql://... (auto-set by Heroku)
PORT=3000 (auto-set by Heroku)
```

## 🔒 Security Features

- **Helmet.js**: Security headers and XSS protection
- **CORS**: Cross-origin request security
- **Input Validation**: SQL injection and XSS prevention
- **File Upload Security**: Image validation and size limits
- **Error Handling**: Secure error responses
- **Environment Variables**: Sensitive data protection

## 📱 Mobile Responsiveness

- **Breakpoints**: Mobile-first responsive design
- **Touch Optimized**: Large buttons and easy navigation
- **Fast Loading**: Optimized images and minimal JavaScript
- **Offline Ready**: Service worker for basic offline functionality

## 🎨 Customization

### Branding
- Update colors in Tailwind configuration
- Replace logo and images in HTML files
- Modify store name and description

### Features
- Add new product categories in database
- Extend order status workflow
- Implement user authentication
- Add payment integration

### Scaling
- Add multiple store locations
- Implement delivery zones
- Add driver management system
- Integrate with external payment systems

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues
- **Port conflicts**: Change PORT in .env file
- **Database errors**: Check PostgreSQL connection
- **Image uploads**: Verify uploads/ directory permissions

### Getting Help
- **Documentation**: Check this README
- **Issues**: Open a GitHub issue
- **Discussions**: Use GitHub Discussions for questions

## 🎉 Live Demo

**Production URLs:**
- 🏪 **Customer Store**: https://nepali-store.herokuapp.com/customer
- 👨‍💼 **Admin Panel**: https://nepali-store.herokuapp.com/admin
- 🌐 **Landing Page**: https://nepali-store.herokuapp.com

**Test Credentials:**
- Customer: No login required - just start ordering!
- Admin: Access admin panel directly (no auth in demo)

---

**Built with ❤️ for small businesses looking to compete with the big delivery platforms**

*Ready to launch your food delivery empire? Deploy in 5 minutes!* 🚀