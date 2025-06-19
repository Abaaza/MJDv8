import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  name: string | null;
  role: string;
  theme: string;
  email_notifications: boolean;
  push_notifications: boolean;
  created_at: string;
  updated_at: string;
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

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, role, theme, email_notifications, push_notifications, created_at, updated_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating new profile...');
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
            console.error('Error creating profile:', createError);
            setError('Failed to create user profile');
            return null;
          }

          console.log('Profile created successfully:', newProfile);
          return newProfile;
        }
        
        setError('Failed to fetch user profile');
        return null;
      }

      console.log('Profile fetched successfully:', data);
      setError(null);
      return data;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      setError('Unexpected error occurred');
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  const cleanupAuthState = () => {
    try {
      localStorage.removeItem('supabase.auth.token');
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error cleaning up auth state:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
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
          console.error('Session check error:', error);
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
        console.error('Unexpected session check error:', error);
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
  }, []);

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      
      // Clean up local storage first
      cleanupAuthState();

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Sign out error:', error);
        // Don't throw error, still redirect
      }
      
      // Reset state
      setUser(null);
      setSession(null);
      setProfile(null);
      setError(null);
      
      // Force redirect
      window.location.href = '/auth';
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      // Force redirect even on error
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
