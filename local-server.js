const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import local database (fallback to JSON for local testing)
const Database = require('./backend/database');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
const db = new Database();

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
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "http:", "http://localhost:3000"],
            connectSrc: ["'self'", "https:", "http:", "http://localhost:3000"],
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
        const { category, search } = req.query;
        let products = db.getAllProducts();

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

app.get('/api/products/:id', (req, res) => {
    try {
        const product = db.getProductById(req.params.id);
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

        const newProduct = db.createProduct(productData);
        
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

        const updatedProduct = db.updateProduct(req.params.id, productData);
        
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

// Admin: Delete product
app.delete('/api/admin/products/:id', (req, res) => {
    try {
        db.deleteProduct(req.params.id);
        
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
app.get('/api/orders', (req, res) => {
    try {
        const orders = db.getAllOrders();
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
            customerName,
            customerEmail: customerEmail || '',
            customerPhone: customerPhone || '',
            deliveryAddress: address || '',
            items,
            totalAmount: parseFloat(total),
            specialInstructions: specialInstructions || ''
        };

        const newOrder = db.createOrder(orderData);

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
app.put('/api/admin/orders/:id', (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'preparing', 'ready', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }

        const updatedOrder = db.updateOrderStatus(req.params.id, status);
        
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
app.get('/api/categories', (req, res) => {
    try {
        const categories = db.getCategories();
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
app.get('/api/admin/analytics', (req, res) => {
    try {
        const products = db.getAllProducts();
        const orders = db.getAllOrders();
        
        const totalProducts = products.length;
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
        const activeCustomers = new Set(orders.map(order => order.customerEmail)).size;
        
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

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/customer', (req, res) => {
    res.sendFile(path.join(__dirname, 'customer.html'));
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
    console.log(`🚀 Store Delivery System running locally on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📱 Customer Store: http://localhost:${PORT}/customer`);
    console.log(`👨‍💼 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`🏠 Landing Page: http://localhost:${PORT}`);
    console.log(`\n✨ Ready to take orders! Press Ctrl+C to stop the server.`);
});