# Hướng dẫn Cài đặt Backend - AkStore

Đây là hướng dẫn để cài đặt và chạy server backend cho ứng dụng AkStore, kết nối với cơ sở dữ liệu MySQL.

## 1. Yêu cầu hệ thống

- **Node.js**: Phiên bản 16.x trở lên.
- **MySQL Server**: Một máy chủ MySQL đang chạy. Bạn có thể sử dụng các công cụ như:
  - **XAMPP** (Windows, macOS, Linux - Dễ sử dụng nhất cho người mới bắt đầu)
  - **MAMP** (macOS)
  - **Laragon** (Windows)
  - **Docker**

## 2. Các bước Cài đặt

### Bước 1: Cài đặt Dependencies

Mở cửa sổ dòng lệnh (Terminal/Command Prompt), di chuyển vào thư mục `backend` của dự án và chạy lệnh sau để cài đặt các gói cần thiết:

```bash
cd backend
npm install
```

### Bước 2: Thiết lập Cơ sở dữ liệu

Bạn cần tạo một cơ sở dữ liệu rỗng và sau đó import cấu trúc bảng cũng như dữ liệu mẫu từ tệp `database.sql`.

#### Cách 1: Sử dụng Công cụ GUI (phpMyAdmin, DBeaver, etc.)

Đây là cách trực quan và dễ dàng. Hướng dẫn này dùng **phpMyAdmin** đi kèm với XAMPP làm ví dụ.

1.  **Khởi động XAMPP**: Mở XAMPP Control Panel và nhấn **Start** cho cả **Apache** và **MySQL**.
2.  **Mở phpMyAdmin**: Nhấn nút **Admin** ở dòng MySQL hoặc truy cập `http://localhost/phpmyadmin` trên trình duyệt.
3.  **Tạo Database**:
    - Nhấn vào tab `Databases` ở trên cùng.
    - Trong ô "Create database", nhập tên `akstore_db`.
    - Chọn collation là `utf8mb4_unicode_ci`.
    - Nhấn **Create**.
4.  **Import tệp SQL**:
    - Sau khi tạo, nhấn vào tên database `akstore_db` ở cột bên trái.
    - Chọn tab `Import` ở trên cùng.
    - Nhấn vào nút "Choose File" / "Chọn tệp" và tìm đến tệp `database.sql` trong thư mục `backend` của bạn.
    - Kéo xuống dưới cùng và nhấn nút **Go** hoặc **Import**.

Quá trình này sẽ tạo tất cả các bảng và chèn dữ liệu mẫu vào database của bạn.

#### Cách 2: Sử dụng Dòng lệnh (Nhanh hơn)

1.  **Tạo Database**:
    - Mở Terminal và đăng nhập vào MySQL: `mysql -u root -p` (nhập mật khẩu của bạn).
    - Chạy lệnh sau: `CREATE DATABASE akstore_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    - Gõ `EXIT;` để thoát.
2.  **Import tệp SQL**:
    - Vẫn ở trong Terminal và đang ở thư mục `backend`, chạy lệnh:
    ```bash
    mysql -u root -p akstore_db < database.sql
    ```
    - Nhập mật khẩu của bạn khi được hỏi. Quá trình import sẽ tự động diễn ra.

### Bước 3: Cấu hình Kết nối

Mở tệp `backend/server.js`. Tìm đến đoạn mã sau ở đầu tệp và **thay đổi thông tin cho phù hợp với cài đặt MySQL của bạn**.

```javascript
// --- CẤU HÌNH KẾT NỐI DATABASE ---
// !!! QUAN TRỌNG: Thay đổi các giá trị này cho phù hợp với môi trường MySQL của bạn !!!
const dbPool = mysql.createPool({
  host: 'localhost',      // hoặc IP của MySQL server
  user: 'root',           // user của bạn
  password: '', // mật khẩu của bạn (để trống nếu không có)
  database: 'akstore_db', // tên database bạn đã tạo
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

- **user**: Thường là `root` theo mặc định.
- **password**: Mật khẩu bạn đã đặt cho user `root`. Nếu dùng XAMPP mặc định, mật khẩu thường là để trống (`''`).

## 3. Chạy Ứng dụng

Sau khi hoàn tất các bước trên, bạn đã sẵn sàng để chạy toàn bộ hệ thống.

1.  **Chạy Backend**:
    - Trong cửa sổ Terminal (vẫn ở thư mục `backend`), chạy lệnh:
    ```bash
    npm run dev
    ```
    - Bạn sẽ thấy thông báo: `Backend server đang chạy trên http://localhost:5001`. **Giữ cho cửa sổ terminal này luôn chạy.**

2.  **Xem Frontend**:
    - Mở cửa sổ xem trước của ứng dụng (preview). Giao diện React sẽ tự động tải, kết nối đến backend và hiển thị dữ liệu.

Chúc bạn thành công!