const { Pool } = require('pg');

class CloudDatabase {
    constructor() {
        // Heroku automatically provides DATABASE_URL
        this.pool = new Pool({
            connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/delivery_db',
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        console.log('🗄️  Connecting to PostgreSQL database...');
        this.initTables();
    }

    async initTables() {
        try {
            console.log('📋 Creating database tables...');
            
            // Create products table
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS products (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    price DECIMAL(10,2) NOT NULL,
                    category VARCHAR(100),
                    image VARCHAR(500),
                    stock INTEGER DEFAULT 0,
                    prep_time INTEGER DEFAULT 15,
                    rating DECIMAL(3,2) DEFAULT 0,
                    available BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);

            // Create orders table
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS orders (
                    id SERIAL PRIMARY KEY,
                    customer_name VARCHAR(255) NOT NULL,
                    customer_email VARCHAR(255),
                    customer_phone VARCHAR(20),
                    delivery_address TEXT,
                    items JSONB NOT NULL,
                    total_amount DECIMAL(10,2) NOT NULL,
                    status VARCHAR(50) DEFAULT 'pending',
                    order_notes TEXT,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            `);

            // Create categories table
            await this.pool.query(`
                CREATE TABLE IF NOT EXISTS categories (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) UNIQUE NOT NULL,
                    description TEXT,
                    active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            `);

            console.log('✅ Database tables created successfully');

            // Seed sample data if empty
            const productCount = await this.pool.query('SELECT COUNT(*) FROM products');
            if (parseInt(productCount.rows[0].count) === 0) {
                console.log('🌱 Seeding sample data...');
                await this.seedData();
            }

        } catch (error) {
            console.error('❌ Database initialization error:', error);
        }
    }

    async seedData() {
        try {
            // Seed categories
            const categories = [
                { name: 'Burgers', description: 'Delicious beef and chicken burgers' },
                { name: 'Pizza', description: 'Fresh baked pizzas with various toppings' },
                { name: 'Appetizers', description: 'Tasty starters and sides' },
                { name: 'Salads', description: 'Fresh and healthy salad options' },
                { name: 'Drinks', description: 'Refreshing beverages' },
                { name: 'Desserts', description: 'Sweet treats and desserts' }
            ];

            for (const category of categories) {
                await this.pool.query(
                    'INSERT INTO categories (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
                    [category.name, category.description]
                );
            }

            // Seed sample products
            const sampleProducts = [
                {
                    name: 'Classic Beef Burger',
                    description: 'Juicy beef patty with lettuce, tomato, onion, and our special sauce',
                    price: 12.99,
                    category: 'Burgers',
                    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
                    stock: 50,
                    prep_time: 15,
                    rating: 4.5
                },
                {
                    name: 'Margherita Pizza',
                    description: 'Fresh mozzarella, tomato sauce, and basil on thin crust',
                    price: 16.99,
                    category: 'Pizza',
                    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
                    stock: 30,
                    prep_time: 20,
                    rating: 4.7
                },
                {
                    name: 'Buffalo Wings (8pcs)',
                    description: 'Crispy chicken wings tossed in buffalo sauce with ranch dip',
                    price: 14.99,
                    category: 'Appetizers',
                    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400',
                    stock: 25,
                    prep_time: 12,
                    rating: 4.3
                },
                {
                    name: 'Caesar Salad',
                    description: 'Crispy romaine lettuce with parmesan, croutons, and caesar dressing',
                    price: 9.99,
                    category: 'Salads',
                    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
                    stock: 20,
                    prep_time: 8,
                    rating: 4.1
                },
                {
                    name: 'Pepperoni Pizza',
                    description: 'Classic pepperoni with mozzarella cheese and tomato sauce',
                    price: 18.99,
                    category: 'Pizza',
                    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
                    stock: 35,
                    prep_time: 22,
                    rating: 4.8
                }
            ];

            for (const product of sampleProducts) {
                await this.pool.query(
                    `INSERT INTO products (name, description, price, category, image, stock, prep_time, rating)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [product.name, product.description, product.price, product.category, product.image, product.stock, product.prep_time, product.rating]
                );
            }

            console.log('✅ Sample data seeded successfully');
        } catch (error) {
            console.error('❌ Error seeding data:', error);
        }
    }

    // Product methods
    async getAllProducts() {
        try {
            const result = await this.pool.query('SELECT * FROM products WHERE available = true ORDER BY category, name');
            return result.rows;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    async getProductById(id) {
        try {
            const result = await this.pool.query('SELECT * FROM products WHERE id = $1', [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    }

    async createProduct(product) {
        try {
            const result = await this.pool.query(
                `INSERT INTO products (name, description, price, category, image, stock, prep_time)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [product.name, product.description, product.price, product.category, product.image, product.stock, product.prep_time || 15]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    async updateProduct(id, product) {
        try {
            const result = await this.pool.query(
                `UPDATE products SET 
                 name = $1, description = $2, price = $3, category = $4, 
                 image = $5, stock = $6, prep_time = $7, updated_at = NOW()
                 WHERE id = $8 RETURNING *`,
                [product.name, product.description, product.price, product.category, product.image, product.stock, product.prep_time, id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            await this.pool.query('UPDATE products SET available = false WHERE id = $1', [id]);
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    // Order methods
    async getAllOrders() {
        try {
            const result = await this.pool.query('SELECT * FROM orders ORDER BY created_at DESC');
            return result.rows.map(row => ({
                ...row,
                items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items
            }));
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    async getOrderById(id) {
        try {
            const result = await this.pool.query('SELECT * FROM orders WHERE id = $1', [id]);
            const order = result.rows[0];
            if (order) {
                order.items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
            }
            return order;
        } catch (error) {
            console.error('Error fetching order:', error);
            throw error;
        }
    }

    async createOrder(order) {
        try {
            const result = await this.pool.query(
                `INSERT INTO orders (customer_name, customer_email, customer_phone, delivery_address, items, total_amount, order_notes)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [order.customer_name, order.customer_email, order.customer_phone, order.delivery_address, JSON.stringify(order.items), order.total, order.special_instructions || '']
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    async updateOrderStatus(id, status) {
        try {
            const result = await this.pool.query(
                'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
                [status, id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    // Categories
    async getCategories() {
        try {
            const result = await this.pool.query('SELECT name FROM categories WHERE active = true ORDER BY name');
            return result.rows.map(row => row.name);
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    async close() {
        try {
            await this.pool.end();
            console.log('✅ Database connection closed');
        } catch (error) {
            console.error('Error closing database:', error);
        }
    }
}

module.exports = CloudDatabase;