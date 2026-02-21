import React from 'react';
import { Link } from 'react-router';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { mockSubjects } from '../../utils/mockData';

const SubjectList = () => {
    // Mock current teacher ID = 2
    const subjects = mockSubjects.filter(s => s.instructorId === 2);

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
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Code</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Subject Name</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Lectures</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Students</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subjects.map((subject) => (
                                    <tr key={subject.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">{subject.code}</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{subject.name}</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{subject.lectureCount}</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {subject.studentCount}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link to={`/teacher/subjects/${subject.id}/edit`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600">
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                </Link>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SubjectList;
