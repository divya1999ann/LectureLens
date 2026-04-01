import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
    ArrowLeft, FileAudio, Download, Trash2, Play, Save, MoreHorizontal,
    Sparkles, CheckCircle, AlertCircle, Loader2, RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Progress } from '../../components/ui/progress';
import { ScrollArea } from '../../components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { lecturesAPI, transcriptionsAPI, getErrorMessage } from '../../services/api';

const TeacherLectureDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lecture, setLecture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [saving, setSaving] = useState(false);

    // editData starts empty — populated once lecture loads
    const [editData, setEditData] = useState({ title: '', summary: '' });

    const [transcriptStatus, setTranscriptStatus] = useState(null); // null | 'not_started' | 'processing' | 'completed' | 'failed'
    const [transcriptStarting, setTranscriptStarting] = useState(false);
    const [transcriptError, setTranscriptError] = useState('');
    const pollRef = useRef(null);

    useEffect(() => {
        const fetchLecture = async () => {
            try {
                setLoading(true);
                const { data } = await lecturesAPI.get(id);
                setLecture(data);
                setEditData({ title: data.title, summary: data.summary || '' });
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };
        fetchLecture();
    }, [id]);

    // Fetch transcript status once lecture loads, then poll while processing
    useEffect(() => {
        if (!lecture) return;

        const fetchStatus = async () => {
            try {
                const { data } = await transcriptionsAPI.status(id);
                setTranscriptStatus(data.status);
                if (data.status === 'processing') {
                    pollRef.current = setTimeout(fetchStatus, 5000);
                }
            } catch {
                setTranscriptStatus('not_started');
            }
        };

        fetchStatus();
        return () => clearTimeout(pollRef.current);
    }, [lecture, id]);

    const handleStartTranscription = async () => {
        setTranscriptStarting(true);
        setTranscriptError('');
        try {
            await transcriptionsAPI.start(id);
            setTranscriptStatus('processing');
            // Start polling
            const poll = async () => {
                try {
                    const { data } = await transcriptionsAPI.status(id);
                    setTranscriptStatus(data.status);
                    if (data.status === 'processing') {
                        pollRef.current = setTimeout(poll, 5000);
                    }
                } catch { /* ignore */ }
            };
            pollRef.current = setTimeout(poll, 5000);
        } catch (err) {
            setTranscriptError(getErrorMessage(err));
        } finally {
            setTranscriptStarting(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await lecturesAPI.update(id, editData);
            setLecture(prev => ({ ...prev, ...editData }));
        } catch (err) {
            alert(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error || !lecture) return <div className="p-8 text-center">{error || 'Lecture not found'}</div>;

    // Build audio file info from real API data
    const audioFile = lecture.audio || null;
    const audioFiles = audioFile ? [{
        id: audioFile.id,
        name: `${lecture.title} — Audio`,
        duration: audioFile.duration_seconds
            ? `${Math.floor(audioFile.duration_seconds / 60)}m ${audioFile.duration_seconds % 60}s`
            : 'Duration unknown',
        size: audioFile.file_size
            ? `${(audioFile.file_size / 1048576).toFixed(1)} MB`
            : 'Size unknown',
    }] : [];

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

                    {/* Transcription Card */}
                    {lecture.audio && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-emerald-500" />
                                    AI Transcription
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {transcriptStatus === 'completed' && (
                                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-sm font-medium">Transcribed and indexed — chat is ready</span>
                                    </div>
                                )}
                                {transcriptStatus === 'processing' && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span className="text-sm font-medium">Transcription in progress…</span>
                                        </div>
                                        <Progress value={50} className="h-1.5" />
                                    </div>
                                )}
                                {transcriptStatus === 'failed' && (
                                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm font-medium">Transcription failed</span>
                                    </div>
                                )}
                                {(transcriptStatus === 'not_started' || transcriptStatus === null) && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        No transcript yet. Start transcription to enable AI chat for this lecture.
                                    </p>
                                )}
                                {transcriptError && (
                                    <p className="text-xs text-red-500">{transcriptError}</p>
                                )}
                                {(transcriptStatus === 'not_started' || transcriptStatus === 'failed' || transcriptStatus === null) && (
                                    <Button
                                        onClick={handleStartTranscription}
                                        disabled={transcriptStarting}
                                        className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                                    >
                                        {transcriptStarting
                                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</>
                                            : transcriptStatus === 'failed'
                                                ? <><RefreshCw className="w-4 h-4" /> Retry Transcription</>
                                                : <><Sparkles className="w-4 h-4" /> Start Transcription</>
                                        }
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )}

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
                                <Input
                                    value={editData.title}
                                    onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Input disabled value={lecture.subject_title} onChange={() => {}} />
                            </div>
                            <div className="space-y-2">
                                <Label>Summary</Label>
                                <Textarea
                                    rows={4}
                                    value={editData.summary}
                                    onChange={(e) => setEditData(prev => ({ ...prev, summary: e.target.value }))}
                                />
                            </div>
                            <div className="flex justify-end pt-4 border-t">
                                <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
                                    <Save className="w-4 h-4 mr-2" />
                                    {saving ? 'Saving...' : 'Save Changes'}
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
