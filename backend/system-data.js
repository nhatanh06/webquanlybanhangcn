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
    INITIAL_USERS,
    INITIAL_STORE_SETTINGS
};
