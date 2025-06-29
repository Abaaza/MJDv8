import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useEnhancedApi = () => {
  const { apiRequest, retryApiRequest, isRefreshing } = useAuth();

  const makeApiCall = useCallback(async (
    url: string, 
    options: RequestInit = {},
    showToastOnError = true,
    maxRetries = 3
  ) => {
    try {
      const response = await retryApiRequest(url, options, maxRetries);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        
        if (showToastOnError) {
          toast.error(`Request failed: ${errorMessage}`);
        }
        
        throw new Error(errorMessage);
      }
      
      return response;
    } catch (error) {
      if (showToastOnError && error instanceof Error) {
        toast.error(`Network error: ${error.message}`);
      }
      throw error;
    }
  }, [retryApiRequest]);

  const get = useCallback((url: string, showToastOnError = true, maxRetries = 3) => 
    makeApiCall(url, { method: 'GET' }, showToastOnError, maxRetries), 
    [makeApiCall]
  );

  const post = useCallback((url: string, data?: any, showToastOnError = true, maxRetries = 3) => 
    makeApiCall(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, showToastOnError, maxRetries), 
    [makeApiCall]
  );

  const put = useCallback((url: string, data?: any, showToastOnError = true, maxRetries = 3) => 
    makeApiCall(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, showToastOnError, maxRetries), 
    [makeApiCall]
  );

  const del = useCallback((url: string, showToastOnError = true, maxRetries = 3) => 
    makeApiCall(url, { method: 'DELETE' }, showToastOnError, maxRetries), 
    [makeApiCall]
  );

  // Silent API calls for background operations
  const silentGet = useCallback((url: string) => 
    makeApiCall(url, { method: 'GET' }, false, 1), 
    [makeApiCall]
  );

  return {
    get,
    post,
    put,
    delete: del,
    silentGet,
    makeApiCall,
    isRefreshing,
  };
};