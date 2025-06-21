import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Building2, AlertCircle, Clock } from 'lucide-react';

export default React.memo(function Auth() {
  const { user, loading, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAccessRequestForm, setShowAccessRequestForm] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const cleanupAuthState = () => {
    try {
      // Clear all Supabase auth tokens and state
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-yqsumodzyahvxywwfpnc-auth-token');
      
      // Clear all auth-related localStorage items
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || 
            key.includes('sb-yqsumodzyahvxywwfpnc') || 
            key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear session storage too
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || 
            key.includes('sb-yqsumodzyahvxywwfpnc') || 
            key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      // Silent cleanup - ignore errors
    }
  };

  const getErrorMessage = (errorCode: string) => {
    if (!errorCode) return 'Something went wrong. Please try again.';
    
    const errorLower = errorCode.toLowerCase();
    
    // Handle specific authentication errors
    if (errorLower.includes('invalid login credentials') || 
        errorLower.includes('invalid email or password') ||
        errorLower.includes('invalid credentials')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    
    if (errorLower.includes('user not found') || 
        errorLower.includes('no user found')) {
      return 'No account found with this email address.';
    }
    
    if (errorLower.includes('wrong password') || 
        errorLower.includes('incorrect password')) {
      return 'Incorrect password. Please try again.';
    }
    
    if (errorLower.includes('too many requests') || 
        errorLower.includes('rate limit')) {
      return 'Too many attempts. Please wait a few minutes before trying again.';
    }
    
    if (errorLower.includes('signup disabled')) {
      return 'New user registration is currently disabled.';
    }
    
    if (errorLower.includes('email already registered') || 
        errorLower.includes('user already registered') ||
        errorLower.includes('already exists')) {
      return 'An account with this email already exists. Try signing in instead.';
    }
    
    if (errorLower.includes('password too short')) {
      return 'Password must be at least 6 characters long.';
    }
    
    if (errorLower.includes('invalid email')) {
      return 'Please enter a valid email address.';
    }
    
    // For any unhandled error, provide a more helpful message
    if (errorLower.includes('password')) {
      return 'Password issue. Please check your password and try again.';
    }
    
    if (errorLower.includes('email')) {
      return 'Email issue. Please check your email address and try again.';
    }
    
    // Default case - be more specific about what to do
    return 'Unable to sign in. Please check your email and password, then try again.';
  };

  const handleRateLimitError = (operation: string) => {
    const waitTime = 5; // Reduced from 15-45 minutes to 5 minutes
    
    setError(
      `⚠️ Too many ${operation} attempts. Please wait ${waitTime} minutes and try again.\n\n` +
      `Rate limiting helps protect the system. Please be patient.`
    );
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');
    setSuccess('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      setAuthLoading(false);
      return;
    }

    try {
      // First, try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password,
      });

      if (error) {
        // Check if error is due to email not confirmed
        if (error.message.includes('Email not confirmed') || 
            error.message.includes('email_not_confirmed') ||
            error.message.includes('Email link is invalid')) {
          // Check if user has an approved access request
          const { data: profile } = await supabase
            .from('profiles')
            .select('status')
            .eq('email', email.toLowerCase())
            .single();

          if (profile && profile.status === 'active') {
            // User is approved but email not confirmed - this is our expected state
            // Try to bypass by using a different approach
            setError('Your account is pending activation. Please wait for admin approval or contact support.');
          } else {
            setError('Your account is pending admin approval. Please wait for an administrator to approve your access request.');
          }
          return;
        }

        if (error.message.includes('Invalid login credentials')) {
          // Check if this is because the user exists but hasn't been approved
          const { data: accessRequest } = await supabase
            .from('access_requests')
            .select('status')
            .eq('email', email.toLowerCase())
            .single();

          if (accessRequest) {
            if (accessRequest.status === 'pending') {
              setError('Your access request is still pending admin approval.');
              return;
            } else if (accessRequest.status === 'rejected') {
              setError('Your access request was rejected. Please contact an administrator.');
              return;
            }
          }
        }

        if (error.message.includes('rate limit') || error.status === 429) {
          handleRateLimitError('sign in');
          return;
        }
        
        throw error;
      }

      if (data.user) {
        // Check if user profile is active
        const { data: profile } = await supabase
          .from('profiles')
          .select('status, role')
          .eq('id', data.user.id)
          .single();

        if (!profile || profile.status !== 'active') {
          await supabase.auth.signOut();
          setError('Your account is not active. Please wait for admin approval.');
          return;
        }

        setSuccess('Successfully signed in!');
      }
    } catch (error: any) {
      if (error.message?.includes('rate limit') || error.status === 429) {
        handleRateLimitError('sign in');
      } else {
        setError(getErrorMessage(error.message) || 'Failed to sign in. Please try again.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');
    setSuccess('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      setAuthLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setAuthLoading(false);
      return;
    }

    try {
      // First, create the Supabase auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          emailRedirectTo: undefined, // Don't send confirmation email
          data: {
            full_name: name,
            company: company || null
          }
        }
      });

      // Even if there's an error about email confirmation, continue with access request
      if (authError && !authError.message.includes('email') && !authError.message.includes('confirm')) {
        throw authError;
      }

      // Submit access request to backend API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user-management/access-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          full_name: name,
          company: company || null,
          phone: phone || null,
          message: message || null,
          requested_role: 'user'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If access request fails but auth account was created, that's still okay
        if (data.error && data.error.includes('already pending')) {
          setSuccess('Your account has been created. An access request is already pending admin approval.');
        } else {
          throw new Error(data.error || 'Failed to submit access request');
        }
      } else {
        // Success - show admin approval message
        setSuccess('Account created successfully! An administrator will review your access request. Once approved, you can sign in with your email and password.');
      }
      
      // Clear form
      setEmail('');
      setPassword('');
      setName('');
      setCompany('');
      setPhone('');
      setMessage('');
      
    } catch (error: any) {
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');
    setSuccess('');

    if (!validateEmail(resetEmail)) {
      setError('Please enter a valid email address.');
      setAuthLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) {
        if (error.message.includes('rate limit') || error.status === 429) {
          handleRateLimitError('password reset');
          return;
        }
        throw error;
      }

      setSuccess('Password reset email sent! Check your inbox for further instructions.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      if (error.message?.includes('rate limit') || error.status === 429) {
        handleRateLimitError('password reset');
      } else {
        setError(error.message || 'An error occurred while sending reset email');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const validateEmail = (email) => {
    const re = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[400px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Login</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Request Access</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="signin-password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="ml-auto inline-block text-sm underline text-primary hover:text-primary/80"
                    >
                      Forgot your password?
                    </button>
                  </div>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={authLoading}>
                  {authLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signup-company">Company (Optional)</Label>
                  <Input
                    id="signup-company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signup-phone">Phone (Optional)</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="signup-message">Message (Optional)</Label>
                  <Input
                    id="signup-message"
                    type="text"
                    placeholder="Why do you need access?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={authLoading}>
                  {authLoading ? "Submitting request..." : "Request Access"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          {(error || authError) && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || authError}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mt-4">
              <Clock className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <div className="flex h-full items-center justify-center">
          <Building2 className="h-24 w-24 text-primary" />
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="m@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotPassword(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={authLoading}>
                {authLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
});
