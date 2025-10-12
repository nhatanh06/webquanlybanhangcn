import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { Product, CartItem, Order, User, OrderStatus, Category, Brand, StoreSettings, Review } from '../types';
import { apiRequest } from '../services/api';
// Import các custom hook mới
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import { useAdminProducts } from '../hooks/useAdminProducts';
import { useAdminCategories } from '../hooks/useAdminCategories';
import { useAdminBrands } from '../hooks/useAdminBrands';
import { useAdminSettings } from '../hooks/useAdminSettings';

// Định nghĩa kiểu cho toàn bộ state của ứng dụng
interface AppState {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  orders: Order[];
  users: User[];
  storeSettings: StoreSettings;
}

// Định nghĩa kiểu cho Context, gộp tất cả các hàm từ các hook
interface AppContextType extends AppState {
  user: User | null;
  cart: CartItem[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  apiError: string | null;
  successfulOrder: Order | null;
  welcomeMessage: string;
  clearWelcomeMessage: () => void;
  // Cart Functions
  addToCart: (product: Product, quantity: number, selectedOptions: { [key: string]: string }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  // Auth Functions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  registerUser: (userData: Omit<User, 'id' | 'role' | 'addresses'> & { password?: string; address?: string }) => Promise<{ success: boolean; message?: string }>;
  // Order Functions
  placeOrder: (customerInfo: { name: string; phone: string; address: string; paymentMethod: 'COD' | 'Bank Transfer' | 'Momo' }) => Promise<Order | null>;
  clearSuccessfulOrder: () => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  // Admin Product Functions
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'reviews'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addReview: (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => Promise<void>;
  // Admin Category Functions
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  // Admin Brand Functions
  addBrand: (brand: Omit<Brand, 'id'>) => Promise<void>;
  updateBrand: (brand: Brand) => Promise<void>;
  deleteBrand: (brandId: string) => Promise<void>;
  // Admin Settings Functions
  updateStoreSettings: (settings: StoreSettings) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- STATE MANAGEMENT ---
  const [appState, setAppState] = useState<AppState>({
      products: [],
      categories: [],
      brands: [],
      orders: [],
      users: [],
      storeSettings: { logo: '', slides: [] }
  });
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('akstore_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) { return null; }
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('akstore_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) { return []; }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successfulOrder, setSuccessfulOrder] = useState<Order | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setApiError(null);
        const data = await apiRequest<AppState>('/initial-data');
        setAppState(data);
      } catch (e: any) {
        setApiError(e.message || 'Không thể kết nối đến server.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // --- LOCAL STORAGE SYNC ---
  useEffect(() => { localStorage.setItem('akstore_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('akstore_cart', JSON.stringify(cart)); }, [cart]);

  // --- LOGIC HOOKS ---
  // Gọi tất cả các hook chuyên biệt và truyền vào state/setState cần thiết
  const cartLogic = useCart({ cart, setCart });
  const authLogic = useAuth({ setUser, setCart, setIsSubmitting, setWelcomeMessage });
  const orderLogic = useOrders({ cart, user, getCartTotal: cartLogic.getCartTotal, clearCart: cartLogic.clearCart, setAppState, setSuccessfulOrder, setError, setIsSubmitting });
  const adminProductLogic = useAdminProducts({ setAppState, setIsSubmitting, setError });
  const adminCategoryLogic = useAdminCategories({ setAppState, setIsSubmitting, setError });
  const adminBrandLogic = useAdminBrands({ setAppState, setIsSubmitting, setError });
  const adminSettingsLogic = useAdminSettings({ setAppState, setIsSubmitting, setError });

  const clearSuccessfulOrder = () => setSuccessfulOrder(null);
  const clearWelcomeMessage = () => setWelcomeMessage('');

  // --- CONTEXT PROVIDER ---
  // Kết hợp state và tất cả các hàm logic từ các hook để tạo context value
  const contextValue: AppContextType = useMemo(() => ({
      ...appState,
      user,
      cart,
      isLoading,
      isSubmitting,
      error,
      apiError,
      successfulOrder,
      welcomeMessage,
      clearSuccessfulOrder,
      clearWelcomeMessage,
      ...cartLogic,
      ...authLogic,
      ...orderLogic,
      ...adminProductLogic,
      ...adminCategoryLogic,
      ...adminBrandLogic,
      ...adminSettingsLogic
  }), [appState, user, cart, isLoading, isSubmitting, error, apiError, successfulOrder, welcomeMessage, cartLogic, authLogic, orderLogic, adminProductLogic, adminCategoryLogic, adminBrandLogic, adminSettingsLogic]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook để các component con có thể sử dụng context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext phải được sử dụng bên trong AppProvider');
  }
  return context;
};
