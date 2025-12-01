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
        // Check if data already exists
        const productCount = await this.pool.query('SELECT COUNT(*) FROM products');
        if (parseInt(productCount.rows[0].count) > 0) {
            return; // Data already exists
        }

        // Sample products
        const sampleProducts = [
            { name: 'Classic Burger', description: 'Beef patty with lettuce, tomato, onion', price: 12.99, category: 'Burgers', stock: 25, prep_time: 12 },
            { name: 'Margherita Pizza', description: 'Fresh mozzarella, basil, tomato sauce', price: 16.99, category: 'Pizza', stock: 15, prep_time: 18 },
            { name: 'Caesar Salad', description: 'Romaine lettuce, parmesan, croutons', price: 9.99, category: 'Salads', stock: 20, prep_time: 8 },
            { name: 'Chicken Wings', description: '8 pieces with buffalo sauce', price: 11.99, category: 'Appetizers', stock: 30, prep_time: 15 },
            { name: 'Fish Tacos', description: 'Grilled fish with cabbage slaw', price: 13.99, category: 'Mexican', stock: 18, prep_time: 14 },
            { name: 'Pasta Carbonara', description: 'Creamy pasta with bacon and parmesan', price: 15.99, category: 'Italian', stock: 12, prep_time: 20 },
            { name: 'BBQ Ribs', description: 'Slow-cooked ribs with BBQ sauce', price: 19.99, category: 'BBQ', stock: 10, prep_time: 25 },
            { name: 'Veggie Wrap', description: 'Fresh vegetables in a tortilla wrap', price: 8.99, category: 'Healthy', stock: 22, prep_time: 10 },
            { name: 'Chocolate Cake', description: 'Rich chocolate cake with frosting', price: 6.99, category: 'Desserts', stock: 8, prep_time: 5 },
            { name: 'Iced Coffee', description: 'Cold brew coffee with ice', price: 4.99, category: 'Beverages', stock: 50, prep_time: 3 }
        ];

        // Insert products
        for (const product of sampleProducts) {
            await this.pool.query(
                'INSERT INTO products (name, description, price, category, stock, prep_time) VALUES ($1, $2, $3, $4, $5, $6)',
                [product.name, product.description, product.price, product.category, product.stock, product.prep_time]
            );
        }

        // Sample categories
        const categories = ['Burgers', 'Pizza', 'Salads', 'Appetizers', 'Mexican', 'Italian', 'BBQ', 'Healthy', 'Desserts', 'Beverages'];
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