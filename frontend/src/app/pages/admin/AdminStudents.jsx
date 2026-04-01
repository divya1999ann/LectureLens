import React, { useState, useEffect } from 'react';
import { UserPlus, Search, GraduationCap, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { usersAPI, authAPI, getErrorMessage } from '../../services/api';

const AddStudentModal = ({ open, onOpenChange, onAdded }) => {
    const [formData, setFormData] = useState({ full_name: '', email: '', password: '', password_confirm: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authAPI.register({ ...formData, role: 'STUDENT' });
            setFormData({ full_name: '', email: '', password: '', password_confirm: '' });
            onOpenChange(false);
            onAdded();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                </DialogHeader>
                {error && <p className="text-sm text-red-500 px-1">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</Label>
                        <Input className="h-11" placeholder="e.g. Alex Johnson" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</Label>
                        <Input className="h-11" type="email" placeholder="alex@student.edu" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</Label>
                        <Input className="h-11" type="password" placeholder="Minimum 8 characters" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confirm Password</Label>
                        <Input className="h-11" type="password" placeholder="Repeat password" value={formData.password_confirm} onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })} required />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancel</Button>
                        <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Adding...' : 'Add Student'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const AdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [addOpen, setAddOpen] = useState(false);

    const fetchStudents = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await usersAPI.list('STUDENT');
            setStudents(data.results ?? data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStudents(); }, []);

    const filtered = students.filter(s =>
        (s.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Students</h1>
                    <p className="text-sm text-gray-500 mt-1">{loading ? '...' : `${students.length} students in the system`}</p>
                </div>
                <Button onClick={() => setAddOpen(true)} className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add Student
                </Button>
            </div>

            {error && (
                <div className="flex items-center justify-between gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
                    <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</span>
                    <Button variant="ghost" size="sm" onClick={fetchStudents} className="gap-1 text-red-600 hover:text-red-700">
                        <RefreshCw className="w-3.5 h-3.5" /> Retry
                    </Button>
                </div>
            )}

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search students by name or email..."
                    className="pl-9 h-11 bg-white dark:bg-gray-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse"><CardContent className="p-5 h-32" /></Card>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(student => (
                        <Card key={student.id} className="border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                                            {(student.full_name || student.email).charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{student.full_name || '—'}</h3>
                                            <p className="text-xs text-gray-400 mt-0.5">{student.email}</p>
                                        </div>
                                    </div>
                                    <Badge className={`text-[10px] border-none font-semibold px-2 ${student.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-gray-100 text-gray-500'}`}>
                                        {student.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-400">
                                    Joined {new Date(student.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                    {filtered.length === 0 && !loading && (
                        <div className="col-span-3 text-center py-16 text-gray-400">
                            <GraduationCap className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="font-medium">No students found</p>
                            <p className="text-sm mt-1">Try adjusting your search or add a new student</p>
                        </div>
                    )}
                </div>
            )}

            <AddStudentModal open={addOpen} onOpenChange={setAddOpen} onAdded={fetchStudents} />
        </div>
    );
};

export default AdminStudents;
