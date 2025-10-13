// hooks/useAdminBrands.ts
// FIX: Import React to resolve 'Cannot find namespace React' error.
import React, { useCallback } from 'react';
import { Brand } from '../types';
import { apiRequest } from '../services/api';

interface UseAdminBrandsProps {
    setAppState: React.Dispatch<React.SetStateAction<any>>;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useAdminBrands = ({ setAppState, setIsSubmitting, setError }: UseAdminBrandsProps) => {
    
    const runAdminAsync = useCallback(async (asyncFunc: () => Promise<any>) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await asyncFunc();
        } catch (e: any) {
            const errorMessage = e.message || 'Có lỗi không xác định xảy ra.';
            setError(errorMessage);
            // Ném lỗi lại để component gọi có thể xử lý
            throw e;
        } finally {
            setIsSubmitting(false);
        }
    }, [setIsSubmitting, setError]);
    
    const addBrand = (brandData: Omit<Brand, 'id'>) => runAdminAsync(async () => {
        const newBrand = await apiRequest<Brand>('/brands', 'POST', brandData);
        setAppState(prev => ({ ...prev, brands: [newBrand, ...prev.brands].sort((a,b) => a.name.localeCompare(b.name)) }));
    });

    const updateBrand = (updatedBrand: Brand) => runAdminAsync(async () => {
        const newBrand = await apiRequest<Brand>(`/brands/${updatedBrand.id}`, 'PUT', updatedBrand);
        setAppState(prev => ({ ...prev, brands: prev.brands.map(b => b.id === newBrand.id ? newBrand : b) }));
    });

    const deleteBrand = (brandId: string) => runAdminAsync(async () => {
        await apiRequest(`/brands/${brandId}`, 'DELETE');
        setAppState(prev => ({ ...prev, brands: prev.brands.filter(b => b.id !== brandId) }));
    });

    return { addBrand, updateBrand, deleteBrand };
};