
# Hướng dẫn Cài đặt Backend - AkStore (Chế độ SQLite)

Đây là hướng dẫn để cài đặt và chạy server backend cho ứng dụng AkStore. Phiên bản này sử dụng **SQLite**, một cơ sở dữ liệu dựa trên tệp tin, có nghĩa là bạn **KHÔNG CẦN CÀI ĐẶT** MySQL, XAMPP hay bất kỳ phần mềm máy chủ cơ sở dữ liệu nào khác.

**Ưu điểm:**
- **Không cần cài đặt phức tạp:** Không cần user, password hay server CSDL.
- **Tự động thiết lập:** Server sẽ tự động tạo ra tệp cơ sở dữ liệu `akstore.db` và điền dữ liệu mẫu trong lần chạy đầu tiên.
- **Dữ liệu vĩnh viễn:** Mọi thay đổi bạn thực hiện (thêm sản phẩm, đặt hàng mới) sẽ được lưu lại ngay cả khi bạn khởi động lại server.

## 1. Yêu cầu hệ thống

- **Node.js**: Phiên bản 16.x trở lên.

## 2. Các bước Cài đặt (Siêu đơn giản)

### Bước 1: Cài đặt Dependencies

Mở cửa sổ dòng lệnh (Terminal/Command Prompt), di chuyển vào thư mục `backend` của dự án và chạy lệnh sau:

```bash
cd backend
npm install
```

### Bước 2: Chạy Server

Cũng trong terminal đó, chạy lệnh:

```bash
npm run dev
```

Bạn sẽ thấy thông báo:
```
Đã kết nối tới cơ sở dữ liệu SQLite.
Backend server đang chạy trên http://localhost:5001
Chế độ: Cơ sở dữ liệu SQLite. Dữ liệu được lưu trữ vĩnh viễn trong file 'akstore.db'.
```

**Vậy là xong!** Hãy giữ cho cửa sổ terminal này luôn chạy trong khi bạn làm việc với giao diện. Tệp `akstore.db` sẽ được tự động tạo trong thư mục `backend`.

## 3. Chạy Giao diện Frontend

1.  Trong VS Code, tìm tệp `index.html` ở thư mục gốc.
2.  Nhấn chuột phải vào tệp và chọn **"Open with Live Server"**.
3.  Trình duyệt sẽ mở ra và ứng dụng sẽ hoạt động đầy đủ.
