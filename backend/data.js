const INITIAL_CATEGORIES = [
    { id: 'dien-thoai', name: 'Điện thoại', image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=300&fit=crop' },
    { id: 'laptop', name: 'Laptop', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop' },
    { id: 'phu-kien', name: 'Phụ kiện', image: 'https://images.unsplash.com/photo-1542751111-a474c6b289e0?w=400&h=300&fit=crop' },
];

const INITIAL_BRANDS = [
    { id: 'apple', name: 'Apple', logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' },
    { id: 'samsung', name: 'Samsung', logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' },
    { id: 'dell', name: 'Dell', logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' },
    { id: 'logitech', name: 'Logitech', logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' },
];

const INITIAL_PRODUCTS = [
    {
        id: 'iphone-15-pro',
        name: 'iPhone 15 Pro',
        brand: 'Apple',
        category: 'Điện thoại',
        price: 28990000,
        originalPrice: 30990000,
        images: ['https://www.apple.com/v/iphone-15-pro/c/images/overview/design/design_hero_1__c8v4sc3t5keq_large.jpg', 'https://www.apple.com/v/iphone-15-pro/c/images/overview/chip/chip_hero__d2uubv25252a_large.jpg'],
        description: 'iPhone 15 Pro là một bước nhảy vọt về công nghệ với chip A17 Pro, khung viền titan và hệ thống camera chuyên nghiệp. Nút Action mới mang đến khả năng tùy biến linh hoạt, cùng với cổng USB-C cho tốc độ truyền dữ liệu siêu nhanh.',
        shortDescription: 'Điện thoại thông minh cao cấp với chip A17 Pro mạnh mẽ, khung titan và hệ thống camera đột phá.',
        specs: { 'Màn hình': '6.1 inch, Super Retina XDR', 'CPU': 'A17 Pro', 'Camera': 'Chính 48MP, Ultra Wide, Telephoto', 'Pin': 'Lên đến 23 giờ xem video' },
        options: { 'Dung lượng': ['128GB', '256GB', '512GB'], 'Màu sắc': ['Titan tự nhiên', 'Titan xanh', 'Titan trắng', 'Titan đen'] },
        rating: 4.9,
        reviewCount: 152,
        reviews: [
            { id: 1, author: 'Minh Anh', rating: 5, comment: 'Máy ảnh chụp siêu đẹp, hiệu năng mượt mà không chê vào đâu được!', date: '2023-10-20' },
            { id: 2, author: 'Quốc Bảo', rating: 4, comment: 'Khung viền titan cầm rất thích tay, nhưng giá hơi cao.', date: '2023-10-18' }
        ],
        isFeatured: true,
        isBestSeller: true,
    },
    {
        id: 'macbook-pro-14-m3',
        name: 'Macbook Pro 14 M3',
        brand: 'Apple',
        category: 'Laptop',
        price: 39990000,
        images: ['https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/mbp14-spacegray-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1697230830200'],
        description: 'MacBook Pro mới với chip M3 mang lại hiệu năng đáng kinh ngạc cho các tác vụ chuyên nghiệp. Màn hình Liquid Retina XDR sống động, thời lượng pin lên đến 22 giờ và hệ thống âm thanh 6 loa đỉnh cao.',
        shortDescription: 'Laptop chuyên nghiệp với chip Apple M3, màn hình Liquid Retina XDR và thời lượng pin vượt trội.',
        specs: { 'Chip': 'Apple M3 (8-core CPU, 10-core GPU)', 'RAM': '8GB unified memory', 'Ổ cứng': '512GB SSD', 'Màn hình': '14.2-inch Liquid Retina XDR' },
        options: { 'Màu sắc': ['Space Gray', 'Silver'] },
        rating: 5,
        reviewCount: 25,
        reviews: [],
        isFeatured: true,
        isBestSeller: true,
    },
    {
        id: 'samsung-galaxy-s24-ultra',
        name: 'Samsung Galaxy S24 Ultra',
        brand: 'Samsung',
        category: 'Điện thoại',
        price: 33990000,
        images: ['https://images.samsung.com/is/image/samsung/p6pim/vn/2401/gallery/vn-galaxy-s24-ultra-s928-sm-s928bztqxxv-539572972?$650_519_PNG$'],
        description: 'Galaxy S24 Ultra định nghĩa lại trải nghiệm di động với Galaxy AI, camera 200MP zoom 100x và bút S Pen tích hợp. Màn hình phẳng Dynamic AMOLED 2X cho độ sáng và khả năng hiển thị ngoài trời vượt trội.',
        shortDescription: 'Điện thoại flagship với Galaxy AI, camera 200MP, bút S Pen và hiệu năng đỉnh cao.',
        specs: { 'Màn hình': '6.8 inch, Dynamic AMOLED 2X', 'CPU': 'Snapdragon 8 Gen 3 for Galaxy', 'Camera': '200MP, zoom 100x', 'Bút S Pen': 'Tích hợp' },
        options: { 'Màu sắc': ['Xám Titan', 'Đen Titan', 'Tím Titan', 'Vàng Titan'] },
        rating: 4.8,
        reviewCount: 98,
        reviews: [],
        isFeatured: false,
        isBestSeller: true,
    },
    {
        id: 'dell-xps-15-2023',
        name: 'Dell XPS 15 2023',
        brand: 'Dell',
        category: 'Laptop',
        price: 45990000,
        originalPrice: 49990000,
        images: ['https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-15-9530/media-gallery/touch-platinum-silver/notebook-xps-15-9530-t-platinum-silver-gallery-4.psd?fmt=pjpg&pscan=auto&scl=1&wid=3799&hei=2298&qlt=100,0&resMode=sharp2&size=3799,2298'],
        description: 'Dell XPS 15 9530 là một trong những chiếc laptop Windows tốt nhất trên thị trường, với màn hình OLED tuyệt đẹp, hiệu năng mạnh mẽ và thiết kế sang trọng.',
        shortDescription: 'Laptop cao cấp với màn hình OLED 3.5K, Intel Core i7-13700H, và card đồ họa NVIDIA GeForce RTX 4050.',
        specs: { 'CPU': 'Intel Core i7-13700H', 'RAM': '16GB DDR5', 'Ổ cứng': '1TB SSD', 'Card đồ họa': 'NVIDIA GeForce RTX 4050', 'Màn hình': '15.6 inch 3.5K OLED' },
        options: { 'Cấu hình': ['Core i7 / 16GB RAM', 'Core i9 / 32GB RAM'] },
        rating: 4.8,
        reviewCount: 18,
        reviews: [],
        isFeatured: false,
        isBestSeller: true,
    },
    {
        id: 'logitech-mx-master-3s',
        name: 'Logitech MX Master 3S',
        brand: 'Logitech',
        category: 'Phụ kiện',
        price: 2490000,
        images: ['https://resource.logitech.com/w_800,c_lpad,ar_1:1,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/mx-master-3s/gallery/mx-master-3s-mouse-top-view-graphite.png?v=1'],
        description: 'Logitech MX Master 3S mang đến sự chính xác, hiệu suất và cảm giác sử dụng tuyệt vời. Với cảm biến 8K DPI và nút bấm Quiet Clicks, đây là con chuột hoàn hảo cho công việc sáng tạo và lập trình.',
        shortDescription: 'Chuột không dây cao cấp với cảm biến 8K DPI, nút bấm siêu yên tĩnh và thiết kế công thái học.',
        specs: { 'Cảm biến': 'Darkfield 8000 DPI', 'Kết nối': 'Bluetooth, Logi Bolt USB Receiver', 'Pin': '70 ngày sử dụng', 'Tương thích': 'Windows, macOS, Linux, ChromeOS, iPadOS' },
        options: { 'Màu sắc': ['Đen', 'Trắng'] },
        rating: 4.7,
        reviewCount: 45,
        reviews: [],
        isFeatured: true,
        isBestSeller: false,
    },
];

const INITIAL_USERS = [
    { id: 'admin-1', name: 'Admin', email: 'admin@example.com', phone: '0123456789', addresses: [], role: 'admin', password: '1' },
    { id: 'user-1', name: 'Nhật Anh', email: 'user@example.com', phone: '0987654321', addresses: ['123 Đường ABC, Quận 1, TP.HCM'], role: 'customer', password: '1' },
];

const INITIAL_STORE_SETTINGS = {
    logo: '',
    slides: [
        { id: 'slide-1', image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1200&h=600&fit=crop', title: 'Kỷ nguyên Công nghệ Mới', subtitle: 'Khám phá những sản phẩm đỉnh cao của năm 2024', link: '/shop' },
        { id: 'slide-2', image: 'https://images.unsplash.com/photo-1695026909613-2b881b71d2b8?w=1200&h=600&fit=crop', title: 'iPhone 15 Pro Max', subtitle: 'Khung titan. Chip A17 Pro. Đẳng cấp pro.', link: '/product/iphone-15-pro' },
    ]
};

module.exports = {
    INITIAL_CATEGORIES,
    INITIAL_BRANDS,
    INITIAL_PRODUCTS,
    INITIAL_USERS,
    INITIAL_STORE_SETTINGS
};
