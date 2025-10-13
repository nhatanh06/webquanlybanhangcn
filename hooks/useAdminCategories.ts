// hooks/useAdminCategories.ts
// FIX: Import React to resolve 'Cannot find namespace React' error.
import React, { useCallback } from 'react';
import { Category } from '../types';
import { apiRequest } from '../services/api';

interface UseAdminCategoriesProps {
    setAppState: React.Dispatch<React.SetStateAction<any>>;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useAdminCategories = ({ setAppState, setIsSubmitting, setError }: UseAdminCategoriesProps) => {

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

    const addCategory = (categoryData: Omit<Category, 'id'>) => runAdminAsync(async () => {
        const newCategory = await apiRequest<Category>('/categories', 'POST', categoryData);
        setAppState(prev => ({ ...prev, categories: [newCategory, ...prev.categories].sort((a,b) => a.name.localeCompare(b.name)) }));
    });

    const updateCategory = (updatedCategory: Category) => runAdminAsync(async () => {
        const newCategory = await apiRequest<Category>(`/categories/${updatedCategory.id}`, 'PUT', updatedCategory);
        setAppState(prev => ({ ...prev, categories: prev.categories.map(c => c.id === newCategory.id ? newCategory : c) }));
    });
    
    const deleteCategory = (categoryId: string) => runAdminAsync(async () => {
        await apiRequest(`/categories/${categoryId}`, 'DELETE');
        setAppState(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== categoryId) }));
    });

    return { addCategory, updateCategory, deleteCategory };
};