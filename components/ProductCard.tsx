import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import StarRating from './StarRating';
import { useAppContext } from '../context/AppContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useAppContext();
  const navigate = useNavigate();

  // Tạo một đối tượng tùy chọn mặc định cho sản phẩm khi thêm từ card
  const getDefaultOptions = () => {
    const defaultOptions: { [key: string]: string } = {};
    Object.keys(product.options).forEach(key => {
      defaultOptions[key] = product.options[key][0];
    });
    return defaultOptions;
  };

  // Hàm xử lý thêm vào giỏ hàng (không chuyển trang)
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Ngăn thẻ Link bao ngoài điều hướng
    e.stopPropagation(); // Ngăn sự kiện nổi bọt lên các phần tử cha
    addToCart(product, 1, getDefaultOptions());
    alert(`${product.name} đã được thêm vào giỏ hàng!`);
  };

  // Hàm xử lý mua ngay (thêm vào giỏ và chuyển trang)
  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, getDefaultOptions());
    navigate('/cart');
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl overflow-hidden group transform hover:-translate-y-2 transition-all duration-300 ease-in-out flex flex-col">
      <Link to={`/product/${product.id}`} className="block flex flex-col flex-grow">
        <div className="relative">
          <div className="h-56 bg-gray-100 flex items-center justify-center">
            <img src={product.images[0]} alt={product.name} className="max-w-full max-h-full object-contain" />
          </div>
          {product.originalPrice && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
              - {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
            </span>
          )}
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
          <div className="flex items-center mb-2">
            <StarRating rating={product.rating} />
            <span className="text-xs text-gray-500 ml-2">({product.reviewCount} đánh giá)</span>
          </div>
          <div className="flex items-baseline justify-between mt-auto pt-2">
            <p className="text-xl font-bold text-blue-600">
              {product.price.toLocaleString('vi-VN')}₫
            </p>
            {product.originalPrice && (
              <p className="text-sm text-gray-500 line-through">
                {product.originalPrice.toLocaleString('vi-VN')}₫
              </p>
            )}
          </div>
        </div>
      </Link>
       <div className="px-4 pb-4">
            {/* Các lớp CSS liên quan đến hover đã được loại bỏ để các nút luôn hiển thị */}
            <div className="flex space-x-2">
                <button 
                    onClick={handleAddToCart}
                    className="w-full bg-blue-100 text-blue-700 py-2 rounded-lg font-semibold hover:bg-blue-200 transition-colors text-sm">
                    Thêm vào giỏ
                </button>
                 <button 
                    onClick={handleBuyNow}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors text-sm">
                    Mua ngay
                </button>
            </div>
        </div>
    </div>
  );
};

export default ProductCard;