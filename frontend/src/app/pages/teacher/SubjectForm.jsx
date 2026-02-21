import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Check, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent } from '../../components/ui/card';
import { mockSubjects } from '../../utils/mockData';

const SubjectForm = () => {
    const { id } = useParams(); // Should contain subject ID if editing
    const navigate = useNavigate();
    const isEditing = !!id;

    const initialData = isEditing
        ? mockSubjects.find(s => s.id === parseInt(id)) || {}
        : { name: '', code: '', description: '', duration: '', students: [] };

    const [formData, setFormData] = useState(initialData);

    const mockAvailableStudents = [
        { id: 101, name: 'John Student' },
        { id: 102, name: 'Jane Doe' },
        { id: 103, name: 'Alex Smith' },
        { id: 104, name: 'Emily Davis' }
    ];

    const handleStudentToggle = (studentId) => {
        const current = formData.students || [];
        const updated = current.includes(studentId)
            ? current.filter(id => id !== studentId)
            : [...current, studentId];
        setFormData({ ...formData, students: updated });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, this would call an API
        console.log('Submitted:', formData);
        navigate('/teacher/subjects');
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
                        {isEditing ? `Edit details for ${formData.code}` : 'Add a new subject to your teaching list'}
                    </p>
                </div>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject Name</label>
                                <Input
                                    placeholder="e.g. Intro to Machine Learning"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject Code</label>
                                <Input
                                    placeholder="e.g. CS601"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    required
                                />
                            </div>
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration / Semester</label>
                            <Input
                                placeholder="e.g. Spring 2024 (16 weeks)"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Student Enrollment</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                                {mockAvailableStudents.map(student => {
                                    const isSelected = (formData.students || []).includes(student.id);
                                    return (
                                        <div
                                            key={student.id}
                                            onClick={() => handleStudentToggle(student.id)}
                                            className={`flex items-center justify-between p-3 rounded-md cursor-pointer border transition-all ${isSelected
                                                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                                    : 'bg-white border-transparent hover:border-gray-300 dark:bg-gray-700 dark:hover:border-gray-600'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-full ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                                    <Users className="w-4 h-4" />
                                                </div>
                                                <span className={`text-sm font-medium ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'}`}>
                                                    {student.name}
                                                </span>
                                            </div>
                                            {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-gray-500">Select students to enroll in this course.</p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <Button type="button" variant="outline" onClick={() => navigate('/teacher/subjects')}>Cancel</Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                                {isEditing ? 'Update Subject' : 'Create Subject'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default SubjectForm;
