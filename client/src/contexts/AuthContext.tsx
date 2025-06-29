import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useTheme } from '@/components/theme-provider';
import { apiEndpoint } from '@/config/api';

interface User {
  _id: string;
  id: string; // Add id for Supabase compatibility
  email: string;
  name: string;
  role: string;
  status: string;
  company?: string;
  phone?: string;
  preferences: {
    theme: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
  error: string | null;
  apiRequest: (url: string, options?: RequestInit) => Promise<Response>;
  retryApiRequest: (url: string, options?: RequestInit, maxRetries?: number) => Promise<Response>;
  isRefreshing: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  isAdmin: false,
  error: null,
  apiRequest: async () => new Response(),
  retryApiRequest: async () => new Response(),
  isRefreshing: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Remove hardcoded API_URL - we'll use apiEndpoint helper instead

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { setTheme } = useTheme();

  // Track failed requests for retry
  const [failedRequests, setFailedRequests] = useState<Array<{ url: string, options: RequestInit, resolve: Function, reject: Function }>>([]);

  // Enhanced token management with expiration tracking
  const getAccessToken = () => localStorage.getItem('accessToken');
  const getRefreshToken = () => localStorage.getItem('refreshToken');
  const getTokenExpiry = () => localStorage.getItem('tokenExpiry');
  
  const setTokens = (accessToken: string, refreshToken: string, expiresIn = 3600) => {
    const expiryTime = Date.now() + (expiresIn * 1000) - (5 * 60 * 1000); // Refresh 5 minutes before expiry
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('tokenExpiry', expiryTime.toString());
  };
  
  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
  };
  
  const isTokenNearExpiry = () => {
    const expiry = getTokenExpiry();
    if (!expiry) return false;
    return Date.now() >= parseInt(expiry);
  };
  
  // Proactive token refresh
  const refreshTokenProactively = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken || isRefreshing) return false;
    
    setIsRefreshing(true);
    try {
      const refreshResponse = await fetch(apiEndpoint('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const { accessToken: newAccessToken, expiresIn } = await refreshResponse.json();
        setTokens(newAccessToken, refreshToken, expiresIn);
        setIsRefreshing(false);
        return true;
      }
    } catch (error) {
      console.warn('Proactive token refresh failed:', error);
    }
    
    setIsRefreshing(false);
    return false;
  }, [isRefreshing]);

  // Enhanced API request helper with aggressive session persistence
  const apiRequest = async (url: string, options: RequestInit = {}, retryCount = 0): Promise<Response> => {
    const maxRetries = 3;
    
    // Check if token needs proactive refresh
    if (isTokenNearExpiry() && getRefreshToken()) {
      await refreshTokenProactively();
    }
    
    let accessToken = getAccessToken();
    
    const makeRequest = async (token: string | null) => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      return fetch(apiEndpoint(url), {
        ...options,
        headers,
      });
    };

    let response = await makeRequest(accessToken);

    // Enhanced token refresh with better retry logic
    if (response.status === 401 && accessToken && !isRefreshing) {
      const refreshToken = getRefreshToken();
      
      if (refreshToken) {
        setIsRefreshing(true);
        try {
          const refreshResponse = await fetch(apiEndpoint('/auth/refresh'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const { accessToken: newAccessToken, expiresIn } = await refreshResponse.json();
            setTokens(newAccessToken, refreshToken, expiresIn);
            setIsRefreshing(false);
            
            // Retry original request with new token
            response = await makeRequest(newAccessToken);
            
            // Process any failed requests that were queued
            if (failedRequests.length > 0) {
              const requests = [...failedRequests];
              setFailedRequests([]);
              
              requests.forEach(async ({ url: reqUrl, options: reqOptions, resolve, reject }) => {
                try {
                  const retryResponse = await apiRequest(reqUrl, reqOptions);
                  resolve(retryResponse);
                } catch (err) {
                  reject(err);
                }
              });
            }
          } else {
            setIsRefreshing(false);
            // Try one more time with a delay before giving up
            if (retryCount < 2) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              return apiRequest(url, options, retryCount + 1);
            }
            clearTokens();
            setUser(null);
            setError('Session expired. Please sign in again.');
          }
        } catch (error) {
          setIsRefreshing(false);
          // Network error during refresh - try again after delay
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
            return apiRequest(url, options, retryCount + 1);
          }
          clearTokens();
          setUser(null);
          setError('Connection error. Please check your network and try again.');
        }
      } else {
        // No refresh token, but maybe we can still retry the request
        if (retryCount < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return apiRequest(url, options, retryCount + 1);
        }
        clearTokens();
        setUser(null);
        setError('Authentication required. Please sign in.');
      }
    }
    
    // Queue failed requests during refresh
    if (response.status === 401 && isRefreshing) {
      return new Promise((resolve, reject) => {
        setFailedRequests(prev => [...prev, { url, options, resolve, reject }]);
      });
    }
    
    // Network errors - retry with exponential backoff
    if (!response.ok && response.status >= 500 && retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      return apiRequest(url, options, retryCount + 1);
    }

    // If authorization error (403), sign out user
    if (response.status === 403) {
      clearTokens();
      setUser(null);
      setError('Access denied. You have been signed out.');
    }

    return response;
  };

  const fetchProfile = useCallback(async () => {
    try {
      const response = await apiRequest('/auth/me');
      
      if (response.ok) {
        const data = await response.json();
        const userData = data.user;
        
        // Add id field for Supabase compatibility - use your existing Supabase user ID for all operations
        userData.id = 'b749cf77-02d6-4a74-b210-cce3d19f0910';
        
        setUser(userData);
        setError(null);
        
        // Apply theme safely
        try {
          if (userData.preferences?.theme) {
            setTheme(userData.preferences.theme as 'light' | 'dark' | 'system');
          }
        } catch (error) {
          console.warn('Failed to update theme:', error);
          // Continue without breaking authentication
        }
        
        return userData;
      } else {
        // If unauthorized, clear everything
        if (response.status === 401) {
          clearTokens();
          setUser(null);
        }
        return null;
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to fetch user profile');
      return null;
    }
  }, [setTheme]);

  const refreshProfile = useCallback(async () => {
    if (getAccessToken()) {
      await fetchProfile();
    }
  }, [fetchProfile]);

  // Enhanced session management with heartbeat
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = getAccessToken();
      
      if (accessToken) {
        await fetchProfile();
      }
      
      setLoading(false);
    };

    initAuth();

    // Set up periodic session validation and proactive token refresh (every 2 minutes)
    const sessionCheck = setInterval(async () => {
      const accessToken = getAccessToken();
      if (accessToken && user) {
        try {
          // Check if token needs refresh
          if (isTokenNearExpiry()) {
            await refreshTokenProactively();
          }
          // Silent profile refresh to validate session
          await fetchProfile();
        } catch (error) {
          console.warn('Session validation failed:', error);
        }
      }
    }, 2 * 60 * 1000);

    // Set up visibility change handler to refresh on tab focus
    const handleVisibilityChange = () => {
      if (!document.hidden && getAccessToken() && user) {
        // Refresh profile when user returns to tab
        fetchProfile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(sessionCheck);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchProfile, user]);

  const signOut = async () => {
    try {
      const refreshToken = getRefreshToken();
      
      if (refreshToken) {
        // Notify server about logout
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of server response
      clearTokens();
      setUser(null);
      setError(null);
    }
  };

  const isAdmin = user?.role === 'admin';

  // Add retry mechanism for API requests
  const retryApiRequest = useCallback(async (url: string, options: RequestInit = {}, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await apiRequest(url, options);
        if (response.ok) {
          return response;
        }
        // If not the last retry and it's a server error, wait and retry
        if (i < maxRetries - 1 && response.status >= 500) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
          continue;
        }
        return response;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
    throw new Error('Max retries exceeded');
  }, []);

  const value = {
    user,
    loading,
    signOut,
    refreshProfile,
    isAdmin,
    error,
    apiRequest,
    retryApiRequest,
    isRefreshing,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
