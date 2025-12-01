# Store Delivery System

A complete DoorDash-like food delivery system designed for a single store. This system includes both admin and customer interfaces with full product management, order processing, and real-time tracking capabilities.

## 🚀 Features

### Admin Dashboard
- **Complete Product Management**: Add, edit, delete products with images and pricing
- **Real-time Order Management**: View and update order status in real-time
- **Inventory Control**: Track stock levels and manage availability
- **Price Management**: Dynamic pricing control for all products
- **Analytics Dashboard**: View sales, revenue, and customer analytics
- **Category Management**: Organize products by categories

### Customer Interface
- **Product Browsing**: View all available products with images and descriptions
- **Advanced Search & Filtering**: Find products by name, category, or description
- **Shopping Cart**: Add/remove items with quantity management
- **Secure Checkout**: Complete order placement with delivery details
- **Order Tracking**: Real-time order status updates
- **Responsive Design**: Works perfectly on mobile and desktop

### Technical Features
- **Real-time Updates**: Live order status and inventory updates
- **RESTful API**: Clean API architecture for all operations
- **Security**: Rate limiting, CORS protection, input validation
- **Scalable Architecture**: Easy to extend and customize

## 🛠 Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful icons
- **Responsive Design**: Mobile-first approach

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security middleware
- **Rate Limiting**: API protection

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### 1. Project Setup
The project is already set up in your current directory with both frontend and backend components.

### 2. Start the Backend Server
```bash
# Navigate to backend directory and start the API server
cd backend
npm run dev
```

The backend server will start on **http://localhost:3001**

### 3. Access the Applications
- **Main Landing Page**: Open `index.html` in your browser
- **Customer Store**: Open `customer.html` in your browser  
- **Admin Dashboard**: Open `admin.html` in your browser
- **API Endpoints**: http://localhost:3001/api

### 4. Quick Start
1. Start the backend server: `cd backend && npm run dev`
2. Open `index.html` in your browser
3. Click on "Admin Dashboard" to manage products and orders
4. Click on "Customer Store" to browse and order products

## 📱 Usage Guide

### Admin Dashboard
1. Navigate to `/admin`
2. Use the **Products** tab to:
   - Add new products with images, prices, and descriptions
   - Edit existing products and update prices
   - Manage inventory levels
   - Delete products
3. Use the **Orders** tab to:
   - View all customer orders
   - Update order status (pending → preparing → ready → delivered)
   - Track order details and customer information
4. Use the **Overview** tab to:
   - Monitor sales analytics
   - View recent orders
   - Track business metrics

### Customer Interface
1. Navigate to `/customer`
2. Browse products by category or search
3. Add items to cart with desired quantities
4. Review cart and proceed to checkout
5. Enter delivery address and payment details
6. Place order and receive confirmation

## 🔧 API Endpoints

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/admin/products` - Create new product (Admin)
- `PUT /api/admin/products/:id` - Update product (Admin)
- `DELETE /api/admin/products/:id` - Delete product (Admin)

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/admin/orders/:id` - Update order status (Admin)

### Other
- `GET /api/categories` - Get product categories
- `GET /api/admin/analytics` - Get analytics data (Admin)
- `GET /api/health` - Health check

## 🎯 Customization

### Adding New Product Categories
Edit the category options in:
- Frontend: `src/app/admin/page.tsx` (ProductModal component)
- Backend: No changes needed (categories are dynamic)

### Modifying Order Status Flow
Update the status options in:
- Backend: `backend/server.js` (order status validation)
- Frontend: `src/app/admin/page.tsx` (order management)

### Styling Customization
- Colors: Edit `tailwind.config.js`
- Components: Modify individual page files
- Global styles: Edit `src/app/globals.css`

## 🚀 Production Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
npm start
```

### Backend (Railway/Heroku/DigitalOcean)
```bash
cd backend
npm start
```

### Environment Variables
Set up the following in production:
- `NODE_ENV=production`
- `FRONTEND_URL=your-frontend-domain`
- `PORT=5000` (or assigned by host)

## 🔐 Security Features

- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Secure cross-origin requests
- **Input Validation**: Prevents malicious data
- **Helmet Security**: Sets security headers
- **Error Handling**: Secure error responses

## 📈 Future Enhancements

### Planned Features
- **User Authentication**: Login/signup for customers and admins
- **Payment Integration**: Stripe/PayPal integration
- **Real-time Notifications**: WebSocket-based updates
- **Database Integration**: MongoDB/PostgreSQL support
- **Image Upload**: File upload for product images
- **Advanced Analytics**: Detailed reporting and charts
- **Mobile App**: React Native companion app
- **Multi-store Support**: Expand to multiple store locations

### Database Schema (Future)
```sql
-- Products
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  image_url TEXT,
  inventory INTEGER DEFAULT 0,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
1. Check the API endpoints with `/api/health`
2. Verify both servers are running
3. Check browser console for frontend errors
4. Check terminal for backend errors

---

**Built with ❤️ for efficient store management and customer satisfaction**