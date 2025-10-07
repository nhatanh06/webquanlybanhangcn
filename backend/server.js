
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { setupDatabase } = require('./database-setup');

const app = express();
const PORT = 5001;
const DB_PATH = path.join(__dirname, 'akstore.db');

// --- DATABASE CONNECTION ---
// Kết nối hoặc tạo một file database SQLite
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error("Lỗi kết nối SQLite:", err.message);
    } else {
        console.log("Đã kết nối tới cơ sở dữ liệu SQLite.");
    }
});

// Kiểm tra và thiết lập database nếu nó chưa tồn tại
if (!fs.existsSync(DB_PATH) || fs.statSync(DB_PATH).size === 0) {
    console.log("File database không tồn tại hoặc trống. Bắt đầu thiết lập...");
    setupDatabase(db);
}

// Helper functions to promisify sqlite3
const dbGet = (query, params = []) => new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => err ? reject(err) : resolve(row));
});
const dbAll = (query, params = []) => new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows));
});
const dbRun = (query, params = []) => new Promise(function(resolve, reject) {
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

// --- API Routes ---

// GET ALL INITIAL DATA
app.get('/api/initial-data', async (req, res) => {
    try {
        const products = await dbAll('SELECT * FROM products ORDER BY id DESC');
        const categories = await dbAll('SELECT * FROM categories');
        const brands = await dbAll('SELECT * FROM brands');
        const storeSettings = await dbGet('SELECT * FROM store_settings WHERE id = 1');
        const users = await dbAll('SELECT id, name, email, phone, addresses, role FROM users');
        const orders = await dbAll('SELECT * FROM orders ORDER BY orderDate DESC');
        const orderItems = await dbAll('SELECT * FROM order_items');

        // Parse JSON strings back to objects/arrays
        const parseJsonFields = (item, fields) => {
            const newItem = { ...item };
            fields.forEach(field => {
                if (newItem[field]) newItem[field] = JSON.parse(newItem[field]);
            });
            return newItem;
        };
        
        const processedOrders = orders.map(order => {
            const itemsForOrder = orderItems.filter(item => item.order_id === order.id);
            return {
                ...order,
                items: itemsForOrder.map(item => parseJsonFields(item, ['product'])),
            };
        });

        res.json({
            products: products.map(p => parseJsonFields(p, ['images', 'specs', 'options', 'reviews'])),
            categories,
            brands,
            storeSettings: parseJsonFields(storeSettings, ['slides']),
            users: users.map(u => parseJsonFields(u, ['addresses'])),
            orders: processedOrders,
        });

    } catch (err) {
        handleError(res, 500, `Lỗi khi lấy dữ liệu khởi tạo: ${err.message}`);
    }
});

// == AUTH ==
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await dbGet('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
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
        const existingUser = await dbGet('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return handleError(res, 409, 'Email này đã tồn tại.');
        }

        const addresses = address ? JSON.stringify([address]) : JSON.stringify([]);
        const { id: newId } = await dbRun(
            'INSERT INTO users (name, email, phone, password, addresses, role) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, phone, password, addresses, 'customer']
        );
        
        const newUser = await dbGet('SELECT id, name, email, phone, addresses, role FROM users WHERE id = ?', [newId]);
        res.status(201).json(parseJsonFields(newUser, ['addresses']));

    } catch (err) {
        handleError(res, 500, err.message);
    }
});

// == PRODUCTS ==
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
        await dbRun(
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
        await dbRun(
            `UPDATE products SET name = ?, brand = ?, category = ?, price = ?, originalPrice = ?, images = ?, description = ?, shortDescription = ?, specs = ?, options = ?, isFeatured = ?, isBestSeller = ? WHERE id = ?`,
            [
                p.name, p.brand, p.category, p.price, p.originalPrice, JSON.stringify(p.images), p.description, p.shortDescription,
                JSON.stringify(p.specs), JSON.stringify(p.options), p.isFeatured ? 1 : 0, p.isBestSeller ? 1 : 0, id
            ]
        );
        const updatedProduct = await dbGet('SELECT * FROM products WHERE id = ?', [id]);
        res.json(parseJsonFields(updatedProduct, ['images', 'specs', 'options', 'reviews']));
    } catch (err) {
        handleError(res, 500, err.message);
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await dbRun('DELETE FROM products WHERE id = ?', [id]);
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
        const product = await dbGet('SELECT * FROM products WHERE id = ?', [productId]);
        if (product) {
            const reviews = JSON.parse(product.reviews || '[]');
            const newReview = { id: Date.now(), author, rating, comment, date: new Date().toISOString() };
            reviews.unshift(newReview);
            const reviewCount = reviews.length;
            const newRating = parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1));

            await dbRun('UPDATE products SET reviews = ?, rating = ?, reviewCount = ? WHERE id = ?', [JSON.stringify(reviews), newRating, reviewCount, productId]);
            
            const updatedProduct = await dbGet('SELECT * FROM products WHERE id = ?', [productId]);
            res.status(201).json(parseJsonFields(updatedProduct, ['images', 'specs', 'options', 'reviews']));
        } else {
            handleError(res, 404, 'Không tìm thấy sản phẩm');
        }
    } catch (err) {
        handleError(res, 500, err.message);
    }
});

// == CATEGORIES & BRANDS ==
app.post('/api/categories', async (req, res) => {
    try {
        const { name, image } = req.body;
        const id = `${name.toLowerCase().replace(/ /g, '-')}-${Date.now()}`;
        await dbRun('INSERT INTO categories (id, name, image) VALUES (?, ?, ?)', [id, name, image]);
        res.status(201).json({ id, name, image });
    } catch (err) {
        handleError(res, 500, err.message);
    }
});

app.put('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, image } = req.body;
        await dbRun('UPDATE categories SET name = ?, image = ? WHERE id = ?', [name, image, id]);
        res.json({ id, name, image });
    } catch (err) {
        handleError(res, 500, err.message);
    }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const category = await dbGet('SELECT * FROM categories WHERE id = ?', [id]);
        if (!category) return handleError(res, 404, 'Không tìm thấy danh mục');
        
        const inUse = await dbGet('SELECT 1 FROM products WHERE category = ? LIMIT 1', [category.name]);
        if (inUse) {
            return handleError(res, 409, 'Không thể xóa danh mục vì vẫn còn sản phẩm đang sử dụng.');
        }
        await dbRun('DELETE FROM categories WHERE id = ?', [id]);
        res.status(204).send();
    } catch (err) {
        handleError(res, 500, err.message);
    }
});

// Brand routes are similar
app.post('/api/brands', async (req, res) => {
    try {
        const { name, logo } = req.body;
        const id = `${name.toLowerCase().replace(/ /g, '-')}-${Date.now()}`;
        await dbRun('INSERT INTO brands (id, name, logo) VALUES (?, ?, ?)', [id, name, logo]);
        res.status(201).json({ id, name, logo });
    } catch(err) { handleError(res, 500, err.message); }
});

app.put('/api/brands/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, logo } = req.body;
        await dbRun('UPDATE brands SET name = ?, logo = ? WHERE id = ?', [name, logo, id]);
        res.json({ id, name, logo });
    } catch (err) { handleError(res, 500, err.message); }
});

app.delete('/api/brands/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const brand = await dbGet('SELECT * FROM brands WHERE id = ?', [id]);
        if (!brand) return handleError(res, 404, 'Không tìm thấy thương hiệu');

        const inUse = await dbGet('SELECT 1 FROM products WHERE brand = ? LIMIT 1', [brand.name]);
        if (inUse) {
            return handleError(res, 409, 'Không thể xóa thương hiệu vì vẫn còn sản phẩm đang sử dụng.');
        }
        await dbRun('DELETE FROM brands WHERE id = ?', [id]);
        res.status(204).send();
    } catch (err) { handleError(res, 500, err.message); }
});

// == ORDERS ==
app.post('/api/orders', async (req, res) => {
    try {
        const { name, phone, address, paymentMethod, items, total, userId } = req.body;
        const orderId = `ORDER-${Date.now()}`;
        
        db.serialize(async () => {
            db.run('BEGIN TRANSACTION');
            try {
                await dbRun(
                    `INSERT INTO orders (id, customerName, phone, address, total, status, orderDate, paymentMethod, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [orderId, name, phone, address, total, 'Chờ xác nhận', new Date().toISOString(), paymentMethod, userId]
                );
                for (const item of items) {
                    await dbRun(
                        `INSERT INTO order_items (order_id, product_id, quantity, price, product) VALUES (?, ?, ?, ?, ?)`,
                        [orderId, item.product.id, item.quantity, item.product.price, JSON.stringify(item)]
                    );
                }
                await dbRun('COMMIT');
                
                const newOrder = await dbGet('SELECT * FROM orders WHERE id = ?', [orderId]);
                const newOrderItems = await dbAll('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
                
                res.status(201).json({
                    ...newOrder,
                    items: newOrderItems.map(item => parseJsonFields(item, ['product']))
                });

            } catch(e) {
                await dbRun('ROLLBACK');
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
        const result = await dbRun('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        if (result.changes > 0) {
            res.status(204).send();
        } else {
            handleError(res, 404, 'Không tìm thấy đơn hàng');
        }
    } catch (err) {
        handleError(res, 500, err.message);
    }
});

// == STORE SETTINGS ==
app.put('/api/settings', async (req, res) => {
    try {
        const { logo, slides } = req.body;
        await dbRun(
            `UPDATE store_settings SET logo = ?, slides = ? WHERE id = 1`,
            [logo, JSON.stringify(slides)]
        );
        const updatedSettings = await dbGet('SELECT * FROM store_settings WHERE id = 1');
        res.json(parseJsonFields(updatedSettings, ['slides']));
    } catch(err) {
        handleError(res, 500, err.message);
    }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server đang chạy trên http://localhost:${PORT}`);
  console.log(`Chế độ: Cơ sở dữ liệu SQLite. Dữ liệu được lưu trữ vĩnh viễn trong file 'akstore.db'.`);
});
