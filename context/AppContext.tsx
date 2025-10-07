import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { Product, CartItem, Order, User, OrderStatus, Category, Brand, StoreSettings, Review } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BRANDS, INITIAL_USERS, INITIAL_STORE_SETTINGS } from '../constants';

// Kiểu dữ liệu cho trạng thái của ứng dụng
interface AppState {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  orders: Order[];
  users: User[];
  storeSettings: StoreSettings;
}

// Kiểu dữ liệu cho context
interface AppContextType extends AppState {
  user: User | null;
  cart: CartItem[];
  addToCart: (product: Product, quantity: number, selectedOptions: { [key: string]: string }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  placeOrder: (customerInfo: { name: string; phone: string; address: string; paymentMethod: 'COD' | 'Bank Transfer' | 'Momo' }) => Order | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  // FIX: Added optional password property to registerUser to match usage in RegisterPage.tsx
  registerUser: (userData: Omit<User, 'id' | 'role' | 'addresses'> & { password?: string; address?: string }) => { success: boolean; message?: string };
  addProduct: (product: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'reviews'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  addReview: (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => void;
  cancelOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  addBrand: (brand: Omit<Brand, 'id'>) => void;
  updateBrand: (brand: Brand) => void;
  deleteBrand: (brandId: string) => void;
  updateStoreSettings: (settings: StoreSettings) => void;
  commitChanges: () => void; // For manual save button
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getInitialState = (): AppState => {
  try {
    const savedState = localStorage.getItem('akstore_app_state');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      // Đảm bảo tất cả các trường đều tồn tại để tránh lỗi
      return {
        products: parsedState.products || INITIAL_PRODUCTS,
        categories: parsedState.categories || INITIAL_CATEGORIES,
        brands: parsedState.brands || INITIAL_BRANDS,
        orders: parsedState.orders || [],
        users: parsedState.users || INITIAL_USERS,
        storeSettings: parsedState.storeSettings || INITIAL_STORE_SETTINGS,
      };
    }
  } catch (e) {
    console.error("Lỗi khi tải trạng thái từ localStorage", e);
  }
  return {
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    brands: INITIAL_BRANDS,
    orders: [],
    users: INITIAL_USERS,
    storeSettings: INITIAL_STORE_SETTINGS,
  };
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [appState, setAppState] = useState<AppState>(getInitialState);
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

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('akstore_app_state', JSON.stringify(appState));
    } catch (e) { console.error("Lỗi khi lưu trạng thái vào localStorage", e); }
  }, [appState]);

  useEffect(() => {
    try {
      localStorage.setItem('akstore_user', JSON.stringify(user));
    } catch (e) { console.error("Lỗi khi lưu người dùng vào localStorage", e); }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('akstore_cart', JSON.stringify(cart));
    } catch (e) { console.error("Lỗi khi lưu giỏ hàng vào localStorage", e); }
  }, [cart]);

  // --- Cart Actions ---
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

  // --- Auth & Order ---
  const login = (email: string, password: string) => {
    const foundUser = appState.users.find(u => u.email === email);
    // Lưu ý: trong thực tế không bao giờ lưu mật khẩu dạng plain text
    const passwordsMatch = (email === 'admin@example.com' && password === '1') || (email === 'user@example.com' && password === '1');
    if (foundUser && passwordsMatch) {
      setUser(foundUser);
      return true;
    }
    return false;
  };
  const logout = useCallback(() => { setUser(null); setCart([]); }, []);
  
  // FIX: Added optional password property to registerUser to match usage in RegisterPage.tsx
  const registerUser = (userData: Omit<User, 'id' | 'role' | 'addresses'> & { password?: string; address?: string }) => {
    if (appState.users.some(u => u.email === userData.email)) {
      return { success: false, message: 'Email này đã tồn tại.' };
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      addresses: userData.address ? [userData.address] : [],
      role: 'customer',
    };
    setAppState(prev => ({ ...prev, users: [...prev.users, newUser] }));
    setUser(newUser);
    return { success: true };
  };

  const placeOrder = (customerInfo: { name: string; phone: string; address: string; paymentMethod: 'COD' | 'Bank Transfer' | 'Momo' }) => {
    if (cart.length === 0) return null;
    const newOrder: Order = {
      id: `ORDER-${Date.now()}`,
      customerName: customerInfo.name,
      phone: customerInfo.phone,
      address: customerInfo.address,
      items: cart,
      total: getCartTotal(),
      status: OrderStatus.Pending,
      orderDate: new Date().toISOString(),
      paymentMethod: customerInfo.paymentMethod,
    };
    setAppState(prev => ({ ...prev, orders: [newOrder, ...prev.orders] }));
    clearCart();
    return newOrder;
  };

  // --- Admin Actions ---
  const addProduct = (productData: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'reviews'>) => {
    const newProduct: Product = {
      ...productData,
      id: `${productData.name.toLowerCase().replace(/ /g, '-')}-${Date.now()}`,
      rating: 0,
      reviewCount: 0,
      reviews: [],
    };
    setAppState(prev => ({ ...prev, products: [newProduct, ...prev.products] }));
  };

  const updateProduct = (updatedProduct: Product) => {
    setAppState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    }));
  };

  const deleteProduct = (productId: string) => {
      setAppState(prev => ({
          ...prev,
          products: prev.products.filter(p => p.id !== productId)
      }));
  };

  const addReview = (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
      setAppState(prev => {
          const newProducts = prev.products.map(p => {
              if (p.id === productId) {
                  const newReview: Review = {
                      ...reviewData,
                      id: Date.now(),
                      date: new Date().toISOString(),
                  };
                  const updatedReviews = [newReview, ...p.reviews];
                  const newReviewCount = updatedReviews.length;
                  const newTotalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
                  const newAverageRating = parseFloat((newTotalRating / newReviewCount).toFixed(1));

                  return { ...p, reviews: updatedReviews, rating: newAverageRating, reviewCount: newReviewCount };
              }
              return p;
          });
          return { ...prev, products: newProducts };
      });
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setAppState(prev => ({
      ...prev,
      orders: prev.orders.map(o => o.id === orderId ? { ...o, status } : o)
    }));
  };
  
  const cancelOrder = (orderId: string) => updateOrderStatus(orderId, OrderStatus.Cancelled);

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory = { ...categoryData, id: `${categoryData.name.toLowerCase().replace(/ /g, '-')}-${Date.now()}` };
    setAppState(prev => ({ ...prev, categories: [newCategory, ...prev.categories] }));
  };
  const updateCategory = (updatedCategory: Category) => {
    setAppState(prev => ({ ...prev, categories: prev.categories.map(c => c.id === updatedCategory.id ? updatedCategory : c) }));
  };
  const deleteCategory = (categoryId: string) => {
    const categoryInUse = appState.products.some(p => p.category === appState.categories.find(c => c.id === categoryId)?.name);
    if (categoryInUse) {
      throw new Error("Không thể xóa danh mục vì vẫn còn sản phẩm đang sử dụng.");
    }
    setAppState(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== categoryId) }));
  };

  const addBrand = (brandData: Omit<Brand, 'id'>) => {
    const newBrand = { ...brandData, id: `${brandData.name.toLowerCase().replace(/ /g, '-')}-${Date.now()}` };
    setAppState(prev => ({ ...prev, brands: [newBrand, ...prev.brands] }));
  };
  const updateBrand = (updatedBrand: Brand) => {
    setAppState(prev => ({ ...prev, brands: prev.brands.map(b => b.id === updatedBrand.id ? updatedBrand : b) }));
  };
  const deleteBrand = (brandId: string) => {
    const brandInUse = appState.products.some(p => p.brand === appState.brands.find(b => b.id === brandId)?.name);
    if (brandInUse) {
      throw new Error("Không thể xóa thương hiệu vì vẫn còn sản phẩm đang sử dụng.");
    }
    setAppState(prev => ({ ...prev, brands: prev.brands.filter(b => b.id !== brandId) }));
  };
  
  const updateStoreSettings = (settings: StoreSettings) => {
    setAppState(prev => ({ ...prev, storeSettings: settings }));
  };

  const commitChanges = () => {
    // This function is for UI feedback only, as saving is automatic via useEffect
    console.log("Thay đổi đã được lưu tự động.");
  };

  return (
    <AppContext.Provider value={{ 
        ...appState, user, cart,
        addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal,
        login, logout, registerUser, placeOrder,
        addProduct, updateProduct, deleteProduct, addReview,
        updateOrderStatus, cancelOrder,
        addCategory, updateCategory, deleteCategory,
        addBrand, updateBrand, deleteBrand,
        updateStoreSettings, commitChanges
    }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext phải được sử dụng bên trong AppProvider');
  }
  // Simulate the structure of the full-stack context to minimize component changes
  return {
    ...context,
    isLoading: false,
    isSubmitting: false,
    error: null,
  };
};
