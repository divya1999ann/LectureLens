import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
    UserPlus, Edit, Trash2, Search, Mail, Calendar, BookOpen, Users, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { mockTeachers, mockSubjects, mockEnrollments } from '../../utils/mockData';

const AddTeacherModal = ({ open, onOpenChange, onAdd }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        setFormData({ name: '', email: '', password: '', department: '' });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Teacher</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</Label>
                        <Input className="h-11" placeholder="Dr. Jane Smith" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</Label>
                        <Input className="h-11" type="email" placeholder="jane.smith@university.edu" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Initial Password</Label>
                        <Input className="h-11" type="password" placeholder="Minimum 8 characters" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</Label>
                        <Input className="h-11" placeholder="e.g. Computer Science" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancel</Button>
                        <Button type="submit" className="flex-1">Add Teacher</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const AdminTeachers = () => {
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState(mockTeachers);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const handleAddTeacher = (newTeacher) => {
        setTeachers([...teachers, {
            id: teachers.length + 10,
            ...newTeacher,
            subjects: 0,
            students: 0,
            joinedDate: new Date().toISOString().split('T')[0],
            status: 'active'
        }]);
    };

    const toggleStatus = (id) => {
        setTeachers(teachers.map(t =>
            t.id === id ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' } : t
        ));
    };

    const deleteTeacher = (id) => {
        if (confirm('Remove this teacher?')) {
            setTeachers(teachers.filter(t => t.id !== id));
        }
    };

    const filtered = teachers.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.department || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Teachers</h1>
                    <p className="text-sm text-gray-500 mt-1">{teachers.length} teachers in the system</p>
                </div>
                <Button onClick={() => setModalOpen(true)} className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add Teacher
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search teachers by name, email, or department..."
                    className="pl-9 h-11 bg-white dark:bg-gray-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Teacher Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map(teacher => {
                    const teacherSubjects = mockSubjects.filter(s => s.instructorId === teacher.id);
                    const totalStudents = teacherSubjects.reduce((sum, s) => {
                        return sum + mockEnrollments.filter(e => e.subjectId === s.id).length;
                    }, 0);

                    return (
                        <Card key={teacher.id} className="border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                            {teacher.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white">{teacher.name}</h3>
                                            <p className="text-xs text-gray-500 mt-0.5">{teacher.department || 'No department'}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <Mail className="w-3 h-3 text-gray-400" />
                                                <span className="text-xs text-gray-400">{teacher.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => toggleStatus(teacher.id)}>
                                        <Badge
                                            variant={teacher.status === 'active' ? 'default' : 'secondary'}
                                            className={`text-[10px] cursor-pointer ${teacher.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none' : ''}`}
                                        >
                                            {teacher.status}
                                        </Badge>
                                    </button>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <div className="text-center">
                                        <p className="text-base font-bold text-gray-900 dark:text-white">{teacherSubjects.length}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Subjects</p>
                                    </div>
                                    <div className="text-center border-x border-gray-100 dark:border-gray-800">
                                        <p className="text-base font-bold text-gray-900 dark:text-white">{totalStudents}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Students</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] font-semibold text-gray-500 mt-0.5 pt-0.5">
                                            {new Date(teacher.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Joined</p>
                                    </div>
                                </div>

                                {/* Subjects taught */}
                                {teacherSubjects.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {teacherSubjects.map(s => (
                                            <Badge key={s.id} variant="secondary" className="text-[10px] px-2 py-0.5 font-medium">{s.code}</Badge>
                                        ))}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <Button variant="outline" size="sm" className="flex-1 text-xs gap-1.5 h-8">
                                        <Edit className="w-3 h-3" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteTeacher(teacher.id)}
                                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
                {filtered.length === 0 && (
                    <div className="col-span-2 text-center py-16 text-gray-400">
                        <Users className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="font-medium">No teachers found</p>
                        <p className="text-sm mt-1">Try adjusting your search</p>
                    </div>
                )}
            </div>

            <AddTeacherModal open={modalOpen} onOpenChange={setModalOpen} onAdd={handleAddTeacher} />
        </div>
    );
};

export default AdminTeachers;
