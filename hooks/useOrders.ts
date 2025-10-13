// hooks/useOrders.ts
// FIX: Import React to resolve 'Cannot find namespace React' error.
import React, { useCallback } from 'react';
import { Order, OrderStatus, CartItem, User } from '../types';
import { apiRequest } from '../services/api';

interface UseOrdersProps {
    cart: CartItem[];
    user: User | null;
    getCartTotal: () => number;
    clearCart: () => void;
    setAppState: React.Dispatch<React.SetStateAction<any>>;
    setSuccessfulOrder: React.Dispatch<React.SetStateAction<Order | null>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useOrders = ({
    cart, user, getCartTotal, clearCart, setAppState, setSuccessfulOrder, setError, setIsSubmitting
}: UseOrdersProps) => {

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

    const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
        setIsSubmitting(true);
        try {
            await apiRequest(`/orders/${orderId}/status`, 'PUT', { status });
            setAppState(prev => ({ ...prev, orders: prev.orders.map(o => o.id === orderId ? { ...o, status } : o) }));
        } catch (e: any) {
            setError(e.message);
            alert(`Lỗi: ${e.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }, [setAppState, setError, setIsSubmitting]);
  
    const cancelOrder = useCallback((orderId: string) => {
        return updateOrderStatus(orderId, OrderStatus.Cancelled);
    }, [updateOrderStatus]);

    return { placeOrder, updateOrderStatus, cancelOrder };
};