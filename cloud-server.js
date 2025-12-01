const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const CloudDatabase = require('./cloud-database');
require('dotenv').config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database with error handling
let db;
try {
    db = new CloudDatabase();
    console.log('✅ Database connection initialized');
} catch (error) {
    console.error('❌ Database connection failed:', error);
    // Create a mock database object to prevent crashes
    db = {
        getAllProducts: async () => ({ success: false, message: 'Database unavailable' }),
        createProduct: async () => ({ success: false, message: 'Database unavailable' }),
        // Add other methods as needed
    };
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:", "data:"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
            scriptSrcAttr: ["'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https:", "http:"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Admin credentials (in production, use environment variables)
const ADMIN_CREDENTIALS = {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123'
};

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Authentication required' });
    }
}

// Serve static files
app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadsDir));

// File upload setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `product-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// API Routes

// Authentication Routes
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        req.session.isAuthenticated = true;
        req.session.username = username;
        res.json({
            success: true,
            message: 'Login successful'
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

app.get('/api/auth/status', (req, res) => {
    res.json({
        success: true,
        isAuthenticated: !!req.session.isAuthenticated,
        username: req.session.username || null
    });
});

// Image upload endpoint
app.post('/api/upload-image', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const baseUrl = process.env.NODE_ENV === 'production' 
            ? `https://${req.get('host')}`
            : `http://localhost:${PORT}`;
        const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
        
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
app.get('/api/products', async (req, res) => {
    try {
        const { category, search } = req.query;
        let products = await db.getAllProducts();

        if (category && category !== 'All') {
            products = products.filter(p => p.category === category);
        }

        if (search) {
            products = products.filter(p => 
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.description.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await db.getProductById(req.params.id);
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
});

// Page Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/customer', (req, res) => {
    res.sendFile(path.join(__dirname, 'customer.html'));
});

// Admin: Create product (Protected)
app.post('/api/admin/products', requireAuth, async (req, res) => {
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

        const newProduct = await db.createProduct(productData);
        
        res.status(201).json({
            success: true,
            data: newProduct,
            message: 'Product created successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
});

// Admin: Update product (Protected)
app.put('/api/admin/products/:id', requireAuth, async (req, res) => {
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

        const updatedProduct = await db.updateProduct(req.params.id, productData);
        
        res.json({
            success: true,
            data: updatedProduct,
            message: 'Product updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
});

// Admin: Delete product (Protected)
app.delete('/api/admin/products/:id', requireAuth, async (req, res) => {
    try {
        await db.deleteProduct(req.params.id);
        
        res.json({
            success: true,
            message: 'Product deleted successfully'
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
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await db.getAllOrders();
        res.json({
            success: true,
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
});

app.post('/api/orders', async (req, res) => {
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
            special_instructions: specialInstructions || ''
        };

        const newOrder = await db.createOrder(orderData);

        res.status(201).json({
            success: true,
            data: newOrder,
            message: 'Order placed successfully'
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
app.put('/api/admin/orders/:id', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'preparing', 'ready', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }

        const updatedOrder = await db.updateOrderStatus(req.params.id, status);
        
        res.json({
            success: true,
            data: updatedOrder,
            message: 'Order status updated successfully'
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
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await db.getCategories();
        res.json({
            success: true,
            data: categories
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
app.get('/api/admin/analytics', async (req, res) => {
    try {
        const products = await db.getAllProducts();
        const orders = await db.getAllOrders();
        
        const totalProducts = products.length;
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
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
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
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

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await db.close();
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`🚀 Store Delivery System running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    if (process.env.NODE_ENV === 'production') {
        console.log(`🏪 Your Live Store: https://${process.env.HEROKU_APP_NAME}.herokuapp.com`);
        console.log(`👨‍💼 Admin Panel: https://${process.env.HEROKU_APP_NAME}.herokuapp.com/admin`);
        console.log(`🛒 Customer Store: https://${process.env.HEROKU_APP_NAME}.herokuapp.com/customer`);
    } else {
        console.log(`🏪 Customer Store: http://localhost:${PORT}/customer`);
        console.log(`👨‍💼 Admin Panel: http://localhost:${PORT}/admin`);
    }
});