import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Camera, Bell, Moon, Sun, Shield, BookOpen, GraduationCap, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';
import { usersAPI, getErrorMessage } from '../services/api';

const ProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error
  const [saveError, setSaveError] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch full profile on mount (includes full_name, bio, avatar_url)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await usersAPI.getMe();
        setFormData(prev => ({
          ...prev,
          full_name: data.full_name || '',
        }));
        // Sync store with latest profile
        updateUser({ full_name: data.full_name, bio: data.bio, avatar_url: data.avatar_url });
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveStatus('saving');
    setSaveError('');
    try {
      const { data } = await usersAPI.updateMe({ full_name: formData.full_name });
      updateUser({ full_name: data.full_name });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (err) {
      setSaveError(getErrorMessage(err));
      setSaveStatus('error');
    }
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
    // Note: backend does not yet expose a change-password endpoint in this branch
    alert('Password change is not available via API in this phase.');
    setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const roleConfig = {
    admin: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Shield, label: 'Administrator' },
    teacher: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: BookOpen, label: 'Teacher' },
    student: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: GraduationCap, label: 'Student' },
  };

  const role = roleConfig[user?.role] || roleConfig.student;
  const RoleIcon = role.icon;
  const displayName = user?.full_name || formData.full_name || user?.email || 'User';

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10 animate-in fade-in duration-500">
      {/* Profile Header */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-blue-500/20">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{displayName}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge className={`${role.color} border-none gap-1 text-xs font-semibold px-2.5 py-1`}>
              <RoleIcon className="w-3 h-3" />
              {role.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-sm text-gray-900 dark:text-white">Personal Information</h2>
          </div>

          {saveError && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {saveError}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</Label>
              <Input
                id="name"
                className="h-11"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                disabled={profileLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  className="h-11 pr-10 bg-gray-50 dark:bg-gray-800/50"
                  value={user?.email || ''}
                  disabled
                />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              </div>
              <p className="text-[10px] text-gray-400">Email cannot be changed</p>
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={saveStatus === 'saving' || profileLoading}
              className={`transition-all duration-300 ${saveStatus === 'saved' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
            >
              {saveStatus === 'saving' ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : saveStatus === 'saved' ? '✓ Saved' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-5">
            <Bell className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-sm text-gray-900 dark:text-white">Preferences</h2>
          </div>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-xs text-gray-400 mt-0.5">Receive updates about new lectures</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <div className="h-px bg-gray-100 dark:bg-gray-800" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {darkMode ? <Moon className="w-4 h-4 text-gray-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
                  <p className="text-xs text-gray-400 mt-0.5">Toggle dark theme</p>
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-sm text-gray-900 dark:text-white">Change Password</h2>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Current Password</Label>
              <Input
                type="password"
                className="h-11"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">New Password</Label>
                <Input
                  type="password"
                  className="h-11"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confirm Password</Label>
                <Input
                  type="password"
                  className="h-11"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400">Minimum 8 characters required</p>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={!formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
            >
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
