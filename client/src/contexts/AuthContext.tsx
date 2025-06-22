import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useTheme } from '@/components/theme-provider';

interface User {
  _id: string;
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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  isAdmin: false,
  error: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setTheme } = useTheme();

  // Get stored tokens
  const getAccessToken = () => localStorage.getItem('accessToken');
  const getRefreshToken = () => localStorage.getItem('refreshToken');
  const setTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };
  const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // API request helper with automatic token refresh
  const apiRequest = async (url: string, options: RequestInit = {}) => {
    let accessToken = getAccessToken();
    
    const makeRequest = async (token: string | null) => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      return fetch(`${API_URL}${url}`, {
        ...options,
        headers,
      });
    };

    let response = await makeRequest(accessToken);

    // If token expired, try to refresh
    if (response.status === 401 && accessToken) {
      const refreshToken = getRefreshToken();
      
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const { accessToken: newAccessToken } = await refreshResponse.json();
            setTokens(newAccessToken, refreshToken);
            
            // Retry original request with new token
            response = await makeRequest(newAccessToken);
          } else {
            // Refresh failed, clear tokens
            clearTokens();
            setUser(null);
          }
        } catch (error) {
          clearTokens();
          setUser(null);
        }
      }
    }

    return response;
  };

  const fetchProfile = useCallback(async () => {
    try {
      const response = await apiRequest('/auth/me');
      
      if (response.ok) {
        const data = await response.json();
        const userData = data.user;
        
        setUser(userData);
        setError(null);
        
        // Apply theme
        if (userData.preferences?.theme) {
          setTheme(userData.preferences.theme as 'light' | 'dark' | 'system');
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

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = getAccessToken();
      
      if (accessToken) {
        await fetchProfile();
      }
      
      setLoading(false);
    };

    initAuth();
  }, [fetchProfile]);

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

  const value = {
    user,
    loading,
    signOut,
    refreshProfile,
    isAdmin,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
