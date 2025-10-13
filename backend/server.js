const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const appData = require('./app-data');
const systemData = require('./system-data');

const app = express();
const PORT = 5001;

// --- CẤU HÌNH KẾT NỐI MYSQL ---
const dbConfig = {
    host: '103.130.217.240',
    user: 'akstorei_firebasekiet',
    password: '2006@lhu',
    database: 'akstorei_demo',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4' // Đảm bảo sử dụng UTF-8 để hỗ trợ tiếng Việt
};

const pool = mysql.createPool(dbConfig);

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
                newItem[field] = null;
            }
        }
    });
    return newItem;
};

// --- TỰ ĐỘNG THIẾT LẬP DATABASE ---
const initializeDatabase = async () => {
    console.log('Đang kiểm tra và thiết lập cơ sở dữ liệu MySQL...');
    const connection = await pool.getConnection();
    try {
        // Ép buộc bộ mã ký tự cho session kết nối này để đảm bảo tính nhất quán
        await connection.query("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");

        await connection.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                image TEXT
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS brands (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL UNIQUE,
                logo TEXT,
                category_ids JSON
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS products (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                brand VARCHAR(255),
                category VARCHAR(255),
                price DECIMAL(12, 2) NOT NULL,
                originalPrice DECIMAL(12, 2),
                images JSON,
                description TEXT,
                shortDescription TEXT,
                specs JSON,
                options JSON,
                rating DOUBLE NOT NULL DEFAULT 0,
                reviewCount INT NOT NULL DEFAULT 0,
                reviews JSON,
                isFeatured BOOLEAN NOT NULL DEFAULT FALSE,
                isBestSeller BOOLEAN NOT NULL DEFAULT FALSE
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                phone VARCHAR(50) NOT NULL,
                password VARCHAR(255) NOT NULL,
                addresses JSON,
                role ENUM('admin', 'customer') NOT NULL
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id VARCHAR(255) PRIMARY KEY,
                user_id VARCHAR(255),
                customerName VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                address TEXT NOT NULL,
                total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
                status ENUM('Chờ xác nhận', 'Đang xử lý', 'Đang giao hàng', 'Hoàn thành', 'Đã hủy') NOT NULL,
                orderDate DATETIME NOT NULL,
                paymentMethod ENUM('COD', 'Bank Transfer', 'Momo') NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id VARCHAR(255) NOT NULL,
                product_id VARCHAR(255) NOT NULL,
                quantity INT NOT NULL,
                price DECIMAL(12, 2) NOT NULL,
                product JSON NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS store_settings (
                id INT PRIMARY KEY,
                logo TEXT,
                slides JSON
            ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);

        console.log('Tất cả các bảng đã được kiểm tra/tạo thành công.');

        const [productRows] = await connection.query('SELECT COUNT(*) as count FROM products');
        if (productRows[0].count === 0) {
            console.log('CSDL trống, đang chèn dữ liệu mẫu...');
            for (const cat of appData.INITIAL_CATEGORIES) await connection.query('INSERT IGNORE INTO categories SET ?', cat);
            for (const brand of appData.INITIAL_BRANDS) await connection.query('INSERT IGNORE INTO brands (id, name, logo, category_ids) VALUES (?, ?, ?, ?)', [brand.id, brand.name, brand.logo, JSON.stringify(brand.category_ids)]);
            for (const p of appData.INITIAL_PRODUCTS) {
                 await connection.query(`INSERT INTO products (id, name, brand, category, price, originalPrice, images, description, shortDescription, specs, options, rating, reviewCount, reviews, isFeatured, isBestSeller) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [p.id, p.name, p.brand, p.category, p.price, p.originalPrice, JSON.stringify(p.images), p.description, p.shortDescription, JSON.stringify(p.specs), JSON.stringify(p.options), p.rating, p.reviewCount, JSON.stringify(p.reviews), p.isFeatured, p.isBestSeller]);
            }
            for (const user of systemData.INITIAL_USERS) await connection.query('INSERT IGNORE INTO users (id, name, email, phone, password, addresses, role) VALUES (?, ?, ?, ?, ?, ?, ?)', [user.id, user.name, user.email, user.phone, user.password, JSON.stringify(user.addresses), user.role]);
            await connection.query('INSERT IGNORE INTO store_settings (id, logo, slides) VALUES (?, ?, ?)', [1, systemData.INITIAL_STORE_SETTINGS.logo, JSON.stringify(systemData.INITIAL_STORE_SETTINGS.slides)]);
            console.log('Quá trình chèn dữ liệu mẫu đã hoàn tất.');
        } else {
             console.log('CSDL đã có dữ liệu, bỏ qua bước chèn dữ liệu mẫu.');
        }
    } finally {
        connection.release();
    }
};

// --- API Routes ---

app.get('/api/initial-data', async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products ORDER BY id DESC');
        const [categories] = await pool.query('SELECT * FROM categories');
        const [brands] = await pool.query('SELECT * FROM brands');
        const [orders] = await pool.query('SELECT * FROM orders ORDER BY orderDate DESC');
        const [orderItems] = await pool.query('SELECT * FROM order_items');
        const [storeSettingsRows] = await pool.query('SELECT * FROM store_settings WHERE id = 1');
        const storeSettings = storeSettingsRows[0] || { id: 1, logo: '', slides: '[]' };
        const [users] = await pool.query('SELECT id, name, email, phone, addresses, role FROM users');

        const processedOrders = orders.map(order => {
            const itemsForOrder = orderItems.filter(item => item.order_id === order.id);
            const parsedItems = itemsForOrder.map(item => parseJsonFields(item, ['product']));
            let productSummary = 'Không có sản phẩm';
            if (parsedItems.length > 0 && parsedItems[0].product && parsedItems[0].product.product) {
                productSummary = parsedItems[0].product.product.name;
                if (parsedItems.length > 1) {
                    productSummary += ` và ${parsedItems.length - 1} sản phẩm khác`;
                }
            }
            return { ...order, items: parsedItems, productSummary };
        });

        res.json({
            products: products.map(p => parseJsonFields(p, ['images', 'specs', 'options', 'reviews'])),
            categories,
            brands: brands.map(b => parseJsonFields(b, ['category_ids'])),
            storeSettings: parseJsonFields(storeSettings, ['slides']),
            users: users.map(u => parseJsonFields(u, ['addresses'])),
            orders: processedOrders,
        });
    } catch (err) {
        handleError(res, 500, `Lỗi khi lấy dữ liệu khởi tạo: ${err.message}`);
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (rows[0]) {
            const { password, ...userWithoutPassword } = rows[0];
            res.json(parseJsonFields(userWithoutPassword, ['addresses']));
        } else {
            handleError(res, 401, 'Email hoặc mật khẩu không đúng');
        }
    } catch (err) { handleError(res, 500, err.message); }
});

app.post('/api/register', async (req, res) => {
    const { name, email, phone, password, address } = req.body;
    try {
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return handleError(res, 409, 'Email này đã tồn tại.');

        const newUserId = `user-${Date.now()}`;
        await pool.query('INSERT INTO users (id, name, email, phone, password, addresses, role) VALUES (?, ?, ?, ?, ?, ?, ?)', [newUserId, name, email, phone, password, address ? JSON.stringify([address]) : '[]', 'customer']);
        
        const [users] = await pool.query('SELECT id, name, email, phone, addresses, role FROM users WHERE id = ?', [newUserId]);
        res.status(201).json(parseJsonFields(users[0], ['addresses']));
    } catch (err) { handleError(res, 500, err.message); }
});

app.post('/api/products', async (req, res) => {
    try {
        const p = req.body;
        const newProduct = { ...p, id: `${p.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}-${Date.now()}`, rating: 0, reviewCount: 0, reviews: [] };
        await pool.query(`INSERT INTO products (id, name, brand, category, price, originalPrice, images, description, shortDescription, specs, options, rating, reviewCount, reviews, isFeatured, isBestSeller) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [newProduct.id, newProduct.name, newProduct.brand, newProduct.category, newProduct.price, newProduct.originalPrice, JSON.stringify(newProduct.images), newProduct.description, newProduct.shortDescription, JSON.stringify(newProduct.specs), JSON.stringify(newProduct.options), newProduct.rating, newProduct.reviewCount, JSON.stringify(newProduct.reviews), newProduct.isFeatured, newProduct.isBestSeller]);
        res.status(201).json(newProduct);
    } catch (err) { handleError(res, 500, err.message); }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const p = req.body;
        await pool.query(`UPDATE products SET name = ?, brand = ?, category = ?, price = ?, originalPrice = ?, images = ?, description = ?, shortDescription = ?, specs = ?, options = ?, isFeatured = ?, isBestSeller = ? WHERE id = ?`, [p.name, p.brand, p.category, p.price, p.originalPrice, JSON.stringify(p.images), p.description, p.shortDescription, JSON.stringify(p.specs), JSON.stringify(p.options), p.isFeatured, p.isBestSeller, id]);
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
        res.json(parseJsonFields(rows[0], ['images', 'specs', 'options', 'reviews']));
    } catch (err) { handleError(res, 500, err.message); }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (err) { handleError(res, 500, err.message); }
});

app.post('/api/products/:id/reviews', async (req, res) => {
    const { id: productId } = req.params;
    const { author, rating, comment } = req.body;
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
        if (rows[0]) {
            const reviews = parseJsonFields(rows[0], ['reviews']).reviews || [];
            reviews.unshift({ id: Date.now(), author, rating, comment, date: new Date().toISOString() });
            const reviewCount = reviews.length;
            const newRating = parseFloat((reviews.reduce((s, r) => s + r.rating, 0) / reviewCount).toFixed(1));
            await pool.query('UPDATE products SET reviews = ?, rating = ?, reviewCount = ? WHERE id = ?', [JSON.stringify(reviews), newRating, reviewCount, productId]);
            const [updated] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
            res.status(201).json(parseJsonFields(updated[0], ['images', 'specs', 'options', 'reviews']));
        } else { handleError(res, 404, 'Không tìm thấy sản phẩm'); }
    } catch (err) { handleError(res, 500, err.message); }
});

app.post('/api/categories', async (req, res) => {
    try {
        const { name, image } = req.body;
        const id = `${name.toLowerCase().replace(/ /g, '-')}-${Date.now()}`;
        await pool.query('INSERT INTO categories (id, name, image) VALUES (?, ?, ?)', [id, name, image]);
        res.status(201).json({ id, name, image });
    } catch (err) { handleError(res, 500, err.message); }
});

app.put('/api/categories/:id', async (req, res) => {
    try {
        await pool.query('UPDATE categories SET name = ?, image = ? WHERE id = ?', [req.body.name, req.body.image, req.params.id]);
        res.json({ ...req.body, id: req.params.id });
    } catch (err) { handleError(res, 500, err.message); }
});

app.delete('/api/categories/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (err) { handleError(res, 500, err.message); }
});

app.post('/api/brands', async (req, res) => {
    try {
        const { name, logo, category_ids } = req.body;
        const id = `${name.toLowerCase().replace(/ /g, '-')}-${Date.now()}`;
        await pool.query('INSERT INTO brands (id, name, logo, category_ids) VALUES (?, ?, ?, ?)', [id, name, logo, JSON.stringify(category_ids || [])]);
        res.status(201).json({ id, name, logo, category_ids: category_ids || [] });
    } catch(err) { handleError(res, 500, err.message); }
});

app.put('/api/brands/:id', async (req, res) => {
    try {
        const { name, logo, category_ids } = req.body;
        await pool.query('UPDATE brands SET name = ?, logo = ?, category_ids = ? WHERE id = ?', [name, logo, JSON.stringify(category_ids || []), req.params.id]);
        res.json({ ...req.body, id: req.params.id });
    } catch (err) { handleError(res, 500, err.message); }
});

app.delete('/api/brands/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM brands WHERE id = ?', [req.params.id]);
        res.status(204).send();
    } catch (err) { handleError(res, 500, err.message); }
});

app.post('/api/orders', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { name, phone, address, paymentMethod, items, total, userId } = req.body;
        const orderId = `ORDER-${Date.now()}`;
        await connection.query(`INSERT INTO orders (id, customerName, phone, address, total, status, orderDate, paymentMethod, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [orderId, name, phone, address, total, 'Chờ xác nhận', new Date(), paymentMethod, userId]);
        for (const item of items) {
            await connection.query(`INSERT INTO order_items (order_id, product_id, quantity, price, product) VALUES (?, ?, ?, ?, ?)`, [orderId, item.product.id, item.quantity, item.product.price, JSON.stringify(item)]);
        }
        await connection.commit();
        const [order] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
        const [orderItems] = await connection.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
        res.status(201).json({ ...order[0], items: orderItems.map(i => parseJsonFields(i, ['product'])) });
    } catch (err) {
        await connection.rollback();
        handleError(res, 500, err.message);
    } finally {
        connection.release();
    }
});

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
        res.status(204).send();
    } catch (err) { handleError(res, 500, err.message); }
});

app.put('/api/settings', async (req, res) => {
    try {
        const { logo, slides } = req.body;
        await pool.query(`INSERT INTO store_settings (id, logo, slides) VALUES (1, ?, ?) ON DUPLICATE KEY UPDATE logo = ?, slides = ?`, [logo, JSON.stringify(slides), logo, JSON.stringify(slides)]);
        const [rows] = await pool.query('SELECT * FROM store_settings WHERE id = 1');
        res.json(parseJsonFields(rows[0], ['slides']));
    } catch(err) { handleError(res, 500, err.message); }
});

app.listen(PORT, async () => {
    try {
        const conn = await pool.getConnection();
        console.log(`Đã kết nối thành công tới MySQL database '${dbConfig.database}'.`);
        conn.release();
        await initializeDatabase();
        console.log(`Backend server đang chạy trên http://localhost:${PORT}`);
    } catch (err) {
        console.error("\nKHÔNG THỂ KẾT NỐI HOẶC THIẾT LẬP MYSQL DATABASE.");
        console.error("Vui lòng kiểm tra lại thông tin trong 'dbConfig' tại file server.js:");
        console.error(`- Host: ${dbConfig.host}`);
        console.error(`- User: ${dbConfig.user}`);
        console.error(`- Database: ${dbConfig.database}`);
        console.error("Cũng hãy chắc chắn rằng địa chỉ IP của bạn đã được cho phép kết nối tới server MySQL (Remote MySQL).");
        console.error("Chi tiết lỗi:", err.message);
        process.exit(1);
    }
});