import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'InvalidLogin':
        return 'Invalid email or password. Please try again.';
      case 'UserNotFound':
        return 'No account found with this email.';
      case 'EmailNotConfirmed':
        return 'Your account is pending admin approval.';
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      setAuthLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long.');
      setAuthLoading(false);
      return;
    }

    try {
      cleanupAuthState();
      
      // First check if user has been approved
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('status')
        .eq('email', email)
        .single();

      if (profileData && profileData.status === 'pending') {
        setError('Your account is pending admin approval. Please wait for approval before signing in.');
        setAuthLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        window.location.href = '/';
      }
    } catch (error: any) {
      setError(getErrorMessage(error.message) || 'An error occurred during sign in');
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

    if (!validatePassword(password)) {
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
          }
        }
      });

      if (error) throw error;

      setSuccess('Your access request has been submitted! An administrator will review your request soon. You will be able to sign in once approved.');
      setShowAccessRequestForm(false);
      
      // Clear form
      setEmail('');
      setPassword('');
      setName('');
      setCompany('');
      setPhone('');
      setMessage('');
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign up');
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
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline"
                    >
                      Forgot your password?
                    </a>
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
    </div>
  );
}
