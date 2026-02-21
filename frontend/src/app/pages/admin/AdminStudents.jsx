import React, { useState } from 'react';
import {
    UserPlus, Search, Trash2, GraduationCap, BookOpen, X, Check
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { mockStudents, mockSubjects, mockEnrollments } from '../../utils/mockData';

const AddStudentModal = ({ open, onOpenChange, onAdd }) => {
    const [formData, setFormData] = useState({ name: '', email: '', department: '', year: '1st Year' });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        setFormData({ name: '', email: '', department: '', year: '1st Year' });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</Label>
                        <Input className="h-11" placeholder="e.g. Alex Johnson" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</Label>
                        <Input className="h-11" type="email" placeholder="alex@student.edu" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</Label>
                        <Input className="h-11" placeholder="e.g. Computer Science" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Year</Label>
                        <Select value={formData.year} onValueChange={(val) => setFormData({ ...formData, year: val })}>
                            <SelectTrigger className="h-11">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => (
                                    <SelectItem key={y} value={y}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancel</Button>
                        <Button type="submit" className="flex-1">Add Student</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const AdminStudents = () => {
    const [students, setStudents] = useState(mockStudents);
    const [enrollments, setEnrollments] = useState(mockEnrollments);
    const [searchQuery, setSearchQuery] = useState('');
    const [addOpen, setAddOpen] = useState(false);
    const [enrollOpen, setEnrollOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [subjectSearch, setSubjectSearch] = useState('');

    const handleAddStudent = (formData) => {
        const newStudent = {
            id: students.length + 200,
            ...formData
        };
        setStudents([...students, newStudent]);
    };

    const handleDeleteStudent = (id) => {
        if (confirm('Remove this student?')) {
            setStudents(students.filter(s => s.id !== id));
            setEnrollments(enrollments.filter(e => e.studentId !== id));
        }
    };

    const getStudentSubjects = (studentId) => {
        const subjectIds = enrollments.filter(e => e.studentId === studentId).map(e => e.subjectId);
        return mockSubjects.filter(s => subjectIds.includes(s.id));
    };

    const enrollInSubject = (studentId, subjectId) => {
        if (!enrollments.find(e => e.studentId === studentId && e.subjectId === subjectId)) {
            setEnrollments([...enrollments, { studentId, subjectId }]);
        }
    };

    const unenrollFromSubject = (studentId, subjectId) => {
        setEnrollments(enrollments.filter(e => !(e.studentId === studentId && e.subjectId === subjectId)));
    };

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.department || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openEnrollDialog = (student) => {
        setSelectedStudent(student);
        setSubjectSearch('');
        setEnrollOpen(true);
    };

    const studentSubjects = selectedStudent ? getStudentSubjects(selectedStudent.id) : [];
    const enrolledSubjectIds = studentSubjects.map(s => s.id);
    const filteredSubjects = mockSubjects.filter(s =>
    (s.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        s.code.toLowerCase().includes(subjectSearch.toLowerCase()))
    );

    const yearColor = {
        '1st Year': 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        '2nd Year': 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
        '3rd Year': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
        '4th Year': 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Students</h1>
                    <p className="text-sm text-gray-500 mt-1">{students.length} students in the system</p>
                </div>
                <Button onClick={() => setAddOpen(true)} className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add Student
                </Button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                    placeholder="Search students by name, email, or department..."
                    className="pl-9 h-11 bg-white dark:bg-gray-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(student => {
                    const subjects = getStudentSubjects(student.id);
                    return (
                        <Card key={student.id} className="border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{student.name}</h3>
                                            <p className="text-xs text-gray-400 mt-0.5">{student.email}</p>
                                        </div>
                                    </div>
                                    <Badge className={`text-[10px] border-none font-semibold px-2 ${yearColor[student.year] || 'bg-gray-100 text-gray-600'}`}>
                                        {student.year}
                                    </Badge>
                                </div>

                                {/* Department */}
                                <p className="text-xs text-gray-500 mb-3">
                                    <span className="font-medium">Dept:</span> {student.department || '—'}
                                </p>

                                {/* Enrolled Subjects */}
                                <div className="mb-4">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-2">
                                        Enrolled Subjects ({subjects.length})
                                    </p>
                                    {subjects.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {subjects.map(s => (
                                                <Badge key={s.id} variant="secondary" className="text-[10px] px-2 py-0.5 font-medium gap-1 group/badge">
                                                    {s.code}
                                                    <button
                                                        onClick={() => unenrollFromSubject(student.id, s.id)}
                                                        className="ml-0.5 opacity-0 group-hover/badge:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                                                    >
                                                        <X className="w-2.5 h-2.5" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">Not enrolled in any subjects</p>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 text-xs gap-1.5 h-8"
                                        onClick={() => openEnrollDialog(student)}
                                    >
                                        <BookOpen className="w-3 h-3" />
                                        Manage Enrolment
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteStudent(student.id)}
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
                    <div className="col-span-3 text-center py-16 text-gray-400">
                        <GraduationCap className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="font-medium">No students found</p>
                        <p className="text-sm mt-1">Try adjusting your search or add a new student</p>
                    </div>
                )}
            </div>

            {/* Add Student Modal */}
            <AddStudentModal open={addOpen} onOpenChange={setAddOpen} onAdd={handleAddStudent} />

            {/* Enrolment Management Dialog */}
            <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Manage Enrolment — {selectedStudent?.name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search subjects..."
                                className="pl-9 h-10"
                                value={subjectSearch}
                                onChange={(e) => setSubjectSearch(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5 max-h-72 overflow-y-auto">
                            {filteredSubjects.map(subject => {
                                const isEnrolled = enrolledSubjectIds.includes(subject.id);
                                return (
                                    <button
                                        key={subject.id}
                                        onClick={() => {
                                            if (isEnrolled) {
                                                unenrollFromSubject(selectedStudent.id, subject.id);
                                            } else {
                                                enrollInSubject(selectedStudent.id, subject.id);
                                            }
                                        }}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left border ${isEnrolled
                                                ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30'
                                                : 'bg-gray-50/50 dark:bg-gray-800/30 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                                            }`}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0.5">{subject.code}</Badge>
                                                <span className="font-medium text-sm text-gray-900 dark:text-white">{subject.name}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">{subject.instructor} · {subject.semester}</p>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors ${isEnrolled
                                                ? 'bg-emerald-500 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                            }`}>
                                            {isEnrolled ? <Check className="w-3.5 h-3.5" /> : null}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <Button className="w-full" onClick={() => setEnrollOpen(false)}>Done</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminStudents;
