import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';

// Import components
import Header from './components/Header';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';

// Import customer pages
import HomePage from './pages/customer/HomePage';
import ShopPage from './pages/customer/ShopPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import LoginPage from './pages/customer/LoginPage';
import AccountPage from './pages/customer/AccountPage';
import OrderConfirmationPage from './pages/customer/OrderConfirmationPage';
import RegisterPage from './pages/customer/RegisterPage';

// Import admin pages
import DashboardPage from './pages/admin/DashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminBrandsPage from './pages/admin/AdminBrandsPage';
import AdminAppearancePage from './pages/admin/AdminAppearancePage';

// Helper component to auto-scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Layout for all customer-facing pages
const CustomerLayout: React.FC = () => (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow"><Outlet /></main>
        <Footer />
    </div>
);

// Wrapper for routes that require any logged-in user
const ProtectedRoutes: React.FC = () => {
    const { user } = useAppContext();
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Wrapper for Admin routes
const AdminRouteLayout: React.FC = () => {
    const { user } = useAppContext();
    if (!user || user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }
    return <AdminLayout><Outlet /></AdminLayout>;
};


const AppContent: React.FC = () => {
    return (
        <HashRouter>
            <ScrollToTop />
            <Routes>
                {/* Standalone Auth Pages */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Customer Layout Routes */}
                <Route element={<CustomerLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/shop/:categoryId" element={<ShopPage />} />
                    <Route path="/product/:productId" element={<ProductDetailPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    
                    {/* Protected Customer Routes */}
                    <Route element={<ProtectedRoutes />}>
                        <Route path="/account" element={<AccountPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
                    </Route>
                </Route>

                {/* Admin Layout Routes */}
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
};


const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

export default App;
