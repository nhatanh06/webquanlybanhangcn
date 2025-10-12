const data = require('./system-data');

const setupSystemDatabase = (db) => {
    const createTables = () => {
        db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                phone TEXT NOT NULL,
                password TEXT NOT NULL,
                addresses TEXT NOT NULL DEFAULT '[]',
                role TEXT NOT NULL CHECK(role IN ('admin', 'customer'))
            );

            CREATE TABLE IF NOT EXISTS store_settings (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                logo TEXT,
                slides TEXT
            );
        `, (err) => {
            if (err) {
                console.error("Lỗi khi tạo bảng hệ thống:", err.message);
            } else {
                console.log("Các bảng hệ thống đã được tạo thành công.");
                insertInitialData();
            }
        });
    };

    const insertInitialData = () => {
        db.serialize(() => {
            // Insert Users
            const userStmt = db.prepare("INSERT INTO users (id, name, email, phone, password, addresses, role) VALUES (?, ?, ?, ?, ?, ?, ?)");
            data.INITIAL_USERS.forEach(user => {
                userStmt.run(user.id, user.name, user.email, user.phone, user.password, JSON.stringify(user.addresses), user.role);
            });
            userStmt.finalize();
            
            // Insert Store Settings
            const settings = data.INITIAL_STORE_SETTINGS;
            db.run("INSERT INTO store_settings (id, logo, slides) VALUES (1, ?, ?)", [settings.logo, JSON.stringify(settings.slides)]);
            
            console.log("Dữ liệu mẫu cho hệ thống đã được chèn thành công.");
        });
    };

    createTables();
};

module.exports = { setupSystemDatabase };