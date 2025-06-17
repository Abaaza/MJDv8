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
import { Settings as SettingsIcon, Building2, DollarSign, Zap, Bell, Shield, Database } from "lucide-react"
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AppSettings {
  id: number;
  currency: string;
  openai_api_key: string | null;
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
    <div className="pt-[10px] px-6 pb-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-3xl font-bold mt-0">Admin Settings</h1>
          <p className="text-muted-foreground">Configure system settings and API keys</p>
        </div>
      </div>

      <Tabs defaultValue="database" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="database" className="flex items-center space-x-2">
            <Database className="h-4 w-4" />
            <span>Database</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Company</span>
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Pricing</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>AI & APIs</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database">
          <AdminSettingsSection />
        </TabsContent>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateSettings({
                  company_name: formData.get('company_name') as string,
                });
              }} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input 
                      id="company_name" 
                      name="company_name"
                      defaultValue={settings?.company_name || "BOQ Pricer Pro"} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select defaultValue="construction">
                      <SelectTrigger>
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
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" placeholder="Enter company address" defaultValue="123 Construction Ave, Building City, BC 12345" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" defaultValue="+1-555-0123" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="contact@constructcrm.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" defaultValue="https://constructcrm.com" />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Company Settings'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Currency</CardTitle>
              <CardDescription>Configure pricing settings and currency preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateSettings({
                  currency: formData.get('currency') as string,
                });
              }} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select name="currency" defaultValue={settings?.currency || "USD"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                    <Input id="taxRate" type="number" step="0.1" defaultValue="8.5" />
                  </div>
                </div>
                <div className="space-y-4">
                  <Label>Price Markup Settings</Label>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="materialMarkup">Materials (%)</Label>
                      <Input id="materialMarkup" type="number" step="0.1" defaultValue="15.0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="laborMarkup">Labor (%)</Label>
                      <Input id="laborMarkup" type="number" step="0.1" defaultValue="25.0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="equipmentMarkup">Equipment (%)</Label>
                      <Input id="equipmentMarkup" type="number" step="0.1" defaultValue="20.0" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="autoUpdate" />
                  <Label htmlFor="autoUpdate">Automatically update prices from market data</Label>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Pricing Settings'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI & API Configuration</CardTitle>
              <CardDescription>Configure AI services and API keys for price matching</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                updateSettings({
                  openai_api_key: formData.get('openai_api_key') as string || null,
                  cohere_api_key: formData.get('cohere_api_key') as string || null,
                });
              }} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="openai_api_key">OpenAI API Key</Label>
                    <Badge variant={settings?.openai_api_key ? "default" : "outline"}>
                      {settings?.openai_api_key ? "Set" : "Required"}
                    </Badge>
                  </div>
                  <Input 
                    id="openai_api_key" 
                    name="openai_api_key"
                    type="password" 
                    placeholder="sk-..." 
                    defaultValue={settings?.openai_api_key || ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for natural language processing and BOQ analysis
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cohere_api_key">Cohere API Key</Label>
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
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for enhanced text embeddings and similarity matching
                  </p>
                </div>
                <div className="space-y-4">
                  <Label>AI Matching Settings</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="confidenceThreshold">Confidence Threshold (%)</Label>
                      <Input id="confidenceThreshold" type="number" min="50" max="100" defaultValue="85" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxMatches">Max Matches per Item</Label>
                      <Input id="maxMatches" type="number" min="1" max="10" defaultValue="5" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="autoMatch" defaultChecked />
                  <Label htmlFor="autoMatch">Enable automatic price matching</Label>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save AI Settings'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you receive updates and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Project Updates</Label>
                    <p className="text-sm text-muted-foreground">Notifications when project status changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Matching Job Completion</Label>
                    <p className="text-sm text-muted-foreground">Alerts when AI matching jobs finish</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Client Activity</Label>
                    <p className="text-sm text-muted-foreground">Updates on client interactions</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">Weekly summary of activities</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage authentication and access control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Automatically log out inactive users</p>
                  </div>
                  <Select defaultValue="8h">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="4h">4 hours</SelectItem>
                      <SelectItem value="8h">8 hours</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>API Access Logging</Label>
                    <p className="text-sm text-muted-foreground">Log all API requests for audit</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password Policy</Label>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div>• Minimum 8 characters</div>
                  <div>• At least one uppercase letter</div>
                  <div>• At least one number</div>
                  <div>• At least one special character</div>
                </div>
              </div>
              <Button>Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
