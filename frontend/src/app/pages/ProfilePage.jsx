import React, { useState } from 'react';
import { User, Mail, Lock, Camera, AlertTriangle, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

const ProfilePage = () => {
  const { user } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    alert('Profile updated successfully!');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    if (formData.newPassword.length < 8) {
      alert('Password must be at least 8 characters!');
      return;
    }
    alert('Password changed successfully!');
    setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you absolutely sure? This action cannot be undone and will permanently delete your account and all associated data.')) {
      alert('Account deletion would be processed here');
    }
  };

  const calculatePasswordStrength = (password) => {
    if (password.length === 0) return 0;
    if (password.length < 6) return 1;
    if (password.length < 10) return 2;
    return 3;
  };

  const handleNewPasswordChange = (value) => {
    setFormData({ ...formData, newPassword: value });
    setPasswordStrength(calculatePasswordStrength(value));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Profile Picture Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Profile Picture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="bg-blue-500 text-white text-3xl">
                {user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline">
                <Camera className="w-4 h-4 mr-2" />
                Upload Photo
              </Button>
              <Button variant="ghost" className="ml-2">Remove</Button>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Supported formats: JPG, PNG (Max 2MB)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="pr-10"
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Email cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div>
                <Badge variant="secondary" className="text-sm">
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </Badge>
              </div>
            </div>
            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive email updates about new lectures and announcements
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Use dark theme across the application
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={toggleDarkMode}
            />
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={formData.newPassword}
                onChange={(e) => handleNewPasswordChange(e.target.value)}
              />
              {formData.newPassword && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength
                            ? passwordStrength === 1
                              ? 'bg-red-500'
                              : passwordStrength === 2
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Password strength: {passwordStrength === 1 ? 'Weak' : passwordStrength === 2 ? 'Medium' : 'Strong'}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Password requirements: Must be at least 8 characters
            </p>
            <Button 
              type="submit" 
              disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
            >
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">Delete Account</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
