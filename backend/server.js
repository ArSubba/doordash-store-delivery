const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Database = require('./database');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http://localhost:3001"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:3001", "http://localhost:8080"]
    }
  }
}));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize database
const db = new Database();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Serve uploaded images statically
app.use('/uploads', express.static(uploadsDir));

// Database is now initialized and used instead of in-memory arrays

// API Routes

// Image upload endpoint
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
});

// Products Routes
app.get('/api/products', (req, res) => {
  try {
    db.getAllProducts((err, products) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error fetching products',
          error: err.message
        });
      }

      const { category, search } = req.query;
      let filteredProducts = [...products];

      if (category && category !== 'All') {
        filteredProducts = filteredProducts.filter(p => p.category === category);
      }

      if (search) {
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description.toLowerCase().includes(search.toLowerCase())
        );
      }

      res.json({
        success: true,
        data: filteredProducts
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    db.getProductById(req.params.id, (err, product) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error fetching product',
          error: err.message
        });
      }
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      res.json({
        success: true,
        data: product
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// Admin: Create product
app.post('/api/admin/products', (req, res) => {
  try {
    const { name, description, price, category, image, stock, prep_time } = req.body;
    
    if (!name || !description || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const productData = {
      name,
      description,
      price: parseFloat(price),
      category,
      image: image || '',
      stock: parseInt(stock) || 0,
      prep_time: parseInt(prep_time) || 15
    };

    db.createProduct(productData, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error creating product',
          error: err.message
        });
      }
      
      res.status(201).json({
        success: true,
        data: { id: result.id, ...productData },
        message: 'Product created successfully'
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

// Admin: Update product
app.put('/api/admin/products/:id', (req, res) => {
  try {
    const { name, description, price, category, image, stock, prep_time } = req.body;
    
    const productData = {
      name,
      description,
      price: parseFloat(price),
      category,
      image,
      stock: parseInt(stock),
      prep_time: parseInt(prep_time)
    };

    db.updateProduct(req.params.id, productData, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error updating product',
          error: err.message
        });
      }
      
      res.json({
        success: true,
        data: { id: req.params.id, ...productData },
        message: 'Product updated successfully'
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});

// Admin: Delete product
app.delete('/api/admin/products/:id', (req, res) => {
  try {
    db.deleteProduct(req.params.id, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error deleting product',
          error: err.message
        });
      }
      
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

// Orders Routes
app.get('/api/orders', (req, res) => {
  try {
    db.getAllOrders((err, orders) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error fetching orders',
          error: err.message
        });
      }
      
      res.json({
        success: true,
        data: orders
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

app.post('/api/orders', (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, address, items, total, deliveryTime, specialInstructions } = req.body;
    
    if (!customerName || !items || !items.length || !total) {
      return res.status(400).json({
        success: false,
        message: 'Missing required order information'
      });
    }

    const orderData = {
      customer_name: customerName,
      customer_email: customerEmail || '',
      customer_phone: customerPhone || '',
      delivery_address: address || '',
      items,
      total: parseFloat(total),
      status: 'pending',
      payment_status: 'paid', // Assume payment is processed
      delivery_time: parseInt(deliveryTime) || 30,
      special_instructions: specialInstructions || ''
    };

    db.createOrder(orderData, (err, result) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error creating order',
          error: err.message
        });
      }

      res.status(201).json({
        success: true,
        data: { id: result.id, ...orderData },
        message: 'Order placed successfully'
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
});

// Admin: Update order status
app.put('/api/admin/orders/:id', (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'preparing', 'ready', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    db.updateOrderStatus(req.params.id, status, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error updating order status',
          error: err.message
        });
      }
      
      res.json({
        success: true,
        message: 'Order status updated successfully'
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: error.message
    });
  }
});

// Categories Route
app.get('/api/categories', (req, res) => {
  try {
    db.getAllProducts((err, products) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error fetching categories',
          error: err.message
        });
      }
      
      const categories = [...new Set(products.map(p => p.category))];
      res.json({
        success: true,
        data: categories
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// Analytics Routes (Admin)
app.get('/api/admin/analytics', (req, res) => {
  try {
    // Get products count
    db.getAllProducts((err, products) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error fetching analytics',
          error: err.message
        });
      }
      
      // Get orders data
      db.getAllOrders((err, orders) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            error: err.message
          });
        }
        
        const totalProducts = products.length;
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const activeCustomers = new Set(orders.map(order => order.customer_email)).size;
        
        const recentOrders = orders.slice(0, 5);
        
        res.json({
          success: true,
          data: {
            stats: {
              totalProducts,
              totalOrders,
              totalRevenue,
              activeCustomers
            },
            recentOrders
          }
        });
      });
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Admin API available at http://localhost:${PORT}/api/admin/`);
  console.log(`🛒 Customer API available at http://localhost:${PORT}/api/`);
});