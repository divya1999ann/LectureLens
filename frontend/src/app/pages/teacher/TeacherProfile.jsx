import React, { useState } from 'react';
import { BookOpen, Lock, Bell, Moon, Sun, Mic, Upload, Users, Presentation } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Badge } from '../../components/ui/badge';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import { mockSubjects, mockLectures, mockEnrollments } from '../../utils/mockData';

const TeacherProfile = () => {
    const { user } = useAuthStore();
    const { darkMode, toggleDarkMode } = useThemeStore();

    const [formData, setFormData] = useState({
        name: user?.name || 'Dr. Sarah Smith',
        email: user?.email || 'sarah@lectureai.com',
        department: 'Computer Science',
        bio: 'Specialized in Machine Learning and AI systems with over 10 years of teaching experience.',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [emailNotifications, setEmailNotifications] = useState(true);
    const [saved, setSaved] = useState(false);

    // Teacher stats from mock data
    const mySubjects = mockSubjects.filter(s => s.instructorId === 2);
    const myLectures = mockLectures.filter(l => mySubjects.some(s => s.id === l.subjectId));
    const totalStudents = mySubjects.reduce((sum, s) => {
        return sum + mockEnrollments.filter(e => e.subjectId === s.id).length;
    }, 0);

    const handleSave = (e) => {
        e.preventDefault();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
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
        alert('Password updated successfully!');
        setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-10 animate-in fade-in duration-500">

            {/* Profile Header Card */}
            <Card className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {/* Gradient Banner */}
                <div className="h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
                <CardContent className="pt-0 pb-6">
                    <div className="flex items-end gap-4 -mt-10 mb-5">
                        <div className="w-20 h-20 rounded-2xl bg-white dark:bg-gray-900 border-4 border-white dark:border-gray-900 shadow-lg flex items-center justify-center text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {formData.name?.charAt(0) || 'T'}
                        </div>
                        <div className="pb-1">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{formData.name}</h1>
                            <p className="text-sm text-gray-500">{formData.email}</p>
                        </div>
                        <Badge className="mb-1 ml-auto bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-none gap-1.5 font-semibold">
                            <BookOpen className="w-3 h-3" />
                            Teacher
                        </Badge>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-3 text-center border border-blue-100 dark:border-blue-900/20">
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{mySubjects.length}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mt-0.5">Subjects</p>
                        </div>
                        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-3 text-center border border-emerald-100 dark:border-emerald-900/20">
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{myLectures.length}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mt-0.5">Lectures</p>
                        </div>
                        <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-3 text-center border border-purple-100 dark:border-purple-900/20">
                            <p className="text-xl font-bold text-gray-900 dark:text-white">{totalStudents}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mt-0.5">Students</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Subjects I Teach */}
            <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Presentation className="w-4 h-4 text-gray-500" />
                        <h2 className="font-semibold text-sm text-gray-900 dark:text-white">Subjects I Teach</h2>
                    </div>
                    <div className="space-y-2">
                        {mySubjects.map(subject => {
                            const lectureCount = mockLectures.filter(l => l.subjectId === subject.id).length;
                            const studentCount = mockEnrollments.filter(e => e.subjectId === subject.id).length;
                            return (
                                <div key={subject.id} className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary" className="text-[10px] font-bold px-2">{subject.code}</Badge>
                                        <div>
                                            <p className="font-medium text-sm text-gray-900 dark:text-white">{subject.name}</p>
                                            <p className="text-xs text-gray-400">{subject.semester}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Presentation className="w-3 h-3" />
                                            {lectureCount}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            {studentCount}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Personal Info */}
            <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-5">
                        <BookOpen className="w-4 h-4 text-gray-500" />
                        <h2 className="font-semibold text-sm text-gray-900 dark:text-white">Personal Information</h2>
                    </div>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</Label>
                                <Input
                                    className="h-11"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</Label>
                                <Input
                                    className="h-11"
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</Label>
                            <div className="relative">
                                <Input className="h-11 bg-gray-50 dark:bg-gray-800/50 pr-10" value={formData.email} disabled />
                                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            </div>
                            <p className="text-[10px] text-gray-400">Email cannot be changed. Contact admin.</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bio</Label>
                            <textarea
                                rows={3}
                                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
                        </div>
                        <Button
                            type="submit"
                            size="sm"
                            className={`transition-all duration-300 ${saved ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                        >
                            {saved ? '✓ Saved' : 'Save Changes'}
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
                                <p className="text-xs text-gray-400 mt-0.5">Alerts for student activity and uploads</p>
                            </div>
                            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                        </div>
                        <div className="h-px bg-gray-100 dark:bg-gray-800" />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {darkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
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
                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confirm</Label>
                                <Input
                                    type="password"
                                    className="h-11"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400">Minimum 8 characters</p>
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

export default TeacherProfile;
