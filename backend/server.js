const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { setupAppDatabase } = require('./database-setup');
const { setupSystemDatabase } = require('./system-database-setup');

const app = express();
const PORT = 5001;
const APP_DB_PATH = path.join(__dirname, 'banhangcongnghe.db');
const SYSTEM_DB_PATH = path.join(__dirname, 'system.db');

// --- DATABASE CONNECTIONS ---
// Kết nối database cho dữ liệu ứng dụng (sản phẩm, đơn hàng, etc.)
const appDb = new sqlite3.Database(APP_DB_PATH, (err) => {
    if (err) console.error("Lỗi kết nối App DB:", err.message);
    else console.log("Đã kết nối tới CSDL ứng dụng (banhangcongnghe.db).");
});

// Kết nối database cho dữ liệu hệ thống (người dùng, cài đặt)
const systemDb = new sqlite3.Database(SYSTEM_DB_PATH, (err) => {
    if (err) console.error("Lỗi kết nối System DB:", err.message);
    else console.log("Đã kết nối tới CSDL hệ thống (system.db).");
});

// Kiểm tra và thiết lập các database nếu chúng chưa tồn tại
if (!fs.existsSync(APP_DB_PATH) || fs.statSync(APP_DB_PATH).size === 0) {
    console.log("File CSDL ứng dụng không tồn tại hoặc trống. Bắt đầu thiết lập...");
    setupAppDatabase(appDb);
}
if (!fs.existsSync(SYSTEM_DB_PATH) || fs.statSync(SYSTEM_DB_PATH).size === 0) {
    console.log("File CSDL hệ thống không tồn tại hoặc trống. Bắt đầu thiết lập...");
    setupSystemDatabase(systemDb);
}

// Helper functions to promisify sqlite3 - now accepts a db instance
const dbGet = (db, query, params = []) => new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => err ? reject(err) : resolve(row));
});
const dbAll = (db, query, params = []) => new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows));
});
const dbRun = (db, query, params = []) => new Promise(function(resolve, reject) {
    db.run(query, params, function(err) {
        err ? reject(err) : resolve({ id: this.lastID, changes: this.changes });
    });
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Helper function to handle errors
const handleError = (res, statusCode, message) => {
    console.error(`Lỗi API (${statusCode}):`, message);
    res.status(statusCode).json({ message });
};

// Helper function to parse JSON fields from DB
const parseJsonFields = (item, fields) => {
    if (!item) return item;
    const newItem = { ...item };
    fields.forEach(field => {
        if (newItem[field] && typeof newItem[field] === 'string') {
            try {
                newItem[field] = JSON.parse(newItem[field]);
            } catch (e) {
                console.error(`Lỗi parse JSON cho trường ${field} với giá trị "${newItem[field]}":`, e.message);
                // Giữ lại chuỗi gốc nếu parse lỗi, để tránh crash app
            }
        }
    });
    return newItem;
};


// --- API Routes ---

// GET ALL INITIAL DATA - Now queries both databases
app.get('/api/initial-data', async (req, res) => {
    try {
        const [appData, systemData] = await Promise.all([
            // Query App DB
            (async () => {
                const products = await dbAll(appDb, 'SELECT * FROM products ORDER BY id DESC');
                const categories = await dbAll(appDb, 'SELECT * FROM categories');
                const brands = await dbAll(appDb, 'SELECT * FROM brands');
                const orders = await dbAll(appDb, 'SELECT * FROM orders ORDER BY orderDate DESC');
                const orderItems = await dbAll(appDb, 'SELECT * FROM order_items');
                return { products, categories, brands, orders, orderItems };
            })(),
            // Query System DB
            (async () => {
                const storeSettings = await dbGet(systemDb, 'SELECT * FROM store_settings WHERE id = 1');
                const users = await dbAll(systemDb, 'SELECT id, name, email, phone, addresses, role FROM users');
                return { storeSettings, users };
            })()
        ]);
        
        const processedOrders = appData.orders.map(order => {
            const itemsForOrder = appData.orderItems.filter(item => item.order_id === order.id);
            const parsedItems = itemsForOrder.map(item => parseJsonFields(item, ['product']));
            
            let productSummary = 'Không có sản phẩm';
            if (parsedItems.length > 0) {
                const firstProduct = parsedItems[0].product?.product;
                if (firstProduct && firstProduct.name) {
                    productSummary = firstProduct.name;
                    if (parsedItems.length > 1) {
                        productSummary += ` và ${parsedItems.length - 1} sản phẩm khác`;
                    }
                }
            }
            
            return {
                ...order,
                items: parsedItems,
                productSummary: productSummary,
            };
        });

        res.json({
            products: appData.products.map(p => parseJsonFields(p, ['images', 'specs', 'options', 'reviews'])),
            categories: appData.categories,
            brands: appData.brands,
            storeSettings: parseJsonFields(systemData.storeSettings, ['slides']),
            users: systemData.users.map(u => parseJsonFields(u, ['addresses'])),
            orders: processedOrders,
        });

    } catch (err) {
        handleError(res, 500, `Lỗi khi lấy dữ liệu khởi tạo: ${err.message}`);
    }
});

// == AUTH (System DB) ==
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await dbGet(systemDb, 'SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            res.json(parseJsonFields(userWithoutPassword, ['addresses']));
        } else {
            handleError(res, 401, 'Email hoặc mật khẩu không đúng');
        }
    } catch (err) {
        handleError(res, 500, err.message);
    }
});

app.post('/api/register', async (req, res) => {
    const { name, email, phone, password, address } = req.body;
    try {
        const existingUser = await dbGet(systemDb, 'SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return handleError(res, 409, 'Email này đã tồn tại.');
        }

        const addresses = address ? JSON.stringify([address]) : JSON.stringify([]);
        const newUserId = `user-${Date.now()}`;
        await dbRun(systemDb,
            'INSERT INTO users (id, name, email, phone, password, addresses, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [newUserId, name, email, phone, password, addresses, 'customer']
        );
        
        const newUser = await dbGet(systemDb, 'SELECT id, name, email, phone, addresses, role FROM users WHERE id = ?', [newUserId]);
        res.status(201).json(parseJsonFields(newUser, ['addresses']));

    } catch (err) {
        handleError(res, 500, err.message);
    }
});

// NEW: Get user profile by ID
app.get('/api/users/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await dbGet(systemDb, 'SELECT id, name, email, phone, addresses, role FROM users WHERE id = ?', [userId]);
        if (user) {
            res.json(parseJsonFields(user, ['addresses']));
        } else {
            handleError(res, 404, 'Không tìm thấy người dùng.');
        }
    } catch (err) {
        handleError(res, 500, err.message);
    }
});

// == PRODUCTS (App DB) ==
// NEW: Get single product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await dbGet(appDb, 'SELECT * FROM products WHERE id = ?', [id]);
        if (product) {
            res.json(parseJsonFields(product, ['images', 'specs', 'options', 'reviews']));
        } else {
            handleError(res, 404, 'Không tìm thấy sản phẩm');
        }
    } catch (err) {
        handleError(res, 500, err.message);
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const p = req.body;
        const newProduct = {
            id: `${p.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}-${Date.now()}`,
            ...p,
            rating: 0,
            reviewCount: 0,
            reviews: []
        };
        await dbRun(appDb,
            `INSERT INTO products (id, name, brand, category, price, originalPrice, images, description, shortDescription, specs, options, rating, reviewCount, reviews, isFeatured, isBestSeller)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                newProduct.id, newProduct.name, newProduct.brand, newProduct.category, newProduct.price, newProduct.originalPrice,
                JSON.stringify(newProduct.images), newProduct.description, newProduct.shortDescription, JSON.stringify(newProduct.specs),
                JSON.stringify(newProduct.options), newProduct.rating, newProduct.reviewCount, JSON.stringify(newProduct.reviews),
                newProduct.isFeatured ? 1 : 0, newProduct.isBestSeller ? 1 : 0
            ]
        );
        res.status(201).json(newProduct);
    } catch (err) {
        handleError(res, 500, err.message);
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const p = req.body;
        await dbRun(appDb,
            `UPDATE products SET name = ?, brand = ?, category = ?, price = ?, originalPrice = ?, images = ?, description = ?, shortDescription = ?, specs = ?, options = ?, isFeatured = ?, isBestSeller = ? WHERE id = ?`,
            [
                p.name, p.brand, p.category, p.price, p.originalPrice, JSON.stringify(p.images), p.description, p.shortDescription,
                JSON.stringify(p.specs), JSON.stringify(p.options), p.isFeatured ? 1 : 0, p.isBestSeller ? 1 : 0, id
            ]
        );
        const updatedProduct = await dbGet(appDb, 'SELECT * FROM products WHERE id = ?', [id]);
        res.json(parseJsonFields(updatedProduct, ['images', 'specs', 'options', 'reviews']));
    } catch (err) {
        handleError(res, 500, err.message);
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Logic kiểm tra sản phẩm trong đơn hàng đã được xóa bỏ theo yêu cầu.
        // Thông tin sản phẩm trong các đơn hàng cũ được giữ lại (denormalized) 
        // trong bảng order_items, nên việc xóa sản phẩm không ảnh hưởng đến lịch sử.
        
        const result = await dbRun(appDb, 'DELETE FROM products WHERE id = ?', [id]);
        if (result.changes > 0) {
            res.status(204).send();
        } else {
            handleError(res, 404, 'Không tìm thấy sản phẩm');
        }
    } catch (err) {
        handleError(res, 500, err.message);
    }
});


app.post('/api/products/:id/reviews', async (req, res) => {
    const { id: productId } = req.params;
    const { author, rating, comment } = req.body;
    try {
        const product = await dbGet(appDb, 'SELECT * FROM products WHERE id = ?', [productId]);
        if (product) {
            const reviews = JSON.parse(product.reviews || '[]');
            const newReview = { id: Date.now(), author, rating, comment, date: new Date().toISOString() };
            reviews.unshift(newReview);
            const reviewCount = reviews.length;
            const newRating = parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1));

            await dbRun(appDb, 'UPDATE products SET reviews = ?, rating = ?, reviewCount = ? WHERE id = ?', [JSON.stringify(reviews), newRating, reviewCount, productId]);
            
            const updatedProduct = await dbGet(appDb, 'SELECT * FROM products WHERE id = ?', [productId]);
            res.status(201).json(parseJsonFields(updatedProduct, ['images', 'specs', 'options', 'reviews']));
        } else {
            handleError(res, 404, 'Không tìm thấy sản phẩm');
        }
    } catch (err) {
        handleError(res, 500, err.message);
    }
});

// == CATEGORIES & BRANDS (App DB) ==
app.post('/api/categories', async (req, res) => {
    try {
        const { name, image } = req.body;
        const id = `${name.toLowerCase().replace(/ /g, '-')}-${Date.now()}`;
        await dbRun(appDb, 'INSERT INTO categories (id, name, image) VALUES (?, ?, ?)', [id, name, image]);
        res.status(201).json({ id, name, image });
    } catch (err) {
        handleError(res, 500, err.message);
    }
});

app.put('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image } = req.body;
        await dbRun(appDb, 'UPDATE categories SET name = ?, image = ? WHERE id = ?', [name, image, id]);
        res.json({ id, name, image });
    } catch (err) {
        handleError(res, 500, err.message);
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const category = await dbGet(appDb, 'SELECT * FROM categories WHERE id = ?', [id]);
        if (!category) return handleError(res, 404, 'Không tìm thấy danh mục');
        
        const inUse = await dbGet(appDb, 'SELECT 1 FROM products WHERE category = ? LIMIT 1', [category.name]);
        if (inUse) {
            return handleError(res, 409, 'Không thể xóa danh mục vì vẫn còn sản phẩm đang sử dụng.');
        }
        await dbRun(appDb, 'DELETE FROM categories WHERE id = ?', [id]);
        res.status(204).send();
    } catch (err) {
        handleError(res, 500, err.message);
    }
});

app.post('/api/brands', async (req, res) => {
    try {
        const { name, logo } = req.body;
        const id = `${name.toLowerCase().replace(/ /g, '-')}-${Date.now()}`;
        await dbRun(appDb, 'INSERT INTO brands (id, name, logo) VALUES (?, ?, ?)', [id, name, logo]);
        res.status(201).json({ id, name, logo });
    } catch(err) { handleError(res, 500, err.message); }
});

app.put('/api/brands/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, logo } = req.body;
        await dbRun(appDb, 'UPDATE brands SET name = ?, logo = ? WHERE id = ?', [name, logo, id]);
        res.json({ id, name, logo });
    } catch (err) { handleError(res, 500, err.message); }
});

app.delete('/api/brands/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const brand = await dbGet(appDb, 'SELECT * FROM brands WHERE id = ?', [id]);
        if (!brand) return handleError(res, 404, 'Không tìm thấy thương hiệu');

        const inUse = await dbGet(appDb, 'SELECT 1 FROM products WHERE brand = ? LIMIT 1', [brand.name]);
        if (inUse) {
            return handleError(res, 409, 'Không thể xóa thương hiệu vì vẫn còn sản phẩm đang sử dụng.');
        }
        await dbRun(appDb, 'DELETE FROM brands WHERE id = ?', [id]);
        res.status(204).send();
    } catch (err) { handleError(res, 500, err.message); }
});

// == ORDERS (App DB) ==
// NEW: Get order history for a specific user
app.get('/api/users/:userId/orders', async (req, res) => {
    const { userId } = req.params;
    try {
        const userOrders = await dbAll(appDb, 'SELECT * FROM orders WHERE userId = ? ORDER BY orderDate DESC', [userId]);

        if (userOrders.length === 0) {
            return res.json([]);
        }

        const orderIds = userOrders.map(o => o.id);
        const placeholders = orderIds.map(() => '?').join(',');
        const allOrderItems = await dbAll(appDb, `SELECT * FROM order_items WHERE order_id IN (${placeholders})`, orderIds);
        
        const processedOrders = userOrders.map(order => {
            const itemsForOrder = allOrderItems.filter(item => item.order_id === order.id);
            const parsedItems = itemsForOrder.map(item => parseJsonFields(item, ['product']));
            
            let productSummary = 'Không có sản phẩm';
            if (parsedItems.length > 0 && parsedItems[0].product && parsedItems[0].product.product) {
                 productSummary = parsedItems[0].product.product.name;
                if (parsedItems.length > 1) {
                    productSummary += ` và ${parsedItems.length - 1} sản phẩm khác`;
                }
            }
            
            return {
                ...order,
                items: parsedItems,
                productSummary: productSummary,
            };
        });

        res.json(processedOrders);
    } catch (err) {
        handleError(res, 500, err.message);
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const { name, phone, address, paymentMethod, items, total, userId } = req.body;
        const orderId = `ORDER-${Date.now()}`;
        
        appDb.serialize(async () => {
            appDb.run('BEGIN TRANSACTION');
            try {
                await dbRun(appDb,
                    `INSERT INTO orders (id, customerName, phone, address, total, status, orderDate, paymentMethod, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [orderId, name, phone, address, total, 'Chờ xác nhận', new Date().toISOString(), paymentMethod, userId]
                );
                for (const item of items) {
                    await dbRun(appDb,
                        `INSERT INTO order_items (order_id, product_id, quantity, price, product) VALUES (?, ?, ?, ?, ?)`,
                        [orderId, item.product.id, item.quantity, item.product.price, JSON.stringify(item)]
                    );
                }
                await dbRun(appDb, 'COMMIT');
                
                const newOrder = await dbGet(appDb, 'SELECT * FROM orders WHERE id = ?', [orderId]);
                const newOrderItems = await dbAll(appDb, 'SELECT * FROM order_items WHERE order_id = ?', [orderId]);
                
                res.status(201).json({
                    ...newOrder,
                    items: newOrderItems.map(item => parseJsonFields(item, ['product']))
                });

            } catch(e) {
                await dbRun(appDb, 'ROLLBACK');
                throw e;
            }
        });
    } catch (err) {
        handleError(res, 500, err.message);
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await dbRun(appDb, 'UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        if (result.changes > 0) {
            res.status(204).send();
        } else {
            handleError(res, 404, 'Không tìm thấy đơn hàng');
        }
    } catch (err) {
        handleError(res, 500, err.message);
    }
});

// == STORE SETTINGS (System DB) ==
app.put('/api/settings', async (req, res) => {
    try {
        const { logo, slides } = req.body;
        await dbRun(systemDb,
            `UPDATE store_settings SET logo = ?, slides = ? WHERE id = 1`,
            [logo, JSON.stringify(slides)]
        );
        const updatedSettings = await dbGet(systemDb, 'SELECT * FROM store_settings WHERE id = 1');
        res.json(parseJsonFields(updatedSettings, ['slides']));
    } catch(err) {
        handleError(res, 500, err.message);
    }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server đang chạy trên http://localhost:${PORT}`);
  console.log(`Chế độ: Hai cơ sở dữ liệu SQLite đang hoạt động.`);
  console.log(`- Dữ liệu ứng dụng (sản phẩm, đơn hàng) được lưu tại: 'banhangcongnghe.db'`);
  console.log(`- Dữ liệu hệ thống (người dùng, cài đặt) được lưu tại: 'system.db'`);
});