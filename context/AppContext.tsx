import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Product, CartItem, Order, User, OrderStatus, Category, Brand, StoreSettings, Slide, Review } from '../types';

const API_BASE_URL = 'http://localhost:5001/api';

// Định nghĩa kiểu cho các giá trị trong context
interface AppContextType {
  // State
  products: Product[];
  categories: Category[];
  brands: Brand[];
  cart: CartItem[];
  orders: Order[];
  users: User[];
  user: User | null;
  storeSettings: StoreSettings;
  isLoading: boolean; // For initial data load
  isSubmitting: boolean; // For form submissions
  error: string | null;

  // Cart
  addToCart: (product: Product, quantity: number, selectedOptions: { [key: string]: string }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  
  // Order
  placeOrder: (customerInfo: { name: string; phone: string; address: string; paymentMethod: 'COD' | 'Bank Transfer' | 'Momo' }) => Promise<Order | null>;
  cancelOrder: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  
  // Auth
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  registerUser: (userData: Omit<User, 'id' | 'role' | 'addresses'> & { password: string; address?: string }) => Promise<{ success: boolean; message?: string }>;
  
  // Admin - Product
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'reviews'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  
  // Admin - Category
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (category: Category) => Promise<void>;

  // Admin - Brand
  addBrand: (brand: Omit<Brand, 'id'>) => Promise<void>;
  updateBrand: (brand: Brand) => Promise<void>;
  deleteBrand: (brand: Brand) => Promise<void>;

  // Admin - Store Settings
  updateStoreSettings: (settings: StoreSettings) => Promise<void>;

  // Review
  addReview: (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({ logo: '', slides: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all initial data from backend
  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const response = await fetch(`${API_BASE_URL}/initial-data`);
        if (!response.ok) {
            throw new Error(`Lỗi kết nối server: ${response.statusText}`);
        }
        const data = await response.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
        setBrands(data.brands || []);
        setStoreSettings(data.storeSettings || { logo: '', slides: [] });
        setUsers(data.users || []);
        setOrders(data.orders || []);
    } catch (err: any) {
        setError(err.message || 'Không thể tải dữ liệu từ server. Vui lòng đảm bảo backend đang chạy.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
    try {
        const savedUser = localStorage.getItem('techShopUser');
        if (savedUser) setUser(JSON.parse(savedUser));

        const savedCart = localStorage.getItem('techShopCart');
        if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) {
        console.error("Lỗi khi đọc session từ localStorage", e);
    }
  }, [fetchInitialData]);

  useEffect(() => {
      try {
          localStorage.setItem('techShopCart', JSON.stringify(cart));
      } catch (e) {
          console.error("Lỗi lưu giỏ hàng vào localStorage", e);
      }
  }, [cart]);

  useEffect(() => {
      try {
          if (user) {
              localStorage.setItem('techShopUser', JSON.stringify(user));
          } else {
              localStorage.removeItem('techShopUser');
          }
      } catch (e) {
          console.error("Lỗi lưu người dùng vào localStorage", e);
      }
  }, [user]);

  // --- API HELPER ---
  const apiCall = async (endpoint: string, method: string = 'GET', body: any = null) => {
    setIsSubmitting(true);
    try {
        const options: RequestInit = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || 'Yêu cầu API thất bại');
        }
        if (response.status === 204 || (response.headers.get('content-length') && parseInt(response.headers.get('content-length')!) === 0) ) {
            return null; // Handle No Content responses
        }
        return response.json();
    } finally {
        setIsSubmitting(false);
    }
  };

  // --- ACTIONS ---
  const addToCart = useCallback((product: Product, quantity: number, selectedOptions: { [key: string]: string }) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id && JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions));
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id && JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity, selectedOptions }];
    });
  }, []);
  
  const removeFromCart = useCallback((productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);
  const getCartTotal = useCallback(() => cart.reduce((total, item) => total + item.product.price * item.quantity, 0), [cart]);

  const placeOrder = async (customerInfo: { name: string; phone: string; address: string; paymentMethod: 'COD' | 'Bank Transfer' | 'Momo' }) => {
    if (cart.length === 0) return null;
    const orderData = {
        ...customerInfo,
        userId: user?.id || null,
        items: cart,
        total: getCartTotal(),
    };
    const newOrder = await apiCall('/orders', 'POST', orderData);
    if(newOrder) {
        setOrders(prev => [newOrder, ...prev]);
        clearCart();
    }
    return newOrder;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
        const loggedInUser = await apiCall('/login', 'POST', { email, password });
        setUser(loggedInUser);
        return true;
    } catch (error) {
        console.error("Login failed:", error);
        return false;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setCart([]);
  }, []);
  
  const registerUser = async (userData: any) => {
    try {
        const newUser = await apiCall('/register', 'POST', userData);
        setUser(newUser);
        return { success: true };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
  };
  
  // --- Admin Actions ---
  const addProduct = async (productData: any) => {
    const newProduct = await apiCall('/products', 'POST', productData);
    setProducts(prev => [newProduct, ...prev]);
  };
  const updateProduct = async (updatedProduct: Product) => {
    const result = await apiCall(`/products/${updatedProduct.id}`, 'PUT', updatedProduct);
    setProducts(prev => prev.map(p => p.id === result.id ? result : p));
  };
  const deleteProduct = async (productId: string) => {
    await apiCall(`/products/${productId}`, 'DELETE');
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const addCategory = async (categoryData: any) => {
    const newCategory = await apiCall('/categories', 'POST', categoryData);
    setCategories(prev => [newCategory, ...prev]);
  };
  const updateCategory = async (updatedCategory: Category) => {
    const result = await apiCall(`/categories/${updatedCategory.id}`, 'PUT', updatedCategory);
    setCategories(prev => prev.map(c => c.id === result.id ? result : c));
  };
  const deleteCategory = async (category: Category) => {
    await apiCall(`/categories/${category.id}`, 'DELETE');
    setCategories(prev => prev.filter(c => c.id !== category.id));
  };

  const addBrand = async (brandData: any) => {
    const newBrand = await apiCall('/brands', 'POST', brandData);
    setBrands(prev => [newBrand, ...prev]);
  };
  const updateBrand = async (updatedBrand: Brand) => {
    const result = await apiCall(`/brands/${updatedBrand.id}`, 'PUT', updatedBrand);
    setBrands(prev => prev.map(b => b.id === result.id ? result : b));
  };
  const deleteBrand = async (brand: Brand) => {
    await apiCall(`/brands/${brand.id}`, 'DELETE');
    setBrands(prev => prev.filter(b => b.id !== brand.id));
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await apiCall(`/orders/${orderId}/status`, 'PUT', { status });
    setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status } : order));
  };

  const cancelOrder = async (orderId: string) => {
      await updateOrderStatus(orderId, OrderStatus.Cancelled);
  };

  const updateStoreSettings = async (settings: StoreSettings) => {
      const updatedSettings = await apiCall('/settings', 'PUT', settings);
      setStoreSettings(updatedSettings);
  };

  const addReview = async (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    const updatedProduct = await apiCall(`/products/${productId}/reviews`, 'POST', reviewData);
    setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
  };

  const value = {
    products, categories, brands, cart, orders, users, user, storeSettings, isLoading, isSubmitting, error,
    addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal,
    placeOrder, login, logout, registerUser,
    addProduct, updateProduct, deleteProduct,
    cancelOrder, updateOrderStatus,
    addCategory, updateCategory, deleteCategory,
    addBrand, updateBrand, deleteBrand,
    updateStoreSettings,
    addReview,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};