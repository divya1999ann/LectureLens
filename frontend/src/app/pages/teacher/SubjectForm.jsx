import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent } from '../../components/ui/card';
import { coursesAPI, getErrorMessage } from '../../services/api';

const SubjectForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState({ title: '', description: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isEditing) return;
        const fetchSubject = async () => {
            try {
                const { data } = await coursesAPI.get(id);
                setFormData({ title: data.title || '', description: data.description || '' });
            } catch (err) {
                setError(getErrorMessage(err));
            }
        };
        fetchSubject();
    }, [id, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isEditing) {
                await coursesAPI.update(id, formData);
            } else {
                await coursesAPI.create(formData);
            }
            navigate('/teacher/subjects');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/teacher/subjects')}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {isEditing ? 'Edit Subject' : 'Create New Subject'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {isEditing ? 'Update subject details' : 'Add a new subject to your teaching list'}
                    </p>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject Name</label>
                            <Input
                                placeholder="e.g. Intro to Machine Learning"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                            <Textarea
                                placeholder="Brief description of the course content..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <Button type="button" variant="outline" onClick={() => navigate('/teacher/subjects')}>Cancel</Button>
                            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                                {loading ? 'Saving...' : isEditing ? 'Update Subject' : 'Create Subject'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default SubjectForm;
