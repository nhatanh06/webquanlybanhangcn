
const data = require('./data');

const setupDatabase = (db) => {
    const createTables = () => {
        db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                phone TEXT,
                password TEXT NOT NULL,
                addresses TEXT,
                role TEXT NOT NULL
            );

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
                price REAL NOT NULL,
                originalPrice REAL,
                images TEXT,
                description TEXT,
                shortDescription TEXT,
                specs TEXT,
                options TEXT,
                rating REAL,
                reviewCount INTEGER,
                reviews TEXT,
                isFeatured INTEGER,
                isBestSeller INTEGER
            );

            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                customerName TEXT NOT NULL,
                phone TEXT,
                address TEXT,
                total REAL,
                status TEXT,
                orderDate TEXT,
                paymentMethod TEXT,
                userId TEXT
            );

            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT,
                product_id TEXT,
                quantity INTEGER,
                price REAL,
                product TEXT,
                FOREIGN KEY (order_id) REFERENCES orders (id)
            );

            CREATE TABLE IF NOT EXISTS store_settings (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                logo TEXT,
                slides TEXT
            );
        `, (err) => {
            if (err) {
                console.error("Lỗi khi tạo bảng:", err.message);
            } else {
                console.log("Các bảng đã được tạo thành công.");
                insertInitialData();
            }
        });
    };

    const insertInitialData = () => {
        db.serialize(() => {
            // Insert Users
            const userStmt = db.prepare("INSERT INTO users (id, name, email, phone, password, addresses, role) VALUES (?, ?, ?, ?, ?, ?, ?)");
            data.INITIAL_USERS.forEach(user => {
                userStmt.run(null, user.name, user.email, user.phone, user.password, JSON.stringify(user.addresses), user.role);
            });
            userStmt.finalize();

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
            
            // Insert Store Settings
            const settings = data.INITIAL_STORE_SETTINGS;
            db.run("INSERT INTO store_settings (id, logo, slides) VALUES (1, ?, ?)", [settings.logo, JSON.stringify(settings.slides)]);
            
            console.log("Dữ liệu mẫu đã được chèn thành công.");
        });
    };

    createTables();
};

module.exports = { setupDatabase };
