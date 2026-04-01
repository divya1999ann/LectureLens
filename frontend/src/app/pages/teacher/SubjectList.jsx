import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { coursesAPI, getErrorMessage } from '../../services/api';
import useAuthStore from '../../store/authStore';

const SubjectList = () => {
    const { user } = useAuthStore();
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                setLoading(true);
                const { data } = await coursesAPI.list(user?.id);
                setSubjects(data.results ?? data);
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };
        if (user?.id) {
            fetchSubjects();
        }
    }, [user?.id]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this subject? All its lectures will also be deleted. This cannot be undone.')) return;
        setDeleting(id);
        try {
            await coursesAPI.delete(id);
            setSubjects(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setDeleting(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subjects</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your teaching subjects</p>
                </div>
                <Link to="/teacher/subjects/new">
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create Subject
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle>All Subjects</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search subjects..."
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Subject Name</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Created</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="3" className="py-6 text-center text-gray-400">Loading...</td></tr>
                                ) : error ? (
                                    <tr><td colSpan="3" className="py-6 text-center text-red-500">{error}</td></tr>
                                ) : subjects.length === 0 ? (
                                    <tr><td colSpan="3" className="py-6 text-center text-gray-400">No subjects yet. Create one to get started!</td></tr>
                                ) : (
                                    subjects.map((subject) => (
                                        <tr key={subject.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{subject.title}</td>
                                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{new Date(subject.created_at).toLocaleDateString()}</td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link to={`/teacher/subjects/${subject.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600">
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-gray-500 hover:text-red-600"
                                                        disabled={deleting === subject.id}
                                                        onClick={() => handleDelete(subject.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SubjectList;
