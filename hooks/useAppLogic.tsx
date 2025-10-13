// hooks/useAppLogic.tsx
// FIX: Import React to resolve 'Cannot find namespace React' error.
import React, { useCallback } from 'react';
import { Product, CartItem, Order, User, OrderStatus, Category, Brand, StoreSettings, Review } from '../types';
import { apiRequest } from '../services/api';

// Định nghĩa kiểu cho các đối số mà hook này nhận vào
interface UseAppLogicProps {
    appState: any;
    setAppState: React.Dispatch<React.SetStateAction<any>>;
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    cart: CartItem[];
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
    setSuccessfulOrder: React.Dispatch<React.SetStateAction<Order | null>>;
    setWelcomeMessage: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * Custom Hook chứa tất cả các hàm logic và xử lý nghiệp vụ của ứng dụng.
 * @param props - State và các hàm setState từ AppProvider.
 * @returns Một object chứa tất cả các hàm có thể được gọi từ khắp ứng dụng.
 */
export const useAppLogic = ({
    appState, setAppState, user, setUser, cart, setCart, 
    setError, setIsSubmitting, setSuccessfulOrder, setWelcomeMessage
}: UseAppLogicProps) => {

    const runAsync = useCallback(async (asyncFunc: () => Promise<any>) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await asyncFunc();
        } catch (e: any) {
            const errorMessage = e.message || 'Có lỗi không xác định xảy ra.';
            setError(errorMessage);
            alert(`Lỗi: ${errorMessage}`);
        } finally {
            setIsSubmitting(false);
        }
    }, [setIsSubmitting, setError]);

    const addToCart = useCallback((product: Product, quantity: number, selectedOptions: { [key: string]: string }) => {
        setCart(prevCart => {
            const existingItemIndex = prevCart.findIndex(item => 
                item.product.id === product.id && JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
            );
            if (existingItemIndex > -1) {
                const newCart = [...prevCart];
                newCart[existingItemIndex].quantity += quantity;
                return newCart;
            }
            return [...prevCart, { product, quantity, selectedOptions }];
        });
    }, [setCart]);
  
    const removeFromCart = useCallback((productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    }, [setCart]);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        setCart(prev => prev.map(item => item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item));
    }, [setCart]);

    const clearCart = useCallback(() => setCart([]), [setCart]);
    
    const getCartTotal = useCallback(() => cart.reduce((total, item) => total + item.product.price * item.quantity, 0), [cart]);
    
    const clearSuccessfulOrder = useCallback(() => setSuccessfulOrder(null), [setSuccessfulOrder]);

    const clearWelcomeMessage = useCallback(() => setWelcomeMessage(''), [setWelcomeMessage]);

    const login = async (email: string, password: string) => {
        try {
            setIsSubmitting(true);
            const loggedInUser = await apiRequest<User>('/login', 'POST', { email, password });
            setUser(loggedInUser);
            if (loggedInUser.role === 'customer') {
                setWelcomeMessage(`Chào mừng ${loggedInUser.name} đã đến với AKStore!`);
            }
            setIsSubmitting(false);
            return true;
        } catch (e) {
            setIsSubmitting(false);
            return false;
        }
    };

    const logout = useCallback(() => {
        setUser(null);
        setCart([]);
    }, [setUser, setCart]);
  
    const registerUser = async (userData: any) => {
        try {
            setIsSubmitting(true);
            const newUser = await apiRequest<User>('/register', 'POST', userData);
            setUser(newUser);
            if (newUser.role === 'customer') {
                setWelcomeMessage(`Chào mừng ${newUser.name} đã đến với AKStore!`);
            }
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
            setAppState(prev => ({ ...prev, orders: [newOrder, ...prev.orders] }));
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
    const addProduct = (productData: any) => runAsync(async () => {
        const newProduct = await apiRequest<Product>('/products', 'POST', productData);
        setAppState(prev => ({ ...prev, products: [newProduct, ...prev.products] }));
    });

    const updateProduct = (updatedProduct: Product) => runAsync(async () => {
        const newProduct = await apiRequest<Product>(`/products/${updatedProduct.id}`, 'PUT', updatedProduct);
        setAppState(prev => ({ ...prev, products: prev.products.map(p => p.id === newProduct.id ? newProduct : p) }));
    });

    const deleteProduct = (productId: string) => runAsync(async () => {
        await apiRequest(`/products/${productId}`, 'DELETE');
        setAppState(prev => ({ ...prev, products: prev.products.filter(p => p.id !== productId) }));
    });

    const addReview = (productId: string, reviewData: any) => runAsync(async () => {
        const updatedProduct = await apiRequest<Product>(`/products/${productId}/reviews`, 'POST', reviewData);
        setAppState(prev => ({ ...prev, products: prev.products.map(p => p.id === updatedProduct.id ? updatedProduct : p) }));
    });

    const updateOrderStatus = (orderId: string, status: OrderStatus) => runAsync(async () => {
        await apiRequest(`/orders/${orderId}/status`, 'PUT', { status });
        setAppState(prev => ({ ...prev, orders: prev.orders.map(o => o.id === orderId ? { ...o, status } : o) }));
    });
  
    const cancelOrder = (orderId: string) => updateOrderStatus(orderId, OrderStatus.Cancelled);

    const addCategory = (categoryData: any) => runAsync(async () => {
        const newCategory = await apiRequest<Category>('/categories', 'POST', categoryData);
        setAppState(prev => ({ ...prev, categories: [newCategory, ...prev.categories] }));
    });

    const updateCategory = (updatedCategory: Category) => runAsync(async () => {
        const newCategory = await apiRequest<Category>(`/categories/${updatedCategory.id}`, 'PUT', updatedCategory);
        setAppState(prev => ({ ...prev, categories: prev.categories.map(c => c.id === newCategory.id ? newCategory : c) }));
    });
    
    const deleteCategory = async (categoryId: string) => {
        await apiRequest(`/categories/${categoryId}`, 'DELETE');
        setAppState(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== categoryId) }));
    };

    const addBrand = (brandData: any) => runAsync(async () => {
        const newBrand = await apiRequest<Brand>('/brands', 'POST', brandData);
        setAppState(prev => ({ ...prev, brands: [newBrand, ...prev.brands] }));
    });

    const updateBrand = (updatedBrand: Brand) => runAsync(async () => {
        const newBrand = await apiRequest<Brand>(`/brands/${updatedBrand.id}`, 'PUT', updatedBrand);
        setAppState(prev => ({ ...prev, brands: prev.brands.map(b => b.id === newBrand.id ? newBrand : b) }));
    });

    const deleteBrand = async (brandId: string) => {
        await apiRequest(`/brands/${brandId}`, 'DELETE');
        setAppState(prev => ({ ...prev, brands: prev.brands.filter(b => b.id !== brandId) }));
    };
  
    const updateStoreSettings = (settings: StoreSettings) => runAsync(async () => {
        const newSettings = await apiRequest<StoreSettings>('/settings', 'PUT', settings);
        setAppState(prev => ({ ...prev, storeSettings: newSettings }));
    });

    // Trả về tất cả các hàm để AppProvider có thể cung cấp chúng
    return {
        addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal,
        login, logout, registerUser, placeOrder, clearSuccessfulOrder,
        addProduct, updateProduct, deleteProduct, addReview,
        updateOrderStatus, cancelOrder,
        addCategory, updateCategory, deleteCategory,
        addBrand, updateBrand, deleteBrand,
        updateStoreSettings,
        clearWelcomeMessage,
    };
};