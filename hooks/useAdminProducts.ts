// hooks/useAdminProducts.ts
// FIX: Import React to resolve 'Cannot find namespace React' error.
import React, { useCallback } from 'react';
import { Product, Review } from '../types';
import { apiRequest } from '../services/api';

interface UseAdminProductsProps {
    setAppState: React.Dispatch<React.SetStateAction<any>>;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useAdminProducts = ({ setAppState, setIsSubmitting, setError }: UseAdminProductsProps) => {
    
    const runAdminAsync = useCallback(async (asyncFunc: () => Promise<any>) => {
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
    
    const addProduct = (productData: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'reviews'>) => runAdminAsync(async () => {
        const newProduct = await apiRequest<Product>('/products', 'POST', productData);
        setAppState(prev => ({ ...prev, products: [newProduct, ...prev.products] }));
    });

    const updateProduct = (updatedProduct: Product) => runAdminAsync(async () => {
        const newProduct = await apiRequest<Product>(`/products/${updatedProduct.id}`, 'PUT', updatedProduct);
        setAppState(prev => ({ ...prev, products: prev.products.map(p => p.id === newProduct.id ? newProduct : p) }));
    });

    const deleteProduct = (productId: string) => runAdminAsync(async () => {
        await apiRequest(`/products/${productId}`, 'DELETE');
        setAppState(prev => ({ ...prev, products: prev.products.filter(p => p.id !== productId) }));
    });

    const addReview = (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => runAdminAsync(async () => {
        const updatedProduct = await apiRequest<Product>(`/products/${productId}/reviews`, 'POST', reviewData);
        setAppState(prev => ({ ...prev, products: prev.products.map(p => p.id === updatedProduct.id ? updatedProduct : p) }));
    });

    return { addProduct, updateProduct, deleteProduct, addReview };
};