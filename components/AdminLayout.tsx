
import React from 'react';
import { NavLink, Link } from 'react-router-dom';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2 rounded-lg transition-colors ${
      isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`;
    
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b">
          <Link to="/admin" className="text-2xl font-bold text-gray-800">Admin Panel</Link>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <NavLink to="/admin" end className={navLinkClasses}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={navLinkClasses}>
            Sản phẩm
          </NavLink>
          <NavLink to="/admin/categories" className={navLinkClasses}>
            Danh mục
          </NavLink>
          <NavLink to="/admin/brands" className={navLinkClasses}>
            Thương hiệu
          </NavLink>
          <NavLink to="/admin/orders" className={navLinkClasses}>
            Đơn hàng
          </NavLink>
           <NavLink to="/admin/users" className={navLinkClasses}>
            Quản lý tài khoản
          </NavLink>
           <NavLink to="/admin/reports" className={navLinkClasses}>
            Báo cáo & Thống kê
          </NavLink>
           <NavLink to="/admin/appearance" className={navLinkClasses}>
            Giao diện cửa hàng
          </NavLink>
           <NavLink to="/" className={navLinkClasses}>
            Về trang chủ
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4">
          <h1 className="text-xl font-semibold text-gray-800">Chào mừng tới trang quản trị</h1>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;