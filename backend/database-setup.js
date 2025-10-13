const data = require('./app-data');

const setupAppDatabase = (db) => {
    const createTables = () => {
        db.exec(`
            CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                image TEXT
            );

            CREATE TABLE IF NOT EXISTS brands (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                logo TEXT
            );

            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                brand TEXT NOT NULL,
                category TEXT NOT NULL,
                price INTEGER NOT NULL,
                originalPrice INTEGER,
                images TEXT,
                description TEXT,
                shortDescription TEXT,
                specs TEXT,
                options TEXT,
                rating REAL NOT NULL DEFAULT 0,
                reviewCount INTEGER NOT NULL DEFAULT 0,
                reviews TEXT,
                isFeatured INTEGER NOT NULL DEFAULT 0 CHECK(isFeatured IN (0, 1)),
                isBestSeller INTEGER NOT NULL DEFAULT 0 CHECK(isBestSeller IN (0, 1))
            );

            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                customerName TEXT NOT NULL,
                phone TEXT NOT NULL,
                address TEXT NOT NULL,
                total INTEGER NOT NULL DEFAULT 0,
                status TEXT NOT NULL DEFAULT 'Chờ xác nhận' CHECK(status IN ('Chờ xác nhận', 'Đang xử lý', 'Đang giao hàng', 'Hoàn thành', 'Đã hủy')),
                orderDate TEXT NOT NULL,
                paymentMethod TEXT NOT NULL CHECK(paymentMethod IN ('COD', 'Bank Transfer', 'Momo')),
                userId TEXT
            );

            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT NOT NULL,
                product_id TEXT NOT NULL,
                quantity INTEGER NOT NULL CHECK(quantity > 0),
                price INTEGER NOT NULL CHECK(price >= 0),
                product TEXT NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders (id)
            );
        `, (err) => {
            if (err) {
                console.error("Lỗi khi tạo bảng ứng dụng:", err.message);
            } else {
                console.log("Các bảng ứng dụng đã được tạo thành công.");
                insertInitialData();
            }
        });
    };

    const insertInitialData = () => {
        db.serialize(() => {
            // Insert Categories
            const categoryStmt = db.prepare("INSERT INTO categories (id, name, image) VALUES (?, ?, ?)");
            data.INITIAL_CATEGORIES.forEach(cat => categoryStmt.run(cat.id, cat.name, cat.image));
            categoryStmt.finalize();

            // Insert Brands
            const brandStmt = db.prepare("INSERT INTO brands (id, name, logo) VALUES (?, ?, ?)");
            data.INITIAL_BRANDS.forEach(brand => brandStmt.run(brand.id, brand.name, brand.logo));
            brandStmt.finalize();
            
            // Insert Products
            const productStmt = db.prepare(`INSERT INTO products (id, name, brand, category, price, originalPrice, images, description, shortDescription, specs, options, rating, reviewCount, reviews, isFeatured, isBestSeller) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            data.INITIAL_PRODUCTS.forEach(p => {
                productStmt.run(
                    p.id, p.name, p.brand, p.category, p.price, p.originalPrice,
                    JSON.stringify(p.images), p.description, p.shortDescription, JSON.stringify(p.specs),
                    JSON.stringify(p.options), p.rating, p.reviewCount, JSON.stringify(p.reviews),
                    p.isFeatured ? 1 : 0, p.isBestSeller ? 1 : 0
                );
            });
            productStmt.finalize();
            
            console.log("Dữ liệu mẫu cho ứng dụng đã được chèn thành công.");
        });
    };

    createTables();
};

module.exports = { setupAppDatabase };