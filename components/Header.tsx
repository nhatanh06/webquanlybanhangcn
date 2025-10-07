import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ICONS } from '../constants';
import { Product } from '../types';

const Header: React.FC = () => {
  // Lấy dữ liệu từ context
  const { cart, user, products, storeSettings } = useAppContext();
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  // State cho chức năng tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Xử lý khi người dùng nhập vào ô tìm kiếm
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length > 1) {
      const filteredSuggestions = products
        .filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 5); // Giới hạn 5 gợi ý
      setSuggestions(filteredSuggestions);
      setIsSuggestionsVisible(true);
    } else {
      setSuggestions([]);
      setIsSuggestionsVisible(false);
    }
  };

  // Xử lý khi nhấn Enter để tìm kiếm
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      navigate(`/product/${suggestions[0].id}`); // Chuyển đến sản phẩm đầu tiên trong gợi ý
      setSearchTerm('');
      setSuggestions([]);
      setIsSuggestionsVisible(false);
    }
  };

  // Ẩn gợi ý khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSuggestionsVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Xóa ô tìm kiếm khi chọn một gợi ý
  const handleSuggestionClick = () => {
    setSearchTerm('');
    setSuggestions([]);
    setIsSuggestionsVisible(false);
  };

  return (
    <header className="bg-blue-700 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-white transition-colors">
              {storeSettings.logo ? (
                <img src={storeSettings.logo} alt="AkStore Logo" className="h-10 w-auto" />
              ) : (
                'AkStore'
              )}
            </Link>
          </div>

          {/* Menu điều hướng */}
          <nav className="hidden md:flex md:space-x-8">
            <Link to="/" className="text-blue-100 hover:text-white transition-colors font-medium">Trang chủ</Link>
            <Link to="/shop" className="text-blue-100 hover:text-white transition-colors font-medium">Cửa hàng</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="text-blue-100 hover:text-white transition-colors font-medium">Admin</Link>
            )}
          </nav>

          {/* Thanh tìm kiếm và các icon */}
          <div className="flex items-center space-x-4">
            <div className="relative hidden lg:block" ref={searchContainerRef}>
              <form onSubmit={handleSearchSubmit}>
                <input 
                  type="text" 
                  placeholder="Tìm kiếm sản phẩm..." 
                  className="w-full pl-4 pr-10 py-2 bg-blue-600 text-white border border-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-blue-500 transition-all placeholder-blue-200"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => { if (suggestions.length > 0) setIsSuggestionsVisible(true); }}
                />
                <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-200 hover:text-white cursor-pointer">
                  {ICONS.search}
                </button>
              </form>
              
              {/* Dropdown Gợi ý */}
              {isSuggestionsVisible && suggestions.length > 0 && (
                <div className="absolute mt-2 w-[400px] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                  <ul>
                    {suggestions.map(product => (
                      <li key={product.id}>
                        <Link 
                          to={`/product/${product.id}`}
                          onClick={handleSuggestionClick}
                          className="flex items-center p-3 hover:bg-gray-100 transition-colors"
                        >
                          <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded-md mr-4" />
                          <div>
                            <p className="font-semibold text-gray-800">{product.name}</p>
                            <p className="text-sm text-blue-600">{product.price.toLocaleString('vi-VN')}₫</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <Link to="/cart" className="relative text-blue-100 hover:text-white transition-colors">
              {ICONS.cart}
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <Link to={user ? "/account" : "/login"} className="text-blue-100 hover:text-white transition-colors">
              {ICONS.user}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;