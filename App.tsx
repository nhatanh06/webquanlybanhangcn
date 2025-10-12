import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';

// Import components
import Header from './components/Header';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';
import OrderSuccessModal from './components/OrderSuccessModal';
import WelcomeToast from './components/WelcomeToast'; // Import mới

// Import customer pages
import HomePage from './pages/customer/HomePage';
import ShopPage from './pages/customer/ShopPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import LoginPage from './pages/customer/LoginPage';
import AccountPage from './pages/customer/AccountPage';
import RegisterPage from './pages/customer/RegisterPage';
import NewsPage from './pages/customer/NewsPage';

// Import admin pages
import DashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminBrandsPage from './pages/admin/AdminBrandsPage';
import AdminAppearancePage from './pages/admin/AdminAppearancePage';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const CustomerLayout: React.FC = () => {
    const { successfulOrder, clearSuccessfulOrder } = useAppContext();
    const navigate = useNavigate();

    const handleCloseModal = () => {
        clearSuccessfulOrder();
        navigate('/');
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow"><Outlet /></main>
            <Footer />
            {successfulOrder && <OrderSuccessModal order={successfulOrder} onClose={handleCloseModal} />}
        </div>
    );
};

const ProtectedRoutes: React.FC = () => {
    const { user } = useAppContext();
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const AdminRouteLayout: React.FC = () => {
    const { user } = useAppContext();
    if (!user || user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }
    return <AdminLayout><Outlet /></AdminLayout>;
};

const AppRoutes: React.FC = () => (
    <HashRouter>
        <ScrollToTop />
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<CustomerLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/shop/:categoryId" element={<ShopPage />} />
                <Route path="/product/:productId" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route element={<ProtectedRoutes />}>
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                </Route>
            </Route>
            <Route element={<AdminRouteLayout />}>
                <Route path="/admin" element={<DashboardPage />} />
                <Route path="/admin/products" element={<AdminProductsPage />} />
                <Route path="/admin/orders" element={<AdminOrdersPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/reports" element={<AdminReportsPage />} />
                <Route path="/admin/categories" element={<AdminCategoriesPage />} />
                <Route path="/admin/brands" element={<AdminBrandsPage />} />
                <Route path="/admin/appearance" element={<AdminAppearancePage />} />
            </Route>
        </Routes>
    </HashRouter>
);

const AppContent: React.FC = () => {
    const { isLoading, apiError, welcomeMessage, clearWelcomeMessage } = useAppContext();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-lg font-semibold text-gray-700">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (apiError) {
        return (
            <div className="flex items-center justify-center h-screen bg-red-50 text-gray-800">
                <div className="text-center p-8 max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-red-600 mb-4">Lỗi kết nối server</h1>
                    <p className="mb-6">Không thể kết nối đến backend. Có vẻ như server chưa được khởi động. Vui lòng làm theo các bước sau:</p>
                    <div className="text-left bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <p className="font-semibold mb-2">1. Mở một cửa sổ dòng lệnh (Terminal) mới.</p>
                        <p className="font-semibold mb-2">2. Di chuyển vào thư mục `backend`:</p>
                        <code className="block bg-gray-800 text-white p-3 rounded-md mb-4 text-sm">cd backend</code>
                        <p className="font-semibold mb-2">3. Chạy lệnh sau để khởi động server:</p>
                        <code className="block bg-gray-800 text-white p-3 rounded-md mb-2 text-sm">npm run dev</code>
                        <p className="mt-4 text-sm text-gray-600">Sau khi server khởi động, hãy tải lại trang này.</p>
                    </div>
                     <p className="mt-4 text-sm text-red-500">Chi tiết lỗi: {apiError}</p>
                </div>
            </div>
        );
    }
    
    return (
      <>
        {welcomeMessage && <WelcomeToast message={welcomeMessage} onClose={clearWelcomeMessage} />}
        <AppRoutes />
      </>
    );
};

const App: React.FC = () => (
    <AppProvider>
        <AppContent />
    </AppProvider>
);

export default App;