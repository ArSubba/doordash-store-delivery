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

    async seedSampleData() {
        // Check if we need to update to Walmart grocery products
        const productCount = await this.pool.query('SELECT COUNT(*) FROM products');
        const existingProduct = await this.pool.query("SELECT name FROM products WHERE name = 'Organic Bananas' LIMIT 1");
        
        // If we have products but not our Walmart grocery products, clear and reseed
        if (parseInt(productCount.rows[0].count) > 0 && existingProduct.rows.length === 0) {
            console.log('🔄 Updating to Walmart grocery products...');
            await this.pool.query('DELETE FROM products');
            await this.pool.query('DELETE FROM categories');
        } else if (parseInt(productCount.rows[0].count) > 0) {
            return; // Data already exists and is correct
        }

        // Sample products - Walmart style grocery store
        const sampleProducts = [
            // Fresh Produce
            { name: 'Organic Bananas', description: 'Fresh organic bananas, 2 lbs', price: 2.98, category: 'Fresh Produce', stock: 50, prep_time: 0 },
            { name: 'Baby Spinach', description: 'Fresh baby spinach, 5 oz container', price: 3.47, category: 'Fresh Produce', stock: 25, prep_time: 0 },
            { name: 'Roma Tomatoes', description: 'Fresh Roma tomatoes, per lb', price: 1.78, category: 'Fresh Produce', stock: 40, prep_time: 0 },
            
            // Meat
            { name: 'Ground Beef', description: '85% lean ground beef, 1 lb package', price: 6.98, category: 'Meat', stock: 20, prep_time: 0 },
            { name: 'Chicken Breast', description: 'Boneless skinless chicken breast, per lb', price: 4.87, category: 'Meat', stock: 15, prep_time: 0 },
            
            // Dairy & Eggs
            { name: 'Whole Milk', description: 'Great Value whole milk, 1 gallon', price: 3.68, category: 'Dairy & Eggs', stock: 30, prep_time: 0 },
            { name: 'Large Eggs', description: 'Grade AA large eggs, 18 count', price: 2.92, category: 'Dairy & Eggs', stock: 25, prep_time: 0 },
            { name: 'Cheddar Cheese', description: 'Sharp cheddar cheese block, 8 oz', price: 4.98, category: 'Dairy & Eggs', stock: 18, prep_time: 0 },
            
            // Beverages
            { name: 'Coca-Cola', description: 'Coca-Cola classic, 12 pack cans', price: 6.48, category: 'Beverages', stock: 35, prep_time: 0 },
            { name: 'Orange Juice', description: 'Simply Orange juice, 52 fl oz', price: 4.98, category: 'Beverages', stock: 20, prep_time: 0 },
            
            // Snacks
            { name: 'Lay\'s Potato Chips', description: 'Lay\'s classic potato chips, family size', price: 4.98, category: 'Snacks', stock: 28, prep_time: 0 },
            { name: 'Oreo Cookies', description: 'Oreo chocolate sandwich cookies', price: 4.38, category: 'Snacks', stock: 22, prep_time: 0 },
            
            // Breakfast & Cereal
            { name: 'Cheerios', description: 'General Mills Cheerios cereal, 18 oz', price: 5.64, category: 'Breakfast & Cereal', stock: 24, prep_time: 0 },
            { name: 'Wonder Bread', description: 'Wonder bread classic white, 20 oz loaf', price: 1.28, category: 'Breakfast & Cereal', stock: 32, prep_time: 0 },
            
            // Deli
            { name: 'Sliced Turkey', description: 'Deli fresh sliced turkey breast, per lb', price: 7.98, category: 'Deli', stock: 15, prep_time: 0 },
            
            // Candy
            { name: 'Snickers Bar', description: 'Snickers chocolate candy bar, king size', price: 1.98, category: 'Candy', stock: 45, prep_time: 0 }
        ];

        // Insert products
        for (const product of sampleProducts) {
            await this.pool.query(
                'INSERT INTO products (name, description, price, category, stock, prep_time) VALUES ($1, $2, $3, $4, $5, $6)',
                [product.name, product.description, product.price, product.category, product.stock, product.prep_time]
            );
        }

        // Sample categories - Walmart style
        const categories = ['Fresh Produce', 'Meat', 'Dairy & Eggs', 'Beverages', 'Snacks', 'Breakfast & Cereal', 'Deli', 'Candy'];
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