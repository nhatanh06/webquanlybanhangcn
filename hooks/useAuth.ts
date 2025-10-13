// hooks/useAuth.ts
// FIX: Import React to resolve 'Cannot find namespace React' error.
import React, { useCallback } from 'react';
import { User, CartItem } from '../types';
import { apiRequest } from '../services/api';

interface UseAuthProps {
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
    setWelcomeMessage: React.Dispatch<React.SetStateAction<string>>;
}

export const useAuth = ({ setUser, setCart, setIsSubmitting, setWelcomeMessage }: UseAuthProps) => {
    const login = async (email: string, password: string) => {
        try {
            setIsSubmitting(true);
            const loggedInUser = await apiRequest<User>('/login', 'POST', { email, password });
            setUser(loggedInUser);
            if (loggedInUser.role === 'customer') {
                setWelcomeMessage(`Chào mừng ${loggedInUser.name} đã đến với AKStore!`);
            }
            return true;
        } catch (e) {
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const logout = useCallback(() => {
        setUser(null);
        setCart([]); // Xóa giỏ hàng khi đăng xuất
    }, [setUser, setCart]);
  
    const registerUser = async (userData: any) => {
        try {
            setIsSubmitting(true);
            const newUser = await apiRequest<User>('/register', 'POST', userData);
            setUser(newUser);
            if (newUser.role === 'customer') {
                setWelcomeMessage(`Chào mừng ${newUser.name} đã đến với AKStore!`);
            }
            return { success: true };
        } catch (e: any) {
            return { success: false, message: e.message };
        } finally {
            setIsSubmitting(false);
        }
    };

    return { login, logout, registerUser };
};