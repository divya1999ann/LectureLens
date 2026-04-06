import React, { useState, useEffect } from 'react';
import { UserPlus, Search, GraduationCap, BookOpen, AlertCircle, RefreshCw, X } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { usersAPI, authAPI, coursesAPI, getErrorMessage } from '../../services/api';

// ─── Add Student Modal ────────────────────────────────────────────────────────

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

// ─── Assign Subjects Modal ────────────────────────────────────────────────────

const AssignSubjectsModal = ({ open, onOpenChange, student }) => {
    const [courses, setCourses] = useState([]);
    const [enrolled, setEnrolled] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open || !student) return;
        setError('');
        setSelected([]);
        setLoading(true);

        Promise.all([
            coursesAPI.list(),
            // Fetch all courses that this student is enrolled in by checking each
            // We do this by getting enrolled students per course — instead we
            // use the student's enrolled_subjects from their profile if available,
            // or fall back to checking each course. Since we expose the endpoint
            // per-course, we collect all courses first then filter client-side.
        ])
            .then(async ([{ data: allCourses }]) => {
                const courseList = allCourses.results ?? allCourses;
                setCourses(courseList);

                // Fetch enrolled students for each course to know which ones
                // already include this student
                const enrolledChecks = await Promise.all(
                    courseList.map((c) =>
                        coursesAPI.getStudents(c.id).then(({ data }) => ({
                            courseId: c.id,
                            isEnrolled: data.some((s) => s.id === student.id),
                        }))
                    )
                );
                const alreadyEnrolled = enrolledChecks
                    .filter((r) => r.isEnrolled)
                    .map((r) => r.courseId);
                setEnrolled(alreadyEnrolled);
            })
            .catch((err) => setError(getErrorMessage(err)))
            .finally(() => setLoading(false));
    }, [open, student]);

    const toggle = (courseId) => {
        setSelected((prev) =>
            prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
        );
    };

    const handleAssign = async () => {
        if (selected.length === 0) return;
        setSaving(true);
        setError('');
        try {
            await Promise.all(
                selected.map((courseId) =>
                    coursesAPI.assignStudents(courseId, [student.id])
                )
            );
            setEnrolled((prev) => [...new Set([...prev, ...selected])]);
            setSelected([]);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleRemove = async (courseId) => {
        try {
            await coursesAPI.removeStudent(courseId, student.id);
            setEnrolled((prev) => prev.filter((id) => id !== courseId));
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const unenrolledCourses = courses.filter((c) => !enrolled.includes(c.id));
    const enrolledCourses = courses.filter((c) => enrolled.includes(c.id));

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        Assign Subjects — {student?.full_name || student?.email}
                    </DialogTitle>
                </DialogHeader>

                {error && (
                    <p className="text-sm text-red-500 px-1">{error}</p>
                )}

                {loading ? (
                    <div className="space-y-2 py-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-12 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-5 pt-1">
                        {/* Currently enrolled */}
                        {enrolledCourses.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Enrolled Subjects
                                </Label>
                                <div className="space-y-1.5">
                                    {enrolledCourses.map((c) => (
                                        <div
                                            key={c.id}
                                            className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{c.title}</p>
                                                <p className="text-xs text-gray-400">{c.teacher_email}</p>
                                            </div>
                                            <button
                                                onClick={() => handleRemove(c.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                                title="Remove from subject"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Available to assign */}
                        {unenrolledCourses.length > 0 ? (
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    Available Subjects
                                </Label>
                                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                    {unenrolledCourses.map((c) => {
                                        const isSelected = selected.includes(c.id);
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => toggle(c.id)}
                                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-left transition-all ${
                                                    isSelected
                                                        ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
                                                        : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-200'
                                                }`}
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{c.title}</p>
                                                    <p className="text-xs text-gray-400">{c.teacher_email}</p>
                                                </div>
                                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                                                    isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 dark:border-gray-500'
                                                }`}>
                                                    {isSelected && (
                                                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                                                            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            enrolledCourses.length === 0 && (
                                <p className="text-sm text-center text-gray-400 py-4">No subjects available.</p>
                            )
                        )}

                        <div className="flex gap-3 pt-1">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                                Close
                            </Button>
                            <Button
                                type="button"
                                onClick={handleAssign}
                                disabled={selected.length === 0 || saving}
                                className="flex-1"
                            >
                                {saving ? 'Assigning...' : `Assign${selected.length > 0 ? ` (${selected.length})` : ''}`}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [studentSubjects, setStudentSubjects] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [addOpen, setAddOpen] = useState(false);
    const [assignStudent, setAssignStudent] = useState(null);

    const fetchStudents = async () => {
        setLoading(true);
        setError('');
        try {
            const [{ data: usersData }, { data: coursesData }] = await Promise.all([
                usersAPI.list('STUDENT'),
                coursesAPI.list(),
            ]);
            const studentList = usersData.results ?? usersData;
            const courseList = coursesData.results ?? coursesData;

            // Fetch enrolled students for all courses in parallel, build reverse map
            const enrollments = await Promise.all(
                courseList.map(c =>
                    coursesAPI.getStudents(c.id).then(({ data }) => ({ course: c, students: data }))
                )
            );
            const map = {};
            studentList.forEach(s => { map[s.id] = []; });
            enrollments.forEach(({ course, students: enrolled }) => {
                enrolled.forEach(s => {
                    if (map[s.id]) map[s.id] = [...map[s.id], course];
                });
            });

            setStudents(studentList);
            setStudentSubjects(map);
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
                    {filtered.map(student => {
                        const subjects = studentSubjects[student.id] || [];
                        return (
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

                                    {/* Enrolled subjects */}
                                    <div className="mb-3">
                                        {subjects.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {subjects.map(s => (
                                                    <span key={s.id} className="inline-flex items-center gap-1 text-[11px] bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-md font-medium">
                                                        <BookOpen className="w-2.5 h-2.5" />
                                                        {s.title}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">Not enrolled in any subject</p>
                                        )}
                                    </div>

                                    <p className="text-xs text-gray-400 mb-3">
                                        Joined {new Date(student.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full gap-1.5 text-xs"
                                        onClick={() => setAssignStudent(student)}
                                    >
                                        <BookOpen className="w-3.5 h-3.5" />
                                        Assign Subjects
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
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
            <AssignSubjectsModal
                open={!!assignStudent}
                onOpenChange={(open) => { if (!open) { setAssignStudent(null); fetchStudents(); } }}
                student={assignStudent}
            />
        </div>
    );
};

export default AdminStudents;
