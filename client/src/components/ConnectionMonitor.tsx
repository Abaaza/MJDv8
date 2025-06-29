import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const ConnectionMonitor = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastOnline, setLastOnline] = useState(Date.now());
  const { user, refreshProfile } = useAuth();

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const offlineTime = Date.now() - lastOnline;
      
      // If user was offline for more than 2 minutes and has a session, refresh profile
      if (offlineTime > 2 * 60 * 1000 && user) {
        try {
          await refreshProfile();
          toast.success('Connection restored - session validated');
        } catch (error) {
          toast.error('Session validation failed after reconnection');
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastOnline(Date.now());
      toast.warning('Connection lost - working offline');
    };

    // Network status listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Reduce focus refresh frequency - only if away for more than 15 minutes
    const handleFocus = async () => {
      if (isOnline && user) {
        const timeAway = Date.now() - lastOnline;
        const lastFocusCheck = sessionStorage.getItem('lastFocusCheck');
        const now = Date.now();
        
        // Only refresh if away for more than 15 minutes AND we haven't checked recently
        if (timeAway > 15 * 60 * 1000 && (!lastFocusCheck || now - parseInt(lastFocusCheck) > 10 * 60 * 1000)) {
          try {
            sessionStorage.setItem('lastFocusCheck', now.toString());
            await refreshProfile();
          } catch (error) {
            console.warn('Session refresh failed on focus:', error);
          }
        }
      }
    };

    const handleBlur = () => {
      setLastOnline(Date.now());
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [user, refreshProfile, isOnline, lastOnline]);

  return null; // This is a utility component with no UI
};