const fs = require('fs');
const path = require('path');

class Database {
    constructor() {
        this.productsFile = path.join(__dirname, 'data', 'products.json');
        this.ordersFile = path.join(__dirname, 'data', 'orders.json');
        this.initDatabase();
    }

    initDatabase() {
        // Create data directory if it doesn't exist
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        console.log('✅ Connected to JSON file database');
        this.createTables();
    }

    createTables() {
        // Initialize products file
        if (!fs.existsSync(this.productsFile)) {
            fs.writeFileSync(this.productsFile, JSON.stringify([], null, 2));
            console.log('✅ Products file created');
            this.seedProducts();
        } else {
            console.log('✅ Products file ready');
        }
        
        // Initialize orders file
        if (!fs.existsSync(this.ordersFile)) {
            fs.writeFileSync(this.ordersFile, JSON.stringify([], null, 2));
            console.log('✅ Orders file created');
            this.seedOrders();
        } else {
            console.log('✅ Orders file ready');
        }
    }

    seedProducts() {
        try {
            const products = JSON.parse(fs.readFileSync(this.productsFile, 'utf8'));
            
            if (products.length === 0) {
                console.log('🌱 Seeding products...');
                
                const sampleProducts = [
                    {
                        name: 'Classic Beef Burger',
                        description: 'Juicy beef patty with lettuce, tomato, onion, and our special sauce',
                        price: 12.99,
                        category: 'Burgers',
                        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300',
                        stock: 50,
                        prep_time: 15,
                        rating: 4.5
                    },
                    {
                        name: 'Margherita Pizza',
                        description: 'Fresh mozzarella, tomato sauce, and basil on thin crust',
                        price: 16.99,
                        category: 'Pizza',
                        image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=300',
                        stock: 30,
                        prep_time: 20,
                        rating: 4.7
                    },
                    {
                        name: 'Caesar Salad',
                        description: 'Crispy romaine lettuce with parmesan, croutons, and caesar dressing',
                        price: 9.99,
                        category: 'Salads',
                        image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300',
                        stock: 25,
                        prep_time: 10,
                        rating: 4.2
                    },
                    {
                        name: 'Chicken Wings (8pcs)',
                        description: 'Crispy chicken wings with your choice of buffalo or BBQ sauce',
                        price: 13.99,
                        category: 'Appetizers',
                        image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=300',
                        stock: 40,
                        prep_time: 18,
                        rating: 4.6
                    },
                    {
                        name: 'Pepperoni Pizza',
                        description: 'Classic pepperoni with mozzarella cheese and tomato sauce',
                        price: 18.99,
                        category: 'Pizza',
                        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300',
                        stock: 35,
                        prep_time: 22,
                        rating: 4.8
                    },
                    {
                        name: 'Fish Tacos (3pcs)',
                        description: 'Grilled fish with cabbage slaw and chipotle mayo in corn tortillas',
                        price: 14.99,
                        category: 'Mexican',
                        image: 'https://images.unsplash.com/photo-1565299585323-38174c26d82b?w=300',
                        stock: 20,
                        prep_time: 16,
                        rating: 4.4
                    },
                    {
                        name: 'Chocolate Brownie',
                        description: 'Warm chocolate brownie served with vanilla ice cream',
                        price: 7.99,
                        category: 'Desserts',
                        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300',
                        stock: 15,
                        prep_time: 5,
                        rating: 4.3
                    },
                    {
                        name: 'Grilled Chicken Salad',
                        description: 'Mixed greens with grilled chicken, cherry tomatoes, and balsamic dressing',
                        price: 11.99,
                        category: 'Salads',
                        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300',
                        stock: 28,
                        prep_time: 12,
                        rating: 4.1
                    },
                    {
                        name: 'BBQ Ribs',
                        description: 'Tender pork ribs with our house BBQ sauce and coleslaw',
                        price: 19.99,
                        category: 'BBQ',
                        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300',
                        stock: 12,
                        prep_time: 25,
                        rating: 4.9
                    },
                    {
                        name: 'Vegetable Stir Fry',
                        description: 'Fresh mixed vegetables stir-fried with teriyaki sauce over rice',
                        price: 10.99,
                        category: 'Asian',
                        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300',
                        stock: 22,
                        prep_time: 14,
                        rating: 4.0
                    }
                ];

                const productsWithIds = sampleProducts.map((product, index) => ({
                    id: index + 1,
                    ...product,
                    available: 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }));

                fs.writeFileSync(this.productsFile, JSON.stringify(productsWithIds, null, 2));
                console.log('✅ Sample products added to database');
            }
        } catch (err) {
            console.error('Error seeding products:', err.message);
        }
    }

    seedOrders() {
        try {
            const orders = JSON.parse(fs.readFileSync(this.ordersFile, 'utf8'));
            
            if (orders.length === 0) {
                console.log('🌱 Seeding orders...');
                
                const sampleOrders = [
                    {
                        customer_name: 'John Smith',
                        customer_phone: '+1-555-0123',
                        customer_email: 'john@example.com',
                        delivery_address: '123 Main St, Apt 4B, New York, NY 10001',
                        items: JSON.stringify([
                            { id: 1, name: 'Classic Beef Burger', price: 12.99, quantity: 2 },
                            { id: 4, name: 'Chicken Wings (8pcs)', price: 13.99, quantity: 1 }
                        ]),
                        total: 39.97,
                        status: 'preparing',
                        payment_status: 'paid',
                        delivery_time: 25,
                        special_instructions: 'No onions on the burger please'
                    },
                    {
                        customer_name: 'Sarah Johnson',
                        customer_phone: '+1-555-0456',
                        customer_email: 'sarah@example.com',
                        delivery_address: '456 Oak Avenue, Brooklyn, NY 11201',
                        items: JSON.stringify([
                            { id: 2, name: 'Margherita Pizza', price: 16.99, quantity: 1 },
                            { id: 7, name: 'Chocolate Brownie', price: 7.99, quantity: 2 }
                        ]),
                        total: 32.97,
                        status: 'delivered',
                        payment_status: 'paid',
                        delivery_time: 30,
                        special_instructions: 'Leave at door'
                    }
                ];

                const ordersWithIds = sampleOrders.map((order, index) => ({
                    id: index + 1,
                    ...order,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }));

                fs.writeFileSync(this.ordersFile, JSON.stringify(ordersWithIds, null, 2));
                console.log('✅ Sample orders added to database');
            }
        } catch (err) {
            console.error('Error seeding orders:', err.message);
        }
    }

    // Product methods
    getAllProducts(callback) {
        try {
            const products = JSON.parse(fs.readFileSync(this.productsFile, 'utf8'));
            const availableProducts = products.filter(p => p.available === 1);
            availableProducts.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
            callback(null, availableProducts);
        } catch (err) {
            callback(err, null);
        }
    }

    getProductById(id, callback) {
        try {
            const products = JSON.parse(fs.readFileSync(this.productsFile, 'utf8'));
            const product = products.find(p => p.id == id);
            callback(null, product);
        } catch (err) {
            callback(err, null);
        }
    }

    createProduct(product, callback) {
        try {
            const products = JSON.parse(fs.readFileSync(this.productsFile, 'utf8'));
            const newId = Math.max(...products.map(p => p.id), 0) + 1;
            
            const newProduct = {
                id: newId,
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                image: product.image || '',
                stock: product.stock || 0,
                available: 1,
                prep_time: product.prep_time || 15,
                rating: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            products.push(newProduct);
            fs.writeFileSync(this.productsFile, JSON.stringify(products, null, 2));
            callback(null, { id: newId });
        } catch (err) {
            callback(err, null);
        }
    }

    updateProduct(id, product, callback) {
        try {
            const products = JSON.parse(fs.readFileSync(this.productsFile, 'utf8'));
            const productIndex = products.findIndex(p => p.id == id);
            
            if (productIndex === -1) {
                return callback(new Error('Product not found'));
            }
            
            products[productIndex] = {
                ...products[productIndex],
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                image: product.image,
                stock: product.stock,
                prep_time: product.prep_time,
                updated_at: new Date().toISOString()
            };
            
            fs.writeFileSync(this.productsFile, JSON.stringify(products, null, 2));
            callback(null);
        } catch (err) {
            callback(err);
        }
    }

    deleteProduct(id, callback) {
        try {
            const products = JSON.parse(fs.readFileSync(this.productsFile, 'utf8'));
            const productIndex = products.findIndex(p => p.id == id);
            
            if (productIndex === -1) {
                return callback(new Error('Product not found'));
            }
            
            products[productIndex].available = 0;
            fs.writeFileSync(this.productsFile, JSON.stringify(products, null, 2));
            callback(null);
        } catch (err) {
            callback(err);
        }
    }

    // Order methods
    getAllOrders(callback) {
        try {
            const orders = JSON.parse(fs.readFileSync(this.ordersFile, 'utf8'));
            orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            callback(null, orders);
        } catch (err) {
            callback(err, null);
        }
    }

    getOrderById(id, callback) {
        try {
            const orders = JSON.parse(fs.readFileSync(this.ordersFile, 'utf8'));
            const order = orders.find(o => o.id == id);
            callback(null, order);
        } catch (err) {
            callback(err, null);
        }
    }

    createOrder(order, callback) {
        try {
            const orders = JSON.parse(fs.readFileSync(this.ordersFile, 'utf8'));
            const newId = Math.max(...orders.map(o => o.id), 0) + 1;
            
            const newOrder = {
                id: newId,
                customer_name: order.customer_name,
                customer_phone: order.customer_phone,
                customer_email: order.customer_email,
                delivery_address: order.delivery_address,
                items: order.items,
                total: order.total,
                status: order.status || 'pending',
                payment_status: order.payment_status || 'pending',
                delivery_time: order.delivery_time || 30,
                special_instructions: order.special_instructions || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            orders.push(newOrder);
            fs.writeFileSync(this.ordersFile, JSON.stringify(orders, null, 2));
            callback(null, { id: newId });
        } catch (err) {
            callback(err, null);
        }
    }

    updateOrderStatus(id, status, callback) {
        try {
            const orders = JSON.parse(fs.readFileSync(this.ordersFile, 'utf8'));
            const orderIndex = orders.findIndex(o => o.id == id);
            
            if (orderIndex === -1) {
                return callback(new Error('Order not found'));
            }
            
            orders[orderIndex].status = status;
            orders[orderIndex].updated_at = new Date().toISOString();
            
            fs.writeFileSync(this.ordersFile, JSON.stringify(orders, null, 2));
            callback(null);
        } catch (err) {
            callback(err);
        }
    }

    close() {
        // No need to close file-based database
        console.log('✅ Database connection closed');
    }
}

module.exports = Database;