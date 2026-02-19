import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
    ArrowLeft, BookOpen, Users, UserPlus, X, ChevronDown, ChevronUp,
    GraduationCap, Search, Check, Presentation
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
    mockSubjects, mockTeachers, mockStudents, mockEnrollments, mockLectures
} from '../../utils/mockData';

const AdminSubjects = () => {
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState(mockEnrollments);
    const [expandedSubject, setExpandedSubject] = useState(null);
    const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
    const [enrollTarget, setEnrollTarget] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [addSubjectOpen, setAddSubjectOpen] = useState(false);
    const [newSubject, setNewSubject] = useState({ name: '', code: '', instructorId: '', semester: 'Spring 2024' });

    const getEnrolledStudents = (subjectId) => {
        const studentIds = enrollments.filter(e => e.subjectId === subjectId).map(e => e.studentId);
        return mockStudents.filter(s => studentIds.includes(s.id));
    };

    const getUnenrolledStudents = (subjectId) => {
        const enrolledIds = enrollments.filter(e => e.subjectId === subjectId).map(e => e.studentId);
        return mockStudents.filter(s => !enrolledIds.includes(s.id));
    };

    const enrollStudent = (subjectId, studentId) => {
        setEnrollments([...enrollments, { subjectId, studentId }]);
    };

    const unenrollStudent = (subjectId, studentId) => {
        setEnrollments(enrollments.filter(e => !(e.subjectId === subjectId && e.studentId === studentId)));
    };

    const openEnrollDialog = (subjectId) => {
        setEnrollTarget(subjectId);
        setSearchQuery('');
        setEnrollDialogOpen(true);
    };

    const filteredUnenrolled = enrollTarget ?
        getUnenrolledStudents(enrollTarget).filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase())
        ) : [];

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')} className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Manage Subjects</h1>
                    <p className="text-sm text-gray-500 mt-1">View subjects, assign teachers, and manage student enrollments</p>
                </div>
                <Button size="sm" onClick={() => setAddSubjectOpen(true)} className="gap-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    Add Subject
                </Button>
            </div>

            {/* Subject Cards */}
            <div className="space-y-4">
                {mockSubjects.map(subject => {
                    const isExpanded = expandedSubject === subject.id;
                    const enrolled = getEnrolledStudents(subject.id);
                    const lectureCount = mockLectures.filter(l => l.subjectId === subject.id).length;
                    const teacher = mockTeachers.find(t => t.id === subject.instructorId);

                    return (
                        <Card
                            key={subject.id}
                            className={`overflow-hidden transition-all duration-300 ${isExpanded
                                    ? 'shadow-lg border-blue-200 dark:border-blue-800/50 ring-1 ring-blue-100 dark:ring-blue-900/30'
                                    : 'border-gray-100 dark:border-gray-800 hover:shadow-md'
                                }`}
                        >
                            {/* Subject Header */}
                            <button
                                onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                                className="w-full text-left"
                            >
                                <CardContent className="p-5 flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors duration-300 ${isExpanded ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        }`}>
                                        <BookOpen className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0.5">{subject.code}</Badge>
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{subject.name}</h3>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {teacher?.name || 'Unassigned'}
                                            </span>
                                            <span>{subject.semester}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">{enrolled.length}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Students</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">{lectureCount}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Lectures</p>
                                        </div>
                                        <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                </CardContent>
                            </button>

                            {/* Expanded: Enrolled Students */}
                            {isExpanded && (
                                <div className="border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2 duration-300">
                                    <div className="p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4 text-emerald-500" />
                                                Enrolled Students ({enrolled.length})
                                            </h4>
                                            <Button size="sm" variant="outline" onClick={() => openEnrollDialog(subject.id)} className="gap-2 text-xs h-8">
                                                <UserPlus className="w-3.5 h-3.5" />
                                                Enroll Student
                                            </Button>
                                        </div>

                                        {enrolled.length === 0 ? (
                                            <div className="text-center py-8 text-gray-400 border-dashed border-2 border-gray-200 dark:border-gray-700 rounded-xl">
                                                <GraduationCap className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                                <p className="text-sm font-medium">No students enrolled</p>
                                                <p className="text-xs mt-1">Click "Enroll Student" to add students</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                {enrolled.map(student => (
                                                    <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 transition-colors">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                                                {student.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-sm text-gray-900 dark:text-white">{student.name}</p>
                                                                <p className="text-xs text-gray-400">{student.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">{student.year}</Badge>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-gray-400 hover:text-red-500"
                                                                onClick={() => unenrollStudent(subject.id, student.id)}
                                                                title="Unenroll"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Enroll Student Dialog */}
            <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Enroll Student — {mockSubjects.find(s => s.id === enrollTarget)?.code}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search students by name or email..."
                                className="pl-9 h-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="max-h-64 overflow-y-auto space-y-1">
                            {filteredUnenrolled.length === 0 ? (
                                <div className="text-center py-6 text-gray-400">
                                    <p className="text-sm">{searchQuery ? 'No matching students' : 'All students are enrolled'}</p>
                                </div>
                            ) : (
                                filteredUnenrolled.map(student => (
                                    <button
                                        key={student.id}
                                        onClick={() => {
                                            enrollStudent(enrollTarget, student.id);
                                        }}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors text-left group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 font-bold text-xs group-hover:bg-blue-100 group-hover:text-blue-600 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400 transition-colors">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-gray-900 dark:text-white">{student.name}</p>
                                                <p className="text-xs text-gray-400">{student.email} · {student.year}</p>
                                            </div>
                                        </div>
                                        <UserPlus className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add Subject Dialog */}
            <Dialog open={addSubjectOpen} onOpenChange={setAddSubjectOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Subject</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); setAddSubjectOpen(false); alert('Subject created!'); }} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Subject Code</Label>
                            <Input placeholder="e.g. CS606" value={newSubject.code} onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Subject Name</Label>
                            <Input placeholder="e.g. Data Structures" value={newSubject.name} onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Assign Teacher</Label>
                            <Select value={newSubject.instructorId} onValueChange={(val) => setNewSubject({ ...newSubject, instructorId: val })}>
                                <SelectTrigger className="h-10">
                                    <SelectValue placeholder="Select a teacher..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockTeachers.map(t => (
                                        <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Semester</Label>
                            <Input placeholder="e.g. Spring 2024" value={newSubject.semester} onChange={(e) => setNewSubject({ ...newSubject, semester: e.target.value })} />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="outline" onClick={() => setAddSubjectOpen(false)} className="flex-1">Cancel</Button>
                            <Button type="submit" className="flex-1">Create Subject</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminSubjects;
