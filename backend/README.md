# Hướng dẫn Cài đặt Backend - AkStore

Đây là hướng dẫn để cài đặt và chạy server backend cho ứng dụng AkStore, kết nối với cơ sở dữ liệu MySQL.

## 1. Yêu cầu hệ thống

- **Node.js**: Phiên bản 16.x trở lên.
- **MySQL Server**: Một máy chủ MySQL đang chạy. Bạn có thể sử dụng các công cụ như:
  - **XAMPP** (Windows, macOS, Linux - Dễ sử dụng nhất cho người mới bắt đầu)
  - **MAMP** (macOS)
  - **Docker**

## 2. Các bước Cài đặt

### Bước 1: Cài đặt Dependencies

Mở cửa sổ dòng lệnh (Terminal/Command Prompt), di chuyển vào thư mục `backend` của dự án và chạy lệnh sau để cài đặt các gói cần thiết:

```bash
cd backend
npm install
```

### Bước 2: Thiết lập Cơ sở dữ liệu

Bạn cần tạo một cơ sở dữ liệu rỗng và sau đó chạy đoạn mã SQL dưới đây để tạo cấu trúc bảng và chèn dữ liệu mẫu.

1.  **Khởi động MySQL Server của bạn** (ví dụ: mở XAMPP và nhấn Start cho MySQL).
2.  **Tạo Database**:
    - Sử dụng một công cụ quản lý CSDL (như phpMyAdmin, DBeaver, etc.).
    - Tạo một database mới với tên `webbanhangcongnghe`.
    - **Quan trọng**: Chọn collation (bảng mã) là `utf8mb4_unicode_ci`.
3.  **Thực thi Script SQL**:
    - Sau khi tạo database, hãy sao chép **toàn bộ** đoạn mã SQL bên dưới.
    - Dán nó vào tab "SQL" của công cụ quản lý CSDL của bạn (trong database `webbanhangcongnghe` vừa tạo) và nhấn "Go" hoặc "Execute".

### Bước 3: Cấu hình Kết nối

Mở tệp `backend/server.js`. Tìm đến đoạn mã sau ở đầu tệp và **thay đổi thông tin cho phù hợp với cài đặt MySQL của bạn**.

```javascript
// --- CẤU HÌNH KẾT NỐI DATABASE ---
const dbPool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'Abc@12345', // <--- THAY MẬT KHẨU CỦA BẠN VÀO ĐÂY
  database: 'webbanhangcongnghe',
  // ...
});
```
> **LƯU Ý QUAN TRỌNG:** Lỗi `ER_ACCESS_DENIED_ERROR` (Access denied...) gần như luôn luôn xảy ra do bạn **chưa điền hoặc điền sai mật khẩu** ở bước này. Hãy kiểm tra kỹ!

## 3. Chạy Ứng dụng

1.  **Chạy Backend**:
    - Trong cửa sổ Terminal (vẫn ở thư mục `backend`), chạy lệnh:
    ```bash
    npm run dev
    ```
    - Bạn sẽ thấy thông báo: `Backend server đang chạy trên http://localhost:5001`. **Giữ cho cửa sổ terminal này luôn chạy.**

2.  **Xem Frontend**:
    - Mở cửa sổ xem trước của ứng dụng (preview). Giao diện React sẽ tự động tải, kết nối đến backend và hiển thị dữ liệu.

---
---

## **Kết nối với Cơ sở dữ liệu trên Hosting (Môi trường Production)**

Nếu bạn có một hosting với cơ sở dữ liệu, đây là cách để kết nối:

1.  **Lấy thông tin CSDL từ Hosting**:
    -   **Host Address**: Địa chỉ IP hoặc tên miền của CSDL (VD: `123.45.67.89`).
    -   **Database Name**: Tên CSDL trên hosting (VD: `user_dbname`).
    -   **Username**: Tên người dùng CSDL (VD: `user_dbuser`).
    -   **Password**: Mật khẩu của người dùng đó.

2.  **Cấu hình Remote MySQL**:
    -   **QUAN TRỌNG:** Vào control panel của hosting (cPanel/Plesk...), tìm mục **"Remote MySQL"**.
    -   Thêm địa chỉ IP của nơi bạn sẽ chạy backend vào danh sách cho phép. Nếu bạn chạy backend trên máy cá nhân để test, hãy thêm địa chỉ IP public của mạng nhà bạn.

3.  **Cập nhật `server.js`**: Thay thế các thông tin `localhost`, `root`,... bằng thông tin bạn đã lấy được từ hosting.

---

## SCRIPT TẠO CƠ SỞ DỮ LIỆU (SAO CHÉP TOÀN BỘ)

```sql
--
-- Cấu trúc bảng cho `brands`
--

CREATE TABLE `brands` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logo` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `brands`
--

INSERT INTO `brands` (`id`, `name`, `logo`) VALUES
('apple-1718790278772', 'Apple', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='),
('dell-1718790295171', 'Dell', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='),
('logitech-1718790310861', 'Logitech', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='),
('samsung-1718790303104', 'Samsung', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho `categories`
--

CREATE TABLE `categories` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` text COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`, `image`) VALUES
('dien-thoai-1718790327341', 'Điện thoại', 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=300&fit=crop'),
('laptop-1718790333200', 'Laptop', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop'),
('phu-kien-1718790339599', 'Phụ kiện', 'https://images.unsplash.com/photo-1542751111-a474c6b289e0?w=400&h=300&fit=crop');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho `orders`
--

CREATE TABLE `orders` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customer_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `total` decimal(15,2) NOT NULL,
  `status` enum('Chờ xác nhận','Đang xử lý','Đang giao hàng','Hoàn thành','Đã hủy') COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `quantity` int(11) NOT NULL,
  `price_at_purchase` decimal(15,2) NOT NULL,
  `selected_options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`selected_options`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho `products`
--

CREATE TABLE `products` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `brand_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(15,2) NOT NULL,
  `originalPrice` decimal(15,2) DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`images`)),
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `shortDescription` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `specs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`specs`)),
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`options`)),
  `rating` float NOT NULL DEFAULT 0,
  `reviewCount` int(11) NOT NULL DEFAULT 0,
  `reviews` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`reviews`)),
  `isFeatured` tinyint(1) NOT NULL DEFAULT 0,
  `isBestSeller` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `name`, `brand_id`, `category_id`, `price`, `originalPrice`, `images`, `description`, `shortDescription`, `specs`, `options`, `rating`, `reviewCount`, `reviews`, `isFeatured`, `isBestSeller`) VALUES
('dell-xps-15-2023-1718790535384', 'Dell XPS 15 2023', 'dell-1718790295171', 'laptop-1718790333200', '45990000.00', '49990000.00', '[\"https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=400&h=300&fit=crop\"]', 'Dell XPS 15 9530 là một trong những chiếc laptop Windows tốt nhất trên thị trường, với màn hình OLED tuyệt đẹp, hiệu năng mạnh mẽ và thiết kế sang trọng.', 'Laptop cao cấp với màn hình OLED 3.5K, Intel Core i7-13700H, và card đồ họa NVIDIA GeForce RTX 4050.', '{\"CPU\":\"Intel Core i7-13700H\",\"RAM\":\"16GB DDR5\",\"Ổ cứng\":\"1TB SSD\",\"Card đồ họa\":\"NVIDIA GeForce RTX 4050\",\"Màn hình\":\"15.6 inch 3.5K OLED\"}', '{\"Cấu hình\":[\"Core i7 / 16GB RAM\",\"Core i9 / 32GB RAM\"]}', 4.8, 18, '[]', 0, 1),
('iphone-15-pro-1718790535384', 'iPhone 15 Pro', 'apple-1718790278772', 'dien-thoai-1718790327341', '28990000.00', '30990000.00', '[\"https://images.unsplash.com/photo-1695026909613-2b881b71d2b8?w=400&h=300&fit=crop\"]', 'iPhone 15 Pro là một bước nhảy vọt về công nghệ với chip A17 Pro, khung viền titan và hệ thống camera chuyên nghiệp. Nút Action mới mang đến khả năng tùy biến linh hoạt, cùng với cổng USB-C cho tốc độ truyền dữ liệu siêu nhanh.', 'Điện thoại thông minh cao cấp với chip A17 Pro mạnh mẽ, khung titan và hệ thống camera đột phá.', '{\"Màn hình\":\"6.1 inch, Super Retina XDR\",\"CPU\":\"A17 Pro\",\"Camera\":\"Chính 48MP, Ultra Wide, Telephoto\",\"Pin\":\"Lên đến 23 giờ xem video\"}', '{\"Dung lượng\":[\"128GB\",\"256GB\",\"512GB\"],\"Màu sắc\":[\"Titan tự nhiên\",\"Titan xanh\",\"Titan trắng\",\"Titan đen\"]}', 4.9, 152, '[{\"id\":1,\"author\":\"Minh Anh\",\"rating\":5,\"comment\":\"Máy ảnh chụp siêu đẹp, hiệu năng mượt mà không chê vào đâu được!\",\"date\":\"2023-10-20\"},{\"id\":2,\"author\":\"Quốc Bảo\",\"rating\":4,\"comment\":\"Khung viền titan cầm rất thích tay, nhưng giá hơi cao.\",\"date\":\"2023-10-18\"}]', 1, 1),
('logitech-mx-master-3s-1718790535384', 'Logitech MX Master 3S', 'logitech-1718790310861', 'phu-kien-1718790339599', '2490000.00', NULL, '[\"https://images.unsplash.com/photo-1631047979929-a139e551a353?w=400&h=300&fit=crop\"]', 'Logitech MX Master 3S mang đến sự chính xác, hiệu suất và cảm giác sử dụng tuyệt vời. Với cảm biến 8K DPI và nút bấm Quiet Clicks, đây là con chuột hoàn hảo cho công việc sáng tạo và lập trình.', 'Chuột không dây cao cấp với cảm biến 8K DPI, nút bấm siêu yên tĩnh và thiết kế công thái học.', '{\"Cảm biến\":\"Darkfield 8000 DPI\",\"Kết nối\":\"Bluetooth, Logi Bolt USB Receiver\",\"Pin\":\"70 ngày sử dụng\",\"Tương thích\":\"Windows, macOS, Linux, ChromeOS, iPadOS\"}', '{\"Màu sắc\":[\"Đen\",\"Trắng\"]}', 4.7, 45, '[]', 1, 0),
('macbook-pro-14-m3-1718790535384', 'Macbook Pro 14 M3', 'apple-1718790278772', 'laptop-1718790333200', '39990000.00', NULL, '[\"https://images.unsplash.com/photo-1698664168097-337422f2075a?w=400&h=300&fit=crop\"]', 'MacBook Pro mới với chip M3 mang lại hiệu năng đáng kinh ngạc cho các tác vụ chuyên nghiệp. Màn hình Liquid Retina XDR sống động, thời lượng pin lên đến 22 giờ và hệ thống âm thanh 6 loa đỉnh cao.', 'Laptop chuyên nghiệp với chip Apple M3, màn hình Liquid Retina XDR và thời lượng pin vượt trội.', '{\"Chip\":\"Apple M3 (8-core CPU, 10-core GPU)\",\"RAM\":\"8GB unified memory\",\"Ổ cứng\":\"512GB SSD\",\"Màn hình\":\"14.2-inch Liquid Retina XDR\"}', '{\"Màu sắc\":[\"Space Gray\",\"Silver\"]}', 5, 25, '[]', 1, 1),
('samsung-galaxy-s24-ultra-1718790535384', 'Samsung Galaxy S24 Ultra', 'samsung-1718790303104', 'dien-thoai-1718790327341', '33990000.00', NULL, '[\"https://images.unsplash.com/photo-1707144214873-5719c1583e3b?w=400&h=300&fit=crop\"]', 'Galaxy S24 Ultra định nghĩa lại trải nghiệm di động với Galaxy AI, camera 200MP zoom 100x và bút S Pen tích hợp. Màn hình phẳng Dynamic AMOLED 2X cho độ sáng và khả năng hiển thị ngoài trời vượt trội.', 'Điện thoại flagship với Galaxy AI, camera 200MP, bút S Pen và hiệu năng đỉnh cao.', '{\"Màn hình\":\"6.8 inch, Dynamic AMOLED 2X\",\"CPU\":\"Snapdragon 8 Gen 3 for Galaxy\",\"Camera\":\"200MP, zoom 100x\",\"Bút S Pen\":\"Tích hợp\"}', '{\"Màu sắc\":[\"Xám Titan\",\"Đen Titan\",\"Tím Titan\",\"Vàng Titan\"]}', 4.8, 98, '[]', 0, 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho `store_settings`
--

CREATE TABLE `store_settings` (
  `id` int(11) NOT NULL,
  `logo` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `slides` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`slides`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `store_settings`
--

INSERT INTO `store_settings` (`id`, `logo`, `slides`) VALUES
(1, '', '[{\"id\":\"slide-1\",\"image\":\"https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1200&h=600&fit=crop\",\"title\":\"Kỷ nguyên Công nghệ Mới\",\"subtitle\":\"Khám phá những sản phẩm đỉnh cao của năm 2024\",\"link\":\"/shop\"},{\"id\":\"slide-2\",\"image\":\"https://images.unsplash.com/photo-1695026909613-2b881b71d2b8?w=1200&h=600&fit=crop\",\"title\":\"iPhone 15 Pro Max\",\"subtitle\":\"Khung titan. Chip A17 Pro. Đẳng cấp pro.\",\"link\":\"/product/iphone-15-pro-1718790535384\"}]');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho `users`
--

CREATE TABLE `users` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `addresses` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`addresses`)),
  `role` enum('admin','customer') COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `addresses`, `role`) VALUES
('admin-1', 'Admin', 'admin@example.com', '0123456789', '1', '[]', 'admin'),
('user-1', 'Nhật Anh', 'user@example.com', '0987654321', '1', '[\"123 Đường ABC, Quận 1, TP.HCM\"]', 'customer');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `brand_id` (`brand_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Chỉ mục cho bảng `store_settings`
--
ALTER TABLE `store_settings`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`brand_id`) REFERENCES `brands` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;
```