import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/components/theme-provider';

interface Profile {
  id: string;
  name: string | null;
  role: string;
  theme: string;
  email_notifications: boolean;
  push_notifications: boolean;
  created_at: string;
  updated_at: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setTheme } = useTheme();
  const setThemeRef = useRef(setTheme);

  // Update the ref when setTheme changes
  useEffect(() => {
    setThemeRef.current = setTheme;
  }, [setTheme]);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      // Silent profile fetching - no console logging
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role, theme, email_notifications, push_notifications, created_at, updated_at, status')
        .eq('id', userId)
        .single();

      if (error) {
        // Silent error handling - no console logging
        
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          // Profile not found, creating new profile silently
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: userId,
                name: user?.user_metadata?.name || user?.email,
                role: 'user',
                theme: 'light',
                email_notifications: true,
                push_notifications: true,
              }
            ])
            .select()
            .single();

          if (createError) {
            // Silent error handling - no console logging
            setError('Failed to create user profile');
            return null;
          }

          // Profile created successfully - no logging
          return newProfile;
        }
        
        setError('Failed to fetch user profile');
        return null;
      }

      // Profile fetched successfully - no logging
      setError(null);
      
      // Apply theme immediately using the ref
      if (data.theme) {
        setThemeRef.current(data.theme as 'light' | 'dark' | 'system');
      }

      // Check if user is active
      if (data.status === 'pending') {
        throw new Error('Your account is pending admin approval. Please wait for approval before signing in.');
      }
      
      return {
        ...data,
        status: data.status || 'active'
      };
    } catch (error) {
      // Silent error handling - no console logging
      setError('Unexpected error occurred');
      return null;
    }
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  }, [user, fetchProfile]);

  const cleanupAuthState = useCallback(() => {
    try {
      localStorage.removeItem('supabase.auth.token');
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      // Silent error handling - no console logging
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Silent auth state changes - no console logging
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile with delay to ensure user is fully authenticated
          setTimeout(async () => {
            if (mounted) {
              const profileData = await fetchProfile(session.user.id);
              setProfile(profileData);
              setLoading(false);
            }
          }, 100);
        } else {
          setProfile(null);
          setError(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          // Silent error handling - no console logging
          setError('Session validation failed');
          setLoading(false);
          return;
        }

        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
        
        setLoading(false);
      } catch (error) {
        // Silent error handling - no console logging
        if (mounted) {
          setError('Failed to validate session');
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Remove setTheme dependency

  const signOut = async () => {
    try {
      // Signing out user silently
      
      // Clean up local storage first
      cleanupAuthState();

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        // Silent error handling - still redirect on sign out error
      }
      
      // Reset state
      setUser(null);
      setSession(null);
      setProfile(null);
      setError(null);
      
      // Force redirect
      window.location.href = '/auth';
    } catch (error) {
      // Silent error handling - force redirect even on error
      window.location.href = '/auth';
    }
  };

  const isAdmin = profile?.role === 'admin';

  const value = {
    user,
    session,
    profile,
    loading,
    signOut,
    refreshProfile,
    isAdmin,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
