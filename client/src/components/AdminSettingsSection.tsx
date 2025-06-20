import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Database, CheckCircle, AlertCircle, Wifi, WifiOff, Key, Trash2 } from 'lucide-react';
import { UserManagementSection } from './UserManagementSection';

interface AppSettings {
  id: number;
  currency: string;
  openai_api_key: string | null;
  cohere_api_key: string | null;
  company_name: string;
  updated_at: string;
}

export const AdminSettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    company_name: '',
    currency: 'USD',
    openai_api_key: '',
    cohere_api_key: '',
  });

  useEffect(() => {
    fetchSettings();
    checkDatabaseConnection();
  }, []);

  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name || '',
        currency: settings.currency || 'USD',
        openai_api_key: settings.openai_api_key || '',
        cohere_api_key: settings.cohere_api_key || '',
      });
    }
  }, [settings]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error: any) {
      setError('Failed to load settings: ' + error.message);
    }
  };

  const checkDatabaseConnection = async () => {
    setCheckingConnection(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .select('id')
        .limit(1);

      setDbConnected(!error);
    } catch (error) {
      setDbConnected(false);
    } finally {
      setCheckingConnection(false);
    }
  };

  const removeApiKey = async (keyType: 'openai' | 'cohere') => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData = keyType === 'openai' 
        ? { openai_api_key: null }
        : { cohere_api_key: null };

      const { error } = await supabase
        .from('app_settings')
        .update(updateData)
        .eq('id', 1);

      if (error) throw error;

      await fetchSettings();
      setSuccess(`${keyType === 'openai' ? 'OpenAI' : 'Cohere'} API key removed successfully!`);
      
      // Clear the form field
      if (keyType === 'openai') {
        setFormData(prev => ({ ...prev, openai_api_key: '' }));
      } else {
        setFormData(prev => ({ ...prev, cohere_api_key: '' }));
      }
    } catch (error: any) {
      setError(`Failed to remove ${keyType === 'openai' ? 'OpenAI' : 'Cohere'} API key: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('app_settings')
        .update({
          company_name: formData.company_name,
          currency: formData.currency,
          openai_api_key: formData.openai_api_key || null,
          cohere_api_key: formData.cohere_api_key || null,
        })
        .eq('id', 1);

      if (error) throw error;

      await fetchSettings();
      setSuccess('Settings updated successfully!');
    } catch (error: any) {
      setError('Failed to update settings: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* User Management Section */}
      <UserManagementSection />

      {/* Database Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Database Status</span>
          </CardTitle>
          <CardDescription>Monitor database connectivity and health</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Connection Status</span>
              <div className="flex items-center space-x-2">
                {checkingConnection ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                ) : dbConnected ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-600" />
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Connected
                    </Badge>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-600" />
                    <Badge variant="destructive">Disconnected</Badge>
                  </>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={checkDatabaseConnection}
              disabled={checkingConnection}
            >
              {checkingConnection ? 'Checking...' : 'Refresh Status'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Keys Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>API Keys Management</span>
          </CardTitle>
          <CardDescription>Configure and manage API keys for AI services</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              {/* OpenAI API Key */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="openai_api_key" className="text-base font-medium">OpenAI API Key</Label>
                    <p className="text-sm text-muted-foreground">Required for AI-powered BOQ analysis and price matching</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {settings?.openai_api_key && (
                      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                    )}
                    {!settings?.openai_api_key && (
                      <Badge variant="secondary">Not Set</Badge>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Input
                    id="openai_api_key"
                    type="password"
                    value={formData.openai_api_key}
                    onChange={(e) => setFormData({ ...formData, openai_api_key: e.target.value })}
                    placeholder="sk-..."
                    className="flex-1"
                  />
                  {settings?.openai_api_key && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeApiKey('openai')}
                      disabled={loading}
                      title="Remove OpenAI API Key"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Cohere API Key */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cohere_api_key" className="text-base font-medium">Cohere API Key</Label>
                    <p className="text-sm text-muted-foreground">Used for enhanced text embeddings and similarity matching</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {settings?.cohere_api_key && (
                      <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
                    )}
                    {!settings?.cohere_api_key && (
                      <Badge variant="secondary">Not Set</Badge>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Input
                    id="cohere_api_key"
                    type="password"
                    value={formData.cohere_api_key}
                    onChange={(e) => setFormData({ ...formData, cohere_api_key: e.target.value })}
                    placeholder="co-..."
                    className="flex-1"
                  />
                  {settings?.cohere_api_key && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeApiKey('cohere')}
                      disabled={loading}
                      title="Remove Cohere API Key"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update API Keys'}
            </Button>
          </form>

          {success && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Application Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>Configure global application settings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Enter company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  placeholder="USD"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Settings'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
