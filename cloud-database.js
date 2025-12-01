const { Pool } = require('pg');

class CloudDatabase {
    constructor() {
        // Use Heroku PostgreSQL connection or local fallback
        const connectionConfig = {
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        };

        // If DATABASE_URL is not available, try individual env vars
        if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
            connectionConfig = {
                host: process.env.DB_HOST || 'localhost',
                port: process.env.DB_PORT || 5432,
                database: process.env.DB_NAME || 'postgres',
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || '',
                ssl: { rejectUnauthorized: false }
            };
        }

        this.pool = new Pool(connectionConfig);
        
        console.log('Database connection config:', {
            hasConnectionString: !!process.env.DATABASE_URL,
            nodeEnv: process.env.NODE_ENV,
            ssl: connectionConfig.ssl ? 'enabled' : 'disabled'
        });
        
        this.initializeDatabase();
    }

    async initializeDatabase() {
        try {
            await this.createTables();
            await this.seedSampleData();
            console.log('✅ PostgreSQL database initialized successfully');
        } catch (error) {
            console.error('❌ Database initialization error:', error);
        }
    }

    async createTables() {
        const createProductsTable = `
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                category VARCHAR(100),
                image TEXT,
                stock INTEGER DEFAULT 0,
                prep_time INTEGER DEFAULT 15,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const createOrdersTable = `
            CREATE TABLE IF NOT EXISTS orders (
                id SERIAL PRIMARY KEY,
                customer_name VARCHAR(255) NOT NULL,
                customer_email VARCHAR(255),
                customer_phone VARCHAR(50),
                delivery_address TEXT,
                items JSONB NOT NULL,
                total_amount DECIMAL(10,2) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                special_instructions TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        const createCategoriesTable = `
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await this.pool.query(createProductsTable);
        await this.pool.query(createOrdersTable);
        await this.pool.query(createCategoriesTable);
    }

    async function seedSampleData() {
        try {
            // Check if we need to refresh categories (if old categories exist)
            const categoryCheck = await this.pool.query('SELECT COUNT(*) FROM categories WHERE name = $1', ['Burgers']);
            
            if (parseInt(categoryCheck.rows[0].count) > 0) {
                // Old categories exist, clear and reseed
                console.log('🔄 Refreshing with new Walmart-style categories...');
                await this.pool.query('DELETE FROM products');
                await this.pool.query('DELETE FROM categories');
            } else {
                // Check if new data already exists
                const productCount = await this.pool.query('SELECT COUNT(*) FROM products');
                if (parseInt(productCount.rows[0].count) > 0) {
                    return; // New data already exists
                }
            }
        } catch (error) {
            console.log('⚠️ Category check failed, proceeding with seeding:', error.message);
            // If check fails, try to clear and continue
            try {
                await this.pool.query('DELETE FROM products');
                await this.pool.query('DELETE FROM categories');
            } catch (clearError) {
                console.log('⚠️ Clear failed, continuing anyway:', clearError.message);
            }
        }

        // Sample products with Walmart-style categories
        const sampleProducts = [
            { name: 'Spaghetti Carbonara', description: 'Creamy pasta with bacon and parmesan', price: 15.99, category: 'Global Cuisine', stock: 12, prep_time: 20 },
            { name: 'Chicken Pad Thai', description: 'Thai stir-fried noodles with chicken', price: 13.99, category: 'Global Cuisine', stock: 15, prep_time: 18 },
            { name: 'Frozen Pizza', description: 'Pepperoni pizza, ready to bake', price: 8.99, category: 'Frozen', stock: 25, prep_time: 25 },
            { name: 'Ice Cream Sandwiches', description: 'Vanilla ice cream between chocolate cookies', price: 6.99, category: 'Frozen', stock: 30, prep_time: 0 },
            { name: 'Sourdough Bread', description: 'Fresh baked artisan sourdough loaf', price: 4.99, category: 'Bakery & Bread', stock: 18, prep_time: 0 },
            { name: 'Chocolate Croissants', description: 'Buttery pastry with chocolate filling', price: 3.99, category: 'Bakery & Bread', stock: 12, prep_time: 0 },
            { name: 'Organic Bananas', description: 'Fresh organic bananas, 1 lb', price: 2.99, category: 'Fresh Produce', stock: 50, prep_time: 0 },
            { name: 'Baby Spinach', description: 'Fresh baby spinach leaves, 5 oz bag', price: 3.49, category: 'Fresh Produce', stock: 22, prep_time: 0 },
            { name: 'Atlantic Salmon', description: 'Fresh Atlantic salmon fillet, 1 lb', price: 12.99, category: 'Meat & Seafood', stock: 8, prep_time: 0 },
            { name: 'Ground Beef', description: '85% lean ground beef, 1 lb', price: 6.99, category: 'Meat & Seafood', stock: 15, prep_time: 0 },
            { name: 'Potato Chips', description: 'Classic salted potato chips', price: 2.49, category: 'Snacks', stock: 35, prep_time: 0 },
            { name: 'Mixed Nuts', description: 'Roasted and salted mixed nuts', price: 8.99, category: 'Snacks', stock: 20, prep_time: 0 },
            { name: 'Olive Oil', description: 'Extra virgin olive oil, 500ml', price: 11.99, category: 'Pantry', stock: 18, prep_time: 0 },
            { name: 'Jasmine Rice', description: 'Premium jasmine rice, 2 lb bag', price: 4.99, category: 'Pantry', stock: 25, prep_time: 0 },
            { name: 'Sliced Turkey', description: 'Fresh sliced turkey breast, 1 lb', price: 9.99, category: 'Deli', stock: 12, prep_time: 0 },
            { name: 'Swiss Cheese', description: 'Sliced Swiss cheese, 8 oz', price: 5.99, category: 'Deli', stock: 15, prep_time: 0 },
            { name: 'Whole Milk', description: 'Fresh whole milk, 1 gallon', price: 3.99, category: 'Dairy & Eggs', stock: 30, prep_time: 0 },
            { name: 'Free Range Eggs', description: 'Free range large eggs, dozen', price: 4.49, category: 'Dairy & Eggs', stock: 25, prep_time: 0 },
            { name: 'Orange Juice', description: 'Fresh squeezed orange juice, 64 oz', price: 4.99, category: 'Beverages', stock: 20, prep_time: 0 },
            { name: 'Sparkling Water', description: 'Natural sparkling water, 12 pack', price: 6.99, category: 'Beverages', stock: 40, prep_time: 0 },
            { name: 'Granola', description: 'Honey almond granola cereal', price: 5.99, category: 'Breakfast & Cereal', stock: 22, prep_time: 0 },
            { name: 'Instant Oatmeal', description: 'Quick cooking oatmeal, variety pack', price: 4.49, category: 'Breakfast & Cereal', stock: 28, prep_time: 0 },
            { name: 'Dark Chocolate', description: '70% cocoa dark chocolate bar', price: 3.99, category: 'Candy', stock: 35, prep_time: 0 },
            { name: 'Gummy Bears', description: 'Assorted fruit gummy bears', price: 2.99, category: 'Candy', stock: 45, prep_time: 0 }
        ];

        // Insert products
        for (const product of sampleProducts) {
            await this.pool.query(
                'INSERT INTO products (name, description, price, category, stock, prep_time) VALUES ($1, $2, $3, $4, $5, $6)',
                [product.name, product.description, product.price, product.category, product.stock, product.prep_time]
            );
        }

        // Walmart-style categories
        const categories = ['Global Cuisine', 'Frozen', 'Bakery & Bread', 'Fresh Produce', 'Meat & Seafood', 'Snacks', 'Pantry', 'Deli', 'Dairy & Eggs', 'Beverages', 'Breakfast & Cereal', 'Candy'];
        for (const category of categories) {
            await this.pool.query(
                'INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
                [category]
            );
        }
    }

    async getAllProducts() {
        const result = await this.pool.query('SELECT * FROM products ORDER BY id');
        return result.rows;
    }

    async getProductById(id) {
        const result = await this.pool.query('SELECT * FROM products WHERE id = $1', [id]);
        return result.rows[0];
    }

    async createProduct(productData) {
        const { name, description, price, category, image, stock, prep_time } = productData;
        const result = await this.pool.query(
            'INSERT INTO products (name, description, price, category, image, stock, prep_time) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, description, price, category, image || '', stock || 0, prep_time || 15]
        );
        return result.rows[0];
    }

    async updateProduct(id, productData) {
        const { name, description, price, category, image, stock, prep_time } = productData;
        const result = await this.pool.query(
            'UPDATE products SET name = $1, description = $2, price = $3, category = $4, image = $5, stock = $6, prep_time = $7 WHERE id = $8 RETURNING *',
            [name, description, price, category, image, stock, prep_time, id]
        );
        return result.rows[0];
    }

    async deleteProduct(id) {
        await this.pool.query('DELETE FROM products WHERE id = $1', [id]);
    }

    async getAllOrders() {
        const result = await this.pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        return result.rows;
    }

    async createOrder(orderData) {
        const { customer_name, customer_email, customer_phone, delivery_address, items, total, special_instructions } = orderData;
        const result = await this.pool.query(
            'INSERT INTO orders (customer_name, customer_email, customer_phone, delivery_address, items, total_amount, special_instructions) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [customer_name, customer_email || '', customer_phone || '', delivery_address || '', JSON.stringify(items), total, special_instructions || '']
        );
        return result.rows[0];
    }

    async updateOrderStatus(id, status) {
        const result = await this.pool.query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );
        return result.rows[0];
    }

    async getCategories() {
        const result = await this.pool.query('SELECT name FROM categories ORDER BY name');
        return result.rows.map(row => row.name);
    }

    async close() {
        await this.pool.end();
    }
}

module.exports = CloudDatabase;