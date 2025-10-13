# Hướng dẫn Cài đặt Backend - AkStore (Chế độ MySQL)

Đây là hướng dẫn để cài đặt và chạy server backend cho ứng dụng AkStore, đã được cấu hình để sử dụng **MySQL**.

**Ưu điểm của phiên bản này:**
- **Mạnh mẽ & Mở rộng**: Sử dụng hệ quản trị cơ sở dữ liệu quan hệ chuyên nghiệp.
- **Tự động thiết lập**: Server sẽ tự động tạo tất cả các bảng cần thiết và điền dữ liệu mẫu vào cơ sở dữ liệu của bạn trong lần chạy đầu tiên.
- **Dữ liệu vĩnh viễn:** Mọi thay đổi bạn thực hiện sẽ được lưu lại trong server MySQL.

## 1. Yêu cầu hệ thống

- **Node.js**: Phiên bản 16.x trở lên.
- **MySQL Server**: Một máy chủ MySQL đang chạy và có thể truy cập được từ nơi bạn chạy backend.

## 2. Các bước Cài đặt

### Bước 1: Cấu hình kết nối

1.  Mở tệp `backend/server.js`.
2.  Tìm đến đối tượng `dbConfig` ở đầu tệp.
3.  **Chỉnh sửa các thông tin này** để khớp với thông tin đăng nhập cơ sở dữ liệu MySQL của bạn.

    ```javascript
    const dbConfig = {
        host: '103.130.217.240',          // << THAY ĐỔI NẾU CẦN
        user: 'akstorei_firebasekiet',   // << THAY ĐỔI NẾU CẦN
        password: 'doantotnghiep@2006', // << THAY ĐỔI NẾU CẦN
        database: 'akstorei_quanlybanhang', // << THAY ĐỔI NẾU CẦN
        port: 3306,                      // Cổng mặc định của MySQL
        // ... các cài đặt khác
    };
    ```

### Bước 2: Cài đặt Dependencies

Mở cửa sổ dòng lệnh (Terminal/Command Prompt), di chuyển vào thư mục `backend` của dự án và chạy lệnh sau để cài đặt các thư viện cần thiết (bao gồm `mysql2`):

```bash
cd backend
npm install
```

### Bước 3: Chạy Server

Cũng trong terminal đó, chạy lệnh:

```bash
npm run dev
```

Nếu cấu hình chính xác, bạn sẽ thấy thông báo:
```
Đã kết nối thành công tới MySQL database 'tên_database_của_bạn'.
Đang kiểm tra và thiết lập cơ sở dữ liệu MySQL...
Tất cả các bảng đã được kiểm tra/tạo thành công.
CSDL đã có dữ liệu, bỏ qua bước chèn dữ liệu mẫu. (Hoặc "Đang chèn dữ liệu mẫu...")
Backend server đang chạy trên http://localhost:5001
```

**Vậy là xong!** Hãy giữ cho cửa sổ terminal này luôn chạy trong khi bạn làm việc với giao diện.

## 3. Chạy Giao diện Frontend

1.  Trong VS Code, tìm tệp `index.html` ở thư mục gốc.
2.  Nhấn chuột phải vào tệp và chọn **"Open with Live Server"**.
3.  Trình duyệt sẽ mở ra và ứng dụng sẽ hoạt động đầy đủ, kết nối tới backend và cơ sở dữ liệu MySQL của bạn.