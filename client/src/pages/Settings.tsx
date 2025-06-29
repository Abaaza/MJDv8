import { useAuth } from "@/contexts/AuthContext";
import { AdminSettingsSection } from "@/components/AdminSettingsSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Settings as SettingsIcon, Building2, DollarSign, Zap, Bell, Database } from "lucide-react"
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AppSettings {
  id: number;
  currency: string;
  cohere_api_key: string | null;
  company_name: string;
  updated_at: string;
}

export default function Settings() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

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
      console.error('Failed to load settings:', error.message);
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .update(updates)
        .eq('id', 1);

      if (error) throw error;

      await fetchSettings();
      toast({
        title: "Success",
        description: "Settings updated successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update settings: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[10px] px-3 sm:px-4 md:px-6 pb-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-0">Admin Settings</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Configure system settings and API keys</p>
        </div>
      </div>

      <Tabs defaultValue="database" className="space-y-4 sm:space-y-6">
        <TabsList className="flex flex-col sm:grid sm:grid-cols-5 w-full h-auto gap-1">
          <TabsTrigger value="database" className="flex items-center justify-start gap-2 py-3 px-4 text-sm w-full sm:w-auto touch-manipulation">
            <Database className="h-4 w-4" />
            <span>Database</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center justify-start gap-2 py-3 px-4 text-sm w-full sm:w-auto touch-manipulation">
            <Building2 className="h-4 w-4" />
            <span>Company</span>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center justify-start gap-2 py-3 px-4 text-sm w-full sm:w-auto touch-manipulation">
            <DollarSign className="h-4 w-4" />
            <span>Pricing</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center justify-start gap-2 py-3 px-4 text-sm w-full sm:w-auto touch-manipulation">
            <Zap className="h-4 w-4" />
            <span>AI & APIs</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center justify-start gap-2 py-3 px-4 text-sm w-full sm:w-auto touch-manipulation">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database">
          <AdminSettingsSection />
        </TabsContent>

        <TabsContent value="company">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg">Company Information</CardTitle>
              <CardDescription className="text-sm">Update your company details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateSettings({
                  company_name: formData.get('company_name') as string,
                });
              }} className="space-y-4 sm:space-y-6">
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company_name" className="text-sm">Company Name</Label>
                    <Input 
                      id="company_name" 
                      name="company_name"
                      defaultValue={settings?.company_name || "BOQ Pricer Pro"}
                      className="h-10 sm:h-11 text-base touch-manipulation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-sm">Industry</Label>
                    <Select defaultValue="construction">
                      <SelectTrigger className="h-10 sm:h-11 text-base touch-manipulation">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="construction">Construction</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="real-estate">Real Estate</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm">Address</Label>
                  <Textarea 
                    id="address" 
                    placeholder="Enter company address" 
                    defaultValue="123 Construction Ave, Building City, BC 12345"
                    className="min-h-[80px] text-base touch-manipulation"
                  />
                </div>
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm">Phone</Label>
                    <Input 
                      id="phone" 
                      defaultValue="+1-555-0123"
                      className="h-10 sm:h-11 text-base touch-manipulation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      defaultValue="contact@MJD Engineering.com"
                      className="h-10 sm:h-11 text-base touch-manipulation"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-sm">Website</Label>
                  <Input 
                    id="website" 
                    defaultValue="https://MJD Engineering.com"
                    className="h-10 sm:h-11 text-base touch-manipulation"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full sm:w-auto h-10 sm:h-11 text-base touch-manipulation"
                >
                  {loading ? 'Saving...' : 'Save Company Settings'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg">Pricing Settings</CardTitle>
              <CardDescription className="text-sm">Configure currency and pricing preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateSettings({
                  currency: formData.get('currency') as string || 'USD',
                });
              }} className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <Label htmlFor="currency" className="text-sm">Default Currency</Label>
                    <Select name="currency" defaultValue={settings?.currency || 'USD'}>
                      <SelectTrigger className="h-10 sm:h-11 text-base touch-manipulation">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">US Dollar (USD)</SelectItem>
                        <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                        <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                        <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Currency used for price displays and calculations
                    </p>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full sm:w-auto h-10 sm:h-11 text-base touch-manipulation"
                >
                  {loading ? 'Updating...' : 'Update Pricing Settings'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg">AI & API Configuration</CardTitle>
              <CardDescription className="text-sm">Configure AI services and API keys for price matching</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateSettings({
                  cohere_api_key: formData.get('cohere_api_key') as string || null,
                });
              }} className="space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <Label htmlFor="cohere_api_key" className="text-sm">Cohere API Key</Label>
                    <Badge variant={settings?.cohere_api_key ? "default" : "outline"}>
                      {settings?.cohere_api_key ? "Set" : "Optional"}
                    </Badge>
                  </div>
                  <Input 
                    id="cohere_api_key" 
                    name="cohere_api_key"
                    type="password" 
                    placeholder="co-..." 
                    defaultValue={settings?.cohere_api_key || ""}
                    className="h-10 sm:h-11 text-base touch-manipulation"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for enhanced text embeddings and similarity matching
                  </p>
                </div>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full sm:w-auto h-10 sm:h-11 text-base touch-manipulation"
                >
                  {loading ? 'Updating...' : 'Update API Settings'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base sm:text-lg">Notification Preferences</CardTitle>
              <CardDescription className="text-sm">Configure how you receive updates and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground mt-1">Receive updates via email</p>
                  </div>
                  <Switch defaultChecked className="self-start sm:self-center" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Project Updates</Label>
                    <p className="text-sm text-muted-foreground mt-1">Notifications when project status changes</p>
                  </div>
                  <Switch defaultChecked className="self-start sm:self-center" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Matching Job Completion</Label>
                    <p className="text-sm text-muted-foreground mt-1">Alerts when AI matching jobs finish</p>
                  </div>
                  <Switch defaultChecked className="self-start sm:self-center" />
                </div>
              </div>
              <Button className="w-full sm:w-auto h-10 sm:h-11 text-base touch-manipulation">
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
