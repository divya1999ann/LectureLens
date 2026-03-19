import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
    ArrowLeft, FileAudio, FileText, Download, Trash2, Edit2, Play, Pause, Save, MoreHorizontal
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { ScrollArea } from '../../components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { lecturesAPI, getErrorMessage } from '../../services/api';

const TeacherLectureDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lecture, setLecture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLecture = async () => {
            try {
                setLoading(true);
                const { data } = await lecturesAPI.get(id);
                setLecture(data);
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };
        fetchLecture();
    }, [id]);

    const [activeTab, setActiveTab] = useState('overview');
    const [isPlaying, setIsPlaying] = useState(false);

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error || !lecture) return <div className="p-8 text-center">{error || 'Lecture not found'}</div>;

    // Audio files from lecture materials
    const audioFiles = lecture.has_audio ? [{ id: 1, name: `${lecture.title}_Audio`, size: 'N/A' }] : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/teacher/lectures')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{lecture.title}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">{lecture.subject_title}</span>
                        <span>•</span>
                        <span>{new Date(lecture.lecture_date).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* General Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Lecture Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Subject</span>
                                        <p className="font-medium">{lecture.subject_title}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Date</span>
                                        <p className="font-medium">{new Date(lecture.lecture_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {lecture.summary && (
                                    <div className="pt-4 border-t">
                                        <span className="text-gray-500 text-sm">Description</span>
                                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                            {lecture.summary}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Audio Files */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Audio Files</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {audioFiles.map(file => (
                                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-400">
                                                <FileAudio className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{file.name}</p>
                                                <p className="text-xs text-gray-500">{file.duration} • {file.size}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600">
                                                <Play className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-green-600">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem className="text-red-600">
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Remove
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                </TabsContent>

                {/* Edit Tab */}
                <TabsContent value="edit">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Lecture Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Lecture Title</Label>
                                <Input defaultValue={lecture.title} />
                            </div>
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Input disabled defaultValue={lecture.subject_title} />
                            </div>
                            <div className="space-y-2">
                                <Label>Summary</Label>
                                <Textarea rows={4} defaultValue={lecture.summary || 'No summary'} />
                            </div>
                            <div className="flex justify-end pt-4 border-t">
                                <Button className="bg-green-600 hover:bg-green-700">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default TeacherLectureDetail;
