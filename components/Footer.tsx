import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 text-gray-600 mt-16 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Giới thiệu */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-blue-700">AkStore</h3>
            <p className="text-gray-500">
              Cửa hàng công nghệ hàng đầu, cung cấp các sản phẩm chính hãng với giá tốt nhất.
            </p>
          </div>

          {/* Liên kết nhanh */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li><Link to="/shop" className="text-gray-500 hover:text-blue-600 transition-colors">Cửa hàng</Link></li>
              <li><Link to="/news" className="text-gray-500 hover:text-blue-600 transition-colors">Tin tức</Link></li>
              <li><Link to="/cart" className="text-gray-500 hover:text-blue-600 transition-colors">Giỏ hàng</Link></li>
              <li><Link to="/account" className="text-gray-500 hover:text-blue-600 transition-colors">Tài khoản</Link></li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Liên hệ</h3>
            <ul className="space-y-2 text-gray-500">
              <li>Địa chỉ: Ấp Cầu Xéo, Xã Long Thành, Đồng Nai</li>
              <li>Email: support@akstore.com</li>
              <li>Điện thoại: (081) 3121 270</li>
            </ul>
          </div>

          {/* Mạng xã hội */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Theo dõi chúng tôi</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Facebook</a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Instagram</a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Twitter</a>
            </div>
          </div>

        </div>
      </div>
      <div className="bg-gray-100 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} AkStore. Đã đăng ký bản quyền.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;