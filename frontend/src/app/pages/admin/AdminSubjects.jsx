import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, BookOpen, AlertCircle, RefreshCw, Presentation } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { coursesAPI, getErrorMessage } from '../../services/api';

const AddSubjectModal = ({ open, onOpenChange, onAdded }) => {
    const [formData, setFormData] = useState({ title: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await coursesAPI.create(formData);
            setFormData({ title: '', description: '' });
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
                    <DialogTitle>Add New Subject</DialogTitle>
                </DialogHeader>
                {error && <p className="text-sm text-red-500 px-1">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label>Subject Name</Label>
                        <Input placeholder="e.g. Introduction to Machine Learning" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea placeholder="Brief description of the course..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancel</Button>
                        <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Creating...' : 'Create Subject'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const AdminSubjects = () => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [addOpen, setAddOpen] = useState(false);

    const fetchSubjects = async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await coursesAPI.list();
            setSubjects(data.results ?? data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSubjects(); }, []);

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10 animate-in fade-in duration-500">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')} className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Manage Subjects</h1>
                    <p className="text-sm text-gray-500 mt-1">{loading ? '...' : `${subjects.length} subjects in the system`}</p>
                </div>
                <Button size="sm" onClick={() => setAddOpen(true)} className="gap-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    Add Subject
                </Button>
            </div>

            {error && (
                <div className="flex items-center justify-between gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
                    <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</span>
                    <Button variant="ghost" size="sm" onClick={fetchSubjects} className="gap-1 text-red-600 hover:text-red-700">
                        <RefreshCw className="w-3.5 h-3.5" /> Retry
                    </Button>
                </div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="animate-pulse"><CardContent className="p-5 h-20" /></Card>
                    ))}
                </div>
            ) : subjects.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <BookOpen className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="font-medium">No subjects yet</p>
                    <p className="text-sm mt-1">Click "Add Subject" to create the first one</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {subjects.map(subject => (
                        <Card key={subject.id} className="border-gray-100 dark:border-gray-800 hover:shadow-md transition-all duration-300">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{subject.title}</h3>
                                    <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                                        <span>{subject.teacher_email || 'No teacher'}</span>
                                        <span className="flex items-center gap-1">
                                            <Presentation className="w-3 h-3" />
                                            {subject.lecture_count ?? 0} lectures
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-400 shrink-0">
                                    {new Date(subject.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <AddSubjectModal open={addOpen} onOpenChange={setAddOpen} onAdded={fetchSubjects} />
        </div>
    );
};

export default AdminSubjects;
