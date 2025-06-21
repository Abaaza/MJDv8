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

export default function Auth() {
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
    localStorage.removeItem('supabase.auth.token');
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
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
    
    if (errorLower.includes('email not confirmed')) {
      return 'Please check your email and confirm your account first.';
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
    const currentTime = new Date().toLocaleTimeString();
    const waitTime = Math.ceil(Math.random() * 30) + 15; // Random wait between 15-45 minutes
    
    setError(
      `⚠️ Too many ${operation} attempts.\n\n` +
      `Please wait ${waitTime} minutes and try again.\n\n` +
      `You can try again after ${new Date(Date.now() + waitTime * 60000).toLocaleTimeString()}\n\n` +
      `Current time: ${currentTime}`
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        if (error.message.includes('rate limit') || error.status === 429) {
          handleRateLimitError('sign in');
          return;
        }
        throw error;
      }

      if (data.user) {
        setSuccess('Successfully signed in!');
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      
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
      cleanupAuthState();

      // Check if access request already exists
      const { data: existingRequest, error: checkError } = await supabase
        .from('access_requests')
        .select('status')
        .eq('email', email)
        .single();

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          setError('An access request for this email is already pending approval.');
        } else if (existingRequest.status === 'rejected') {
          setError('Your access request was previously rejected. Please contact an administrator.');
        } else {
          setError('An account with this email already exists.');
        }
        setAuthLoading(false);
        return;
      }

      // Create access request
      const { error: requestError } = await supabase
        .from('access_requests')
        .insert({
          email,
          full_name: name,
          company: company || null,
          phone: phone || null,
          message: message || null,
          requested_role: 'user'
        });

      if (requestError) throw requestError;

      // Create the user account but it will be inactive until approved
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            status: 'pending'
          },
          emailRedirectTo: undefined // Don't send confirmation email
        }
      });

      if (error) {
        // Handle specific rate limiting errors
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          handleRateLimitError('sign up');
          return;
        }
        // Handle email sending errors by ignoring them
        if (error.message.toLowerCase().includes('email') && error.message.toLowerCase().includes('limit')) {
          // Email limit reached, but account was likely created - continue
          console.log('Email limit reached, but continuing with signup');
        } else {
          throw error;
        }
      }

      // Success - show admin approval message
      setSuccess('Access request submitted! An administrator will review your request and notify you once approved.');
      setShowAccessRequestForm(false);

      // Clear form
      setEmail('');
      setPassword('');
      setName('');
      setCompany('');
      setPhone('');
      setMessage('');
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      if (error.message?.includes('rate limit') || error.status === 429) {
        handleRateLimitError('sign up');
      } else {
        setError(getErrorMessage(error.message) || 'Failed to create account. Please try again.');
      }
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
              <AlertDescription>{error || authError.message}</AlertDescription>
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
}
