import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  UserPlus, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye,
  Settings,
  Activity,
  Clock,
  Monitor,
  AlertTriangle
} from 'lucide-react';
import { apiEndpoint } from '@/config/api'
import { toast } from 'sonner';

interface AccessRequest {
  id: string;
  email: string;
  full_name: string;
  company?: string;
  phone?: string;
  message?: string;
  requested_role: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  expires_at: string;
}

interface User {
  id: string;
  name: string;
  role: string;
  status: string;
  last_login?: string;
  failed_login_attempts: number;
  two_factor_enabled: boolean;
  created_at: string;
}

interface UserRole {
  id: number;
  name: string;
  description: string;
  permissions: any;
  is_system_role: boolean;
}

interface AuditLog {
  id: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  created_at: string;
  profiles?: {
    name: string;
    role: string;
  };
}

export const UserManagementSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Access Requests State
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [approvalRole, setApprovalRole] = useState('');

  // Users State
  const [users, setUsers] = useState<User[]>([]);
  const [userFilter, setUserFilter] = useState({ role: '', status: '' });

  // Available roles - only admin and user
  const availableRoles = [
    { name: 'admin', description: 'Full system access' },
    { name: 'user', description: 'Basic user access' }
  ];

  useEffect(() => {
    fetchAccessRequests();
    fetchUsers();
  }, []);

  const getAuthToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      console.error('No auth token found in session');
    }
    return session?.access_token;
  };

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getAuthToken();
    
    const response = await fetch(apiEndpoint(`/user-management${endpoint}`), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = 'API call failed';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON (like HTML error page), use status text
        errorMessage = `${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  };

  const fetchAccessRequests = async () => {
    try {
      const data = await apiCall('/access-requests');
      setAccessRequests(data);
    } catch (error: any) {
      setError('Failed to fetch access requests: ' + error.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await apiCall('/users');
      setUsers(data.users || []);
    } catch (error: any) {
      setError('Failed to fetch users: ' + error.message);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!selectedRequest) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiCall(`/access-requests/${requestId}/approve`, {
        method: 'POST',
        body: JSON.stringify({
          admin_notes: adminNotes,
          user_role: approvalRole || selectedRequest.requested_role
        })
      });

      setSuccess('Access request approved successfully!');
      setSelectedRequest(null);
      setAdminNotes('');
      setApprovalRole('');
      await fetchAccessRequests();
      await fetchUsers();
    } catch (error: any) {
      setError('Failed to approve request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiCall(`/access-requests/${requestId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ admin_notes: adminNotes })
      });

      setSuccess('Access request rejected.');
      setSelectedRequest(null);
      setAdminNotes('');
      await fetchAccessRequests();
    } catch (error: any) {
      setError('Failed to reject request: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiCall(`/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });

      setSuccess('User role updated successfully!');
      await fetchUsers();
    } catch (error: any) {
      setError('Failed to update user role: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiCall(`/users/${userId}/deactivate`, {
        method: 'PUT'
      });

      setSuccess('User deactivated successfully!');
      await fetchUsers();
    } catch (error: any) {
      setError('Failed to deactivate user: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      'admin': 'bg-purple-100 text-purple-800',
      'user': 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={variants[role as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const testBackendConnection = async () => {
    setIsTestingConnection(true)
    setConnectionError(null)
    
    try {
      console.log('Testing backend connection...')
      const response = await fetch(apiEndpoint('/health'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Backend connection successful:', data)
      toast.success('Backend connection successful!')
    } catch (error) {
      console.error('Backend connection failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setConnectionError(`Failed to connect: ${errorMessage}`)
      toast.error('Backend connection failed')
    } finally {
      setIsTestingConnection(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>User Management & Access Control</span>
          </CardTitle>
          <CardDescription>
            Manage user access requests, roles, and monitor system activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="requests" className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Requests</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Users</span>
              </TabsTrigger>
            </TabsList>

            {/* Access Requests Tab */}
            <TabsContent value="requests" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Access Requests</h3>
                <Button onClick={fetchAccessRequests} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>

              {accessRequests.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">No pending access requests</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {accessRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                              <h4 className="font-medium">{request.full_name}</h4>
                              {getStatusBadge(request.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">{request.email}</p>
                            {request.company && (
                              <p className="text-sm text-muted-foreground">Company: {request.company}</p>
                            )}
                            {request.message && (
                              <p className="text-sm bg-gray-50 p-3 rounded">{request.message}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              Requested: {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>

                          {request.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setApprovalRole(request.requested_role);
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Approve Access Request</DialogTitle>
                                    <DialogDescription>
                                      Approve access for {request.full_name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="approval-role">Assign Role</Label>
                                      <Select value={approvalRole} onValueChange={setApprovalRole}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {availableRoles.map((role) => (
                                            <SelectItem key={role.name} value={role.name}>
                                              {role.name}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div>
                                      <Label htmlFor="admin-notes">Notes (Optional)</Label>
                                      <Textarea
                                        id="admin-notes"
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Add notes..."
                                      />
                                    </div>
                                  </div>

                                  <DialogFooter>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleRejectRequest(request.id)}
                                      disabled={loading}
                                    >
                                      Reject
                                    </Button>
                                    <Button
                                      onClick={() => handleApproveRequest(request.id)}
                                      disabled={loading}
                                    >
                                      Approve
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectRequest(request.id)}
                                disabled={loading}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">System Users</h3>
                <Button onClick={fetchUsers} variant="outline" size="sm">
                  Refresh
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{user.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Select
                            value={user.role}
                            onValueChange={(newRole) => handleUpdateUserRole(user.id, newRole)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableRoles.map((role) => (
                                <SelectItem key={role.name} value={role.name}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          {user.status === 'active' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeactivateUser(user.id)}
                            >
                              Deactivate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>

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
    </div>
  );
}; 