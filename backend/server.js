const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 5001;

// --- CẤU HÌNH KẾT NỐI DATABASE ---
// !!! QUAN TRỌNG: Hãy thay đổi thông tin dưới đây cho phù hợp với MySQL của bạn !!!
// Nếu kết nối đến HOSTING, hãy dùng thông tin do nhà cung cấp hosting đưa cho bạn.
const dbPool = mysql.createPool({
  host: '127.0.0.1',      // THAY BẰNG HOST TỪ HOSTING CỦA BẠN (VD: 123.45.67.89 hoặc db.yourdomain.com)
  user: 'root',           // THAY BẰNG USERNAME DATABASE TỪ HOSTING
  password: 'Abc@12345', // <<<--- THAY MẬT KHẨU DATABASE TỪ HOSTING
  database: 'webbanhangcongnghe', // <<<--- THAY BẰNG TÊN DATABASE TỪ HOSTING
  port: 3306,             // Cổng mặc định của MySQL, thay đổi nếu hosting của bạn dùng cổng khác
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Giúp MySQL trả về các kiểu dữ liệu gốc của JS thay vì Buffer
  typeCast: function (field, next) {
    if (field.type === 'JSON') {
      try {
        return JSON.parse(field.string());
      } catch (e) {
        return null;
      }
    }
    return next();
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' })); // Tăng giới hạn cho ảnh Base64

// Helper function để xử lý lỗi
const handleError = (res, error) => {
    console.error('Lỗi API:', error);
    res.status(500).json({ message: 'Lỗi server nội bộ', error: error.message });
};

// --- API Routes ---

const productQueryFields = `
    p.id, p.name, p.price, p.originalPrice, p.images, 
    p.description, p.shortDescription, p.specs, p.options, 
    p.rating, p.reviewCount, p.reviews, p.isFeatured, p.isBestSeller,
    b.name as brand, 
    c.name as category
`;

// GET ALL INITIAL DATA (REFACTORED FOR STABILITY)
app.get('/api/initial-data', async (req, res) => {
    try {
        // 1. Fetch all data in flat arrays
        const [products] = await dbPool.query(`SELECT ${productQueryFields} FROM products p JOIN brands b ON p.brand_id = b.id JOIN categories c ON p.category_id = c.id ORDER BY p.name ASC`);
        const [categories] = await dbPool.query('SELECT * FROM categories ORDER BY name ASC');
        const [brands] = await dbPool.query('SELECT * FROM brands ORDER BY name ASC');
        const [settings] = await dbPool.query('SELECT * FROM store_settings WHERE id = 1');
        const [users] = await dbPool.query('SELECT id, name, email, phone, addresses, role FROM users');
        const [orders] = await dbPool.query('SELECT id, user_id AS userId, customer_name AS customerName, phone, address, total, status, order_date AS orderDate, payment_method AS paymentMethod FROM orders ORDER BY order_date DESC');
        const [orderItems] = await dbPool.query('SELECT * FROM order_items');

        // 2. Create a product map for efficient lookup
        const productMap = new Map(products.map(p => [p.id, p]));

        // 3. Assemble orders with their items in JavaScript
        const assembledOrders = orders.map(order => {
            const itemsForOrder = orderItems
                .filter(item => item.order_id === order.id)
                .map(item => {
                    const productDetails = productMap.get(item.product_id);
                    // Return a well-structured cart item, handling cases where product might be deleted
                    return {
                        product: productDetails || null, 
                        quantity: item.quantity,
                        selectedOptions: item.selected_options
                    };
                })
                .filter(item => item.product !== null); // Ensure we don't include items for deleted products

            return {
                ...order,
                items: itemsForOrder
            };
        });

        // 4. Send the complete, correctly structured response
        res.json({
            products,
            categories,
            brands,
            storeSettings: settings[0] || { logo: '', slides: [] },
            users,
            orders: assembledOrders,
        });
    } catch (error) {
        handleError(res, error);
    }
});


// == AUTH ==
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await dbPool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        if (rows.length > 0) {
            const user = rows[0];
            delete user.password;
            res.json(user);
        } else {
            res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        }
    } catch (error) {
        handleError(res, error);
    }
});

app.post('/api/register', async (req, res) => {
    const { name, email, phone, password, address } = req.body;
    const userId = `user-${Date.now()}`;
    const addresses = address ? JSON.stringify([address]) : JSON.stringify([]);

    try {
        await dbPool.query(
            'INSERT INTO users (id, name, email, phone, password, addresses, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, name, email, phone, password, addresses, 'customer']
        );
        const [rows] = await dbPool.query('SELECT * FROM users WHERE id = ?', [userId]);
        const user = rows[0];
        delete user.password;
        res.status(201).json(user);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email này đã tồn tại.' });
        }
        handleError(res, error);
    }
});

// == PRODUCTS ==
app.post('/api/products', async (req, res) => {
    const p = req.body;
    try {
        const [brandRows] = await dbPool.query('SELECT id FROM brands WHERE name = ?', [p.brand]);
        const [categoryRows] = await dbPool.query('SELECT id FROM categories WHERE name = ?', [p.category]);
        if (brandRows.length === 0 || categoryRows.length === 0) {
            return res.status(400).json({ message: 'Thương hiệu hoặc Danh mục không hợp lệ' });
        }
        const brand_id = brandRows[0].id;
        const category_id = categoryRows[0].id;
        
        const newId = `${p.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}-${Date.now()}`;
        const sql = 'INSERT INTO products (id, name, brand_id, category_id, price, originalPrice, images, description, shortDescription, specs, options, isFeatured, isBestSeller, reviews) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [newId, p.name, brand_id, category_id, p.price, p.originalPrice, JSON.stringify(p.images), p.description, p.shortDescription, JSON.stringify(p.specs), JSON.stringify(p.options), p.isFeatured, p.isBestSeller, JSON.stringify([])];
        
        await dbPool.query(sql, values);
        const [rows] = await dbPool.query(`SELECT ${productQueryFields} FROM products p JOIN brands b ON p.brand_id = b.id JOIN categories c ON p.category_id = c.id WHERE p.id = ?`, [newId]);
        res.status(201).json(rows[0]);
    } catch (error) {
        handleError(res, error);
    }
});

app.put('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    const p = req.body;
    try {
        const [brandRows] = await dbPool.query('SELECT id FROM brands WHERE name = ?', [p.brand]);
        const [categoryRows] = await dbPool.query('SELECT id FROM categories WHERE name = ?', [p.category]);
        if (brandRows.length === 0 || categoryRows.length === 0) {
            return res.status(400).json({ message: 'Thương hiệu hoặc Danh mục không hợp lệ' });
        }
        const brand_id = brandRows[0].id;
        const category_id = categoryRows[0].id;

        const sql = 'UPDATE products SET name=?, brand_id=?, category_id=?, price=?, originalPrice=?, images=?, description=?, shortDescription=?, specs=?, options=?, isFeatured=?, isBestSeller=? WHERE id=?';
        const values = [p.name, brand_id, category_id, p.price, p.originalPrice, JSON.stringify(p.images), p.description, p.shortDescription, JSON.stringify(p.specs), JSON.stringify(p.options), p.isFeatured, p.isBestSeller, id];

        await dbPool.query(sql, values);
        const [rows] = await dbPool.query(`SELECT ${productQueryFields} FROM products p JOIN brands b ON p.brand_id = b.id JOIN categories c ON p.category_id = c.id WHERE p.id = ?`, [id]);
        res.json(rows[0]);
    } catch (error) {
        handleError(res, error);
    }
});

app.delete('/api/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await dbPool.query('DELETE FROM products WHERE id = ?', [id]);
        res.status(204).send();
    } catch (error) {
        handleError(res, error);
    }
});

app.post('/api/products/:id/reviews', async (req, res) => {
    const { id: productId } = req.params;
    const { author, rating, comment } = req.body;
    const connection = await dbPool.getConnection();

    try {
        await connection.beginTransaction();

        const [products] = await connection.query('SELECT reviews, rating, reviewCount FROM products WHERE id = ? FOR UPDATE', [productId]);
        
        if (products.length === 0) {
            throw new Error('Không tìm thấy sản phẩm');
        }

        const product = products[0];
        const reviews = product.reviews || [];

        const newReview = {
            id: Date.now(),
            author,
            rating,
            comment,
            date: new Date().toISOString().split('T')[0],
        };

        reviews.unshift(newReview);
        const newReviewCount = reviews.length;
        const newTotalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const newAverageRating = parseFloat((newTotalRating / newReviewCount).toFixed(1));

        await connection.query(
            'UPDATE products SET reviews = ?, rating = ?, reviewCount = ? WHERE id = ?',
            [JSON.stringify(reviews), newAverageRating, newReviewCount, productId]
        );
        
        await connection.commit();
        
        const [updatedProducts] = await dbPool.query(`SELECT ${productQueryFields} FROM products p JOIN brands b ON p.brand_id = b.id JOIN categories c ON p.category_id = c.id WHERE p.id = ?`, [productId]);
        res.status(201).json(updatedProducts[0]);

    } catch (error) {
        await connection.rollback();
        handleError(res, error);
    } finally {
        connection.release();
    }
});

// == CATEGORIES & BRANDS ==
app.post('/api/categories', async (req, res) => {
    const { name, image } = req.body;
    const newId = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}-${Date.now()}`;
    try {
        await dbPool.query('INSERT INTO categories (id, name, image) VALUES (?, ?, ?)', [newId, name, image]);
        res.status(201).json({ id: newId, name, image });
    } catch(error) { handleError(res, error); }
});
app.put('/api/categories/:id', async (req, res) => {
    const { id } = req.params;
    const { name, image } = req.body;
    try {
        await dbPool.query('UPDATE categories SET name = ?, image = ? WHERE id = ?', [name, image, id]);
        res.json({ id, name, image });
    } catch(error) { handleError(res, error); }
});
app.delete('/api/categories/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [products] = await dbPool.query('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id]);
        if (products[0].count > 0) {
            return res.status(409).json({ message: `Không thể xóa danh mục vì vẫn còn sản phẩm đang sử dụng.` });
        }
        await dbPool.query('DELETE FROM categories WHERE id = ?', [id]);
        res.status(204).send();
    } catch(error) { handleError(res, error); }
});

app.post('/api/brands', async (req, res) => {
    const { name, logo } = req.body;
    const newId = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}-${Date.now()}`;
    try {
        await dbPool.query('INSERT INTO brands (id, name, logo) VALUES (?, ?, ?)', [newId, name, logo]);
        res.status(201).json({ id: newId, name, logo });
    } catch(error) { handleError(res, error); }
});
app.put('/api/brands/:id', async (req, res) => {
    const { id } = req.params;
    const { name, logo } = req.body;
    try {
        await dbPool.query('UPDATE brands SET name = ?, logo = ? WHERE id = ?', [name, logo, id]);
        res.json({ id, name, logo });
    } catch(error) { handleError(res, error); }
});
app.delete('/api/brands/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [products] = await dbPool.query('SELECT COUNT(*) as count FROM products WHERE brand_id = ?', [id]);
        if (products[0].count > 0) {
            return res.status(409).json({ message: `Không thể xóa thương hiệu vì vẫn còn sản phẩm đang sử dụng.` });
        }
        await dbPool.query('DELETE FROM brands WHERE id = ?', [id]);
        res.status(204).send();
    } catch(error) { handleError(res, error); }
});

// == ORDERS ==
app.post('/api/orders', async (req, res) => {
    const { name, phone, address, paymentMethod, items, total, userId } = req.body;
    const orderId = `ORDER-${Date.now()}`;
    const connection = await dbPool.getConnection();

    try {
        await connection.beginTransaction();

        const orderSql = 'INSERT INTO orders (id, user_id, customer_name, phone, address, total, status, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        await connection.query(orderSql, [orderId, userId, name, phone, address, total, 'Chờ xác nhận', paymentMethod]);

        const itemSql = 'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, selected_options) VALUES ?';
        const itemValues = items.map(item => [
            orderId,
            item.product.id,
            item.quantity,
            item.product.price,
            JSON.stringify(item.selectedOptions)
        ]);
        if (itemValues.length > 0) {
            await connection.query(itemSql, [itemValues]);
        }
        
        await connection.commit();

        // Safely fetch the newly created order with its items
        const [orderRows] = await connection.query('SELECT id, user_id AS userId, customer_name AS customerName, phone, address, total, status, order_date AS orderDate, payment_method AS paymentMethod FROM orders WHERE id = ?', [orderId]);
        const [itemRows] = await connection.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
        
        const productIds = itemRows.map(item => item.product_id);
        const [productRows] = productIds.length > 0 ? await connection.query(`SELECT ${productQueryFields} FROM products p JOIN brands b ON p.brand_id = b.id JOIN categories c ON p.category_id = c.id WHERE p.id IN (?)`, [productIds]) : [[]];

        const productMap = new Map(productRows.map(p => [p.id, p]));

        const assembledItems = itemRows.map(item => ({
            product: productMap.get(item.product_id) || null,
            quantity: item.quantity,
            selectedOptions: item.selected_options
        })).filter(item => item.product);

        const newOrder = {
            ...orderRows[0],
            items: assembledItems
        };

        res.status(201).json(newOrder);

    } catch (error) {
        await connection.rollback();
        handleError(res, error);
    } finally {
        connection.release();
    }
});


app.put('/api/orders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await dbPool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        res.status(204).send();
    } catch (error) {
        handleError(res, error);
    }
});

// == STORE SETTINGS ==
app.put('/api/settings', async (req, res) => {
    const { logo, slides } = req.body;
    try {
        const sql = `
            INSERT INTO store_settings (id, logo, slides) VALUES (1, ?, ?)
            ON DUPLICATE KEY UPDATE logo = VALUES(logo), slides = VALUES(slides)
        `;
        await dbPool.query(sql, [logo, JSON.stringify(slides)]);
        const [rows] = await dbPool.query('SELECT * FROM store_settings WHERE id = 1');
        res.json(rows[0]);
    } catch (error) {
        handleError(res, error);
    }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server đang chạy trên http://localhost:${PORT}`);
});