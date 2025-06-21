import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { User, Mail, Calendar, Sun, Moon, Monitor } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

type Theme = "dark" | "light" | "system"

export default function Profile() {
  const { user, refreshProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [selectedTheme, setSelectedTheme] = useState<Theme>(theme)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  useEffect(() => {
    setSelectedTheme(theme)
  }, [theme])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        return
      }

      if (data) {
        setProfile(data)
        setName(data.name || '')
        setEmailNotifications(data.email_notifications ?? true)
        if (data.theme && ['light', 'dark', 'system'].includes(data.theme)) {
          const validTheme = data.theme as Theme
          setSelectedTheme(validTheme)
          setTheme(validTheme)
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    if (!user) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: name.trim(),
          email_notifications: emailNotifications,
          theme: selectedTheme,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error updating profile:', error)
        toast.error('Failed to update profile')
        return
      }

      // Apply theme change
      setTheme(selectedTheme)
      
      toast.success('Profile updated successfully!')
      await refreshProfile()
      await fetchProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleThemeChange = (newTheme: string) => {
    if (['light', 'dark', 'system'].includes(newTheme)) {
      const validTheme = newTheme as Theme
      setSelectedTheme(validTheme)
    }
  }

  const getInitials = (name: string, email: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(' ')
      if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
      }
      return parts[0].charAt(0).toUpperCase()
    }
    return email?.charAt(0).toUpperCase() || 'U'
  }

  const getThemeIcon = (themeValue: string) => {
    switch (themeValue) {
      case 'light': return <Sun className="h-4 w-4" />
      case 'dark': return <Moon className="h-4 w-4" />
      default: return <Monitor className="h-4 w-4" />
    }
  }

  const getThemeLabel = (themeValue: string) => {
    switch (themeValue) {
      case 'light': return 'Light'
      case 'dark': return 'Dark'
      default: return 'System'
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    try {
      setSaving(true)
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('Error changing password:', error)
        toast.error('Failed to change password: ' + error.message)
        return
      }

      toast.success('Password changed successfully!')
      setShowChangePassword(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-[10px] px-6 pb-6 space-y-3">
      <div className="flex items-start justify-between">
        <div className="text-left">
          <h1 className="text-3xl font-bold mt-0">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        <Button onClick={updateProfile} disabled={saving} size="lg">
          {saving ? 'Updating...' : 'Update Profile'}
        </Button>
      </div>

      <div className="space-y-3">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={`https://avatar.vercel.sh/${user?.email}.png`} />
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials(name, user?.email || '')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{name || 'No name set'}</h3>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Email cannot be changed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label>Theme</Label>
                <span className="text-sm text-muted-foreground">• Choose your preferred theme</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {getThemeIcon(selectedTheme)}
                    <span className="ml-2">{getThemeLabel(selectedTheme)}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleThemeChange("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleThemeChange("system")}>
                    <Monitor className="mr-2 h-4 w-4" />
                    <span>System</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showChangePassword ? (
              <Button 
                variant="outline" 
                onClick={() => setShowChangePassword(true)}
              >
                Change Password
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    minLength={6}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={handleChangePassword}
                    disabled={saving || !newPassword || !confirmPassword}
                  >
                    {saving ? 'Changing...' : 'Change Password'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowChangePassword(false)
                      setCurrentPassword('')
                      setNewPassword('')
                      setConfirmPassword('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Label>Email Notifications</Label>
                <span className="text-sm text-muted-foreground">• Receive notifications via email</span>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Email:</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Member since:</p>
                <p className="text-sm text-muted-foreground">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium">Account Status:</p>
                <Badge variant="secondary">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
