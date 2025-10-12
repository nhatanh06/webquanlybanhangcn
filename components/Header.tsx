import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ICONS } from '../constants';
import { Product } from '../types';
import Logo from './Logo';

const Header: React.FC = () => {
  const { cart, user, products, storeSettings } = useAppContext();
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchTerm(query);
    if (query.length > 1) {
      const filteredSuggestions = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
      setSuggestions(filteredSuggestions);
      setIsSuggestionsVisible(true);
    } else {
      setSuggestions([]);
      setIsSuggestionsVisible(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      navigate(`/product/${suggestions[0].id}`);
    } else if(searchTerm.trim()) {
      navigate(`/shop?q=${searchTerm.trim()}`);
    }
    closeAndClearSearch();
  };
  
  const closeAndClearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setIsSuggestionsVisible(false);
    setIsMobileMenuOpen(false);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSuggestionsVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="bg-blue-700 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex-shrink-0">
              {storeSettings.logo ? <img src={storeSettings.logo} alt="AkStore Logo" className="h-10 w-auto" /> : <Logo />}
            </Link>

            <nav className="hidden md:flex md:space-x-8">
              <Link to="/" className="text-blue-100 hover:text-white transition-colors font-medium">Trang chủ</Link>
              <Link to="/shop" className="text-blue-100 hover:text-white transition-colors font-medium">Cửa hàng</Link>
              <Link to="/news" className="text-blue-100 hover:text-white transition-colors font-medium">Tin tức</Link>
              {user?.role === 'admin' && <Link to="/admin" className="text-blue-100 hover:text-white transition-colors font-medium">Admin</Link>}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="relative hidden lg:block" ref={searchContainerRef}>
                <form onSubmit={handleSearchSubmit}>
                  <input type="text" placeholder="Tìm kiếm sản phẩm..." className="w-full pl-4 pr-10 py-2 bg-blue-600 text-white border border-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-blue-500 transition-all placeholder-blue-200" value={searchTerm} onChange={handleSearchChange} onFocus={() => { if (suggestions.length > 0) setIsSuggestionsVisible(true); }} />
                  <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-200 hover:text-white cursor-pointer">{ICONS.search}</button>
                </form>
                {isSuggestionsVisible && suggestions.length > 0 && (
                  <div className="absolute mt-2 w-[400px] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                    <ul>{suggestions.map(product => (<li key={product.id}><Link to={`/product/${product.id}`} onClick={closeAndClearSearch} className="flex items-center p-3 hover:bg-gray-100 transition-colors"><img src={product.images[0]} alt={product.name} className="w-12 h-12 object-contain bg-gray-100 p-1 rounded-md mr-4" /><div><p className="font-semibold text-gray-800">{product.name}</p><p className="text-sm text-blue-600">{product.price.toLocaleString('vi-VN')}₫</p></div></Link></li>))}</ul>
                  </div>
                )}
              </div>
              
              <Link to="/cart" className="relative text-blue-100 hover:text-white transition-colors">
                {ICONS.cart}
                {cartItemCount > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartItemCount}</span>}
              </Link>
              <Link to={user ? "/account" : "/login"} className="text-blue-100 hover:text-white transition-colors hidden sm:block">{ICONS.user}</Link>
              
              <button className="md:hidden text-blue-100" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} /></svg>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-blue-700">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-100 hover:bg-blue-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Trang chủ</Link>
                <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-100 hover:bg-blue-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Cửa hàng</Link>
                <Link to="/news" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-100 hover:bg-blue-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Tin tức</Link>
                 <Link to={user ? "/account" : "/login"} onClick={() => setIsMobileMenuOpen(false)} className="text-blue-100 hover:bg-blue-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium sm:hidden">Tài khoản</Link>
                {user?.role === 'admin' && <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-100 hover:bg-blue-600 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Admin</Link>}
            </div>
            <div className="p-4 lg:hidden">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                    <input type="text" placeholder="Tìm kiếm..." className="w-full pl-4 pr-10 py-2 bg-blue-600 text-white border border-blue-500 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-blue-500 transition-all placeholder-blue-200" value={searchTerm} onChange={handleSearchChange} />
                    <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3 text-blue-200 hover:text-white">{ICONS.search}</button>
                </div>
              </form>
               {suggestions.length > 0 && (
                  <div className="mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
                    <ul>{suggestions.map(product => (<li key={product.id}><Link to={`/product/${product.id}`} onClick={closeAndClearSearch} className="flex items-center p-3 hover:bg-gray-100 transition-colors"><img src={product.images[0]} alt={product.name} className="w-12 h-12 object-contain bg-gray-100 p-1 rounded-md mr-4" /><div><p className="font-semibold text-gray-800">{product.name}</p><p className="text-sm text-blue-600">{product.price.toLocaleString('vi-VN')}₫</p></div></Link></li>))}</ul>
                  </div>
                )}
            </div>
        </div>
      )}
    </>
  );
};

export default Header;