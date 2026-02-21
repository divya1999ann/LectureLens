import React, { useState } from 'react';
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
import { mockLectures, mockSubjects, sampleTranscript } from '../../utils/mockData';

const TeacherLectureDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const lecture = mockLectures.find(l => l.id === parseInt(id));
    const subject = mockSubjects.find(s => s.id === lecture?.subjectId);

    const [activeTab, setActiveTab] = useState('overview');
    const [isPlaying, setIsPlaying] = useState(false);

    if (!lecture) return <div className="p-8 text-center">Lecture not found</div>;

    // Mock file lists based on flags
    const audioFiles = [
        { id: 1, name: `${lecture.title}_Part1.mp3`, size: '45.2 MB', duration: '45:20' }
    ];
    if (lecture.hasPPT) {
        // audioFiles logic is okay, just focusing on slides/notes
    }

    const slidesFiles = lecture.hasPPT ? [{ id: 1, name: `${lecture.title}_Slides.pdf`, size: '2.4 MB' }] : [];
    const notesFiles = lecture.hasNotes ? [{ id: 1, name: `${lecture.title}_Notes.docx`, size: '1.1 MB' }] : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/teacher/lectures')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{lecture.title}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">{subject?.code}</span>
                        <span>•</span>
                        <span>Lecture {lecture.number}</span>
                        <span>•</span>
                        <span>{new Date(lecture.date).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="ml-auto flex gap-2">
                    <Badge variant={lecture.status === 'Processed' ? 'default' : 'secondary'}>
                        {lecture.status}
                    </Badge>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    {lecture.hasTranscript && <TabsTrigger value="transcript">Transcript</TabsTrigger>}
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
                                        <p className="font-medium">{subject?.name} ({subject?.code})</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Date</span>
                                        <p className="font-medium">{new Date(lecture.date).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Duration</span>
                                        <p className="font-medium">45 min</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Transcript Status</span>
                                        <p className="font-medium">{lecture.hasTranscript ? 'Ready' : 'Processing'}</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t">
                                    <span className="text-gray-500 text-sm">Description</span>
                                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                        This lecture covers the fundamental concepts of {lecture.title}, exploring key algorithms and practical applications in modern systems.
                                    </p>
                                </div>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Slides */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg">Presentation Slides</CardTitle>
                                <Button variant="outline" size="sm">
                                    <Edit2 className="w-3 h-3 mr-2" />
                                    Manage
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {slidesFiles.length > 0 ? (
                                    slidesFiles.map(file => (
                                        <div key={file.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/20">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{file.name}</p>
                                                    <p className="text-xs text-gray-500">{file.size}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-orange-600">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-gray-500 border-dashed border-2 rounded-lg">
                                        No slides uploaded
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Additional Notes */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg">Additional Notes</CardTitle>
                                <Button variant="outline" size="sm">
                                    <Edit2 className="w-3 h-3 mr-2" />
                                    Manage
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {notesFiles.length > 0 ? (
                                    notesFiles.map(file => (
                                        <div key={file.id} className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{file.name}</p>
                                                    <p className="text-xs text-gray-500">{file.size}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-purple-600">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-6 text-gray-500 border-dashed border-2 rounded-lg">
                                        No notes uploaded
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Transcript Tab */}
                <TabsContent value="transcript">
                    <Card className="h-[600px] flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between py-3 border-b">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">Lecture Transcript</CardTitle>
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Auto-Generated</Badge>
                            </div>
                            <div className="flex gap-2">
                                <Input placeholder="Search within transcript..." className="h-8 w-64" />
                                <Button variant="outline" size="sm">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 overflow-hidden">
                            <ScrollArea className="h-full p-6">
                                <div className="prose dark:prose-invert max-w-none space-y-4">
                                    {sampleTranscript.split('\n\n').map((paragraph, idx) => (
                                        <p key={idx} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Edit Tab */}
                <TabsContent value="edit">
                    <Card>
                        <CardHeader>
                            <CardTitle>Edit Lecture Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Lecture Title</Label>
                                    <Input defaultValue={lecture.title} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Lecture Number</Label>
                                    <Input type="number" defaultValue={lecture.number} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input type="date" defaultValue={lecture.date} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Subject</Label>
                                    <Input disabled defaultValue={`${subject?.code} - ${subject?.name}`} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea rows={4} defaultValue={`This lecture covers the fundamental concepts of ${lecture.title}...`} />
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
