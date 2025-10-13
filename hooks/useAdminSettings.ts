// hooks/useAdminSettings.ts
// FIX: Import React to resolve 'Cannot find namespace React' error.
import React, { useCallback } from 'react';
import { StoreSettings } from '../types';
import { apiRequest } from '../services/api';

interface UseAdminSettingsProps {
    setAppState: React.Dispatch<React.SetStateAction<any>>;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
    setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useAdminSettings = ({ setAppState, setIsSubmitting, setError }: UseAdminSettingsProps) => {

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

    const updateStoreSettings = (settings: StoreSettings) => runAdminAsync(async () => {
        const newSettings = await apiRequest<StoreSettings>('/settings', 'PUT', settings);
        setAppState(prev => ({ ...prev, storeSettings: newSettings }));
    });

    return { updateStoreSettings };
};