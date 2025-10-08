import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Product, CartItem, Order, User, OrderStatus, Category, Brand, StoreSettings, Review } from '../types';

const API_BASE_URL = 'http://localhost:5001/api';

interface AppState {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  orders: Order[];
  users: User[];
  storeSettings: StoreSettings;
}

interface AppContextType extends AppState {
  user: User | null;
  cart: CartItem[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  apiError: string | null;
  successfulOrder: Order | null;
  addToCart: (product: Product, quantity: number, selectedOptions: { [key: string]: string }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  placeOrder: (customerInfo: { name: string; phone: string; address: string; paymentMethod: 'COD' | 'Bank Transfer' | 'Momo' }) => Promise<Order | null>;
  clearSuccessfulOrder: () => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  registerUser: (userData: Omit<User, 'id' | 'role' | 'addresses'> & { password?: string; address?: string }) => Promise<{ success: boolean; message?: string }>;
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'reviews'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addReview: (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  addBrand: (brand: Omit<Brand, 'id'>) => Promise<void>;
  updateBrand: (brand: Brand) => Promise<void>;
  deleteBrand: (brandId: string) => Promise<void>;
  updateStoreSettings: (settings: StoreSettings) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

async function apiRequest<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
    const options: RequestInit = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Lỗi không xác định từ server');
    }
    return response.status === 204 ? ({} as T) : response.json();
}


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  useEffect(() => { localStorage.setItem('akstore_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('akstore_cart', JSON.stringify(cart)); }, [cart]);

  const runAsync = async (asyncFunc: () => Promise<any>) => {
      setIsSubmitting(true);
      setError(null);
      try {
          await asyncFunc();
      } catch (e: any) {
          setError(e.message);
          alert(`Lỗi: ${e.message}`); // Show alert for immediate feedback
      } finally {
          setIsSubmitting(false);
      }
  };

  const addToCart = useCallback((product: Product, quantity: number, selectedOptions: { [key: string]: string }) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.product.id === product.id && JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions));
      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      }
      return [...prevCart, { product, quantity, selectedOptions }];
    });
  }, []);
  
  const removeFromCart = useCallback((productId: string) => setCart(prev => prev.filter(item => item.product.id !== productId)), []);
  const updateQuantity = useCallback((productId: string, quantity: number) => setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item)), []);
  const clearCart = useCallback(() => setCart([]), []);
  const getCartTotal = useCallback(() => cart.reduce((total, item) => total + item.product.price * item.quantity, 0), [cart]);
  const clearSuccessfulOrder = useCallback(() => setSuccessfulOrder(null), []);

  const login = async (email: string, password: string) => {
    try {
      setIsSubmitting(true);
      const loggedInUser = await apiRequest<User>('/login', 'POST', { email, password });
      setUser(loggedInUser);
      setIsSubmitting(false);
      return true;
    } catch (e) {
      setIsSubmitting(false);
      return false;
    }
  };

  const logout = useCallback(() => { setUser(null); setCart([]); }, []);
  
  const registerUser = async (userData: any) => {
    try {
      setIsSubmitting(true);
      const newUser = await apiRequest<User>('/register', 'POST', userData);
      setUser(newUser);
      setIsSubmitting(false);
      return { success: true };
    } catch (e: any) {
      setIsSubmitting(false);
      return { success: false, message: e.message };
    }
  };

  const placeOrder = async (customerInfo: any) => {
    if (cart.length === 0) {
        setSuccessfulOrder(null);
        return null;
    }
    const orderData = {
      ...customerInfo,
      items: cart,
      total: getCartTotal(),
      userId: user?.id || null
    };
    try {
        setIsSubmitting(true);
        const newOrder = await apiRequest<Order>('/orders', 'POST', orderData);
        setAppState(prev => ({...prev, orders: [newOrder, ...prev.orders]}));
        clearCart();
        setSuccessfulOrder(newOrder);
        return newOrder;
    } catch (e: any) {
        setError(e.message);
        setSuccessfulOrder(null);
        return null;
    } finally {
        setIsSubmitting(false);
    }
  };

  // Admin Actions
  const addProduct = async (productData: any) => runAsync(async () => {
      const newProduct = await apiRequest<Product>('/products', 'POST', productData);
      setAppState(prev => ({ ...prev, products: [newProduct, ...prev.products] }));
  });

  const updateProduct = async (updatedProduct: Product) => runAsync(async () => {
      const newProduct = await apiRequest<Product>(`/products/${updatedProduct.id}`, 'PUT', updatedProduct);
      setAppState(prev => ({ ...prev, products: prev.products.map(p => p.id === newProduct.id ? newProduct : p) }));
  });

  const deleteProduct = async (productId: string) => runAsync(async () => {
      await apiRequest(`/products/${productId}`, 'DELETE');
      setAppState(prev => ({ ...prev, products: prev.products.filter(p => p.id !== productId) }));
  });

  const addReview = async (productId: string, reviewData: any) => runAsync(async () => {
      const updatedProduct = await apiRequest<Product>(`/products/${productId}/reviews`, 'POST', reviewData);
      setAppState(prev => ({ ...prev, products: prev.products.map(p => p.id === updatedProduct.id ? updatedProduct : p) }));
  });

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => runAsync(async () => {
      await apiRequest(`/orders/${orderId}/status`, 'PUT', { status });
      setAppState(prev => ({ ...prev, orders: prev.orders.map(o => o.id === orderId ? { ...o, status } : o) }));
  });
  
  const cancelOrder = (orderId: string) => updateOrderStatus(orderId, OrderStatus.Cancelled);

  const addCategory = async (categoryData: any) => runAsync(async () => {
      const newCategory = await apiRequest<Category>('/categories', 'POST', categoryData);
      setAppState(prev => ({ ...prev, categories: [newCategory, ...prev.categories] }));
  });
  const updateCategory = async (updatedCategory: Category) => runAsync(async () => {
      const newCategory = await apiRequest<Category>(`/categories/${updatedCategory.id}`, 'PUT', updatedCategory);
      setAppState(prev => ({ ...prev, categories: prev.categories.map(c => c.id === newCategory.id ? newCategory : c) }));
  });
  const deleteCategory = async (categoryId: string) => {
      await apiRequest(`/categories/${categoryId}`, 'DELETE');
      setAppState(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== categoryId) }));
  };

  const addBrand = async (brandData: any) => runAsync(async () => {
      const newBrand = await apiRequest<Brand>('/brands', 'POST', brandData);
      setAppState(prev => ({ ...prev, brands: [newBrand, ...prev.brands] }));
  });
  const updateBrand = async (updatedBrand: Brand) => runAsync(async () => {
      const newBrand = await apiRequest<Brand>(`/brands/${updatedBrand.id}`, 'PUT', updatedBrand);
      setAppState(prev => ({ ...prev, brands: prev.brands.map(b => b.id === newBrand.id ? newBrand : b) }));
  });
  const deleteBrand = async (brandId: string) => {
      await apiRequest(`/brands/${brandId}`, 'DELETE');
      setAppState(prev => ({ ...prev, brands: prev.brands.filter(b => b.id !== brandId) }));
  };
  
  const updateStoreSettings = async (settings: StoreSettings) => runAsync(async () => {
      const newSettings = await apiRequest<StoreSettings>('/settings', 'PUT', settings);
      setAppState(prev => ({ ...prev, storeSettings: newSettings }));
  });

  return (
    <AppContext.Provider value={{ 
        ...appState, user, cart, isLoading, isSubmitting, error, apiError, successfulOrder,
        addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal,
        login, logout, registerUser, placeOrder, clearSuccessfulOrder,
        addProduct, updateProduct, deleteProduct, addReview,
        updateOrderStatus, cancelOrder,
        addCategory, updateCategory, deleteCategory,
        addBrand, updateBrand, deleteBrand,
        updateStoreSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext phải được sử dụng bên trong AppProvider');
  }
  return context;
};