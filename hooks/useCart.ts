// hooks/useCart.ts
// FIX: Import React to resolve 'Cannot find namespace React' error.
import React, { useCallback } from 'react';
import { Product, CartItem } from '../types';

interface UseCartProps {
    cart: CartItem[];
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

export const useCart = ({ cart, setCart }: UseCartProps) => {
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
    
    const getCartTotal = useCallback(() => {
        return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
    }, [cart]);

    return {
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
    };
};