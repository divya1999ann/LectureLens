import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Mic, Square, Pause, Play, Trash2, Download, Check, Upload } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { mockSubjects } from '../../utils/mockData';

const RecordingPage = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('idle'); // idle, recording, paused, stopped
    const [duration, setDuration] = useState(0);
    const [fileSize, setFileSize] = useState(0); // in MB
    const [downloaded, setDownloaded] = useState(false);
    const [formData, setFormData] = useState({
        subjectId: '',
        lectureNumber: '',
        title: ''
    });

    const mySubjects = mockSubjects.filter(s => s.instructorId === 2);
    const timerRef = useRef(null);

    useEffect(() => {
        if (status === 'recording') {
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
                setFileSize(prev => prev + 0.1); // Simulate file size growth
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [status]);

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleStart = () => {
        if (!formData.subjectId || !formData.lectureNumber || !formData.title) {
            alert('Please fill in all details before recording.');
            return;
        }
        setStatus('recording');
        setDuration(0);
        setFileSize(0);
        setDownloaded(false);
    };

    const handleStop = () => setStatus('stopped');
    const handlePause = () => setStatus(status === 'paused' ? 'recording' : 'paused');
    const handleCancel = () => {
        if (window.confirm('Are you sure you want to discard this recording?')) {
            setStatus('idle');
            setDuration(0);
            setFileSize(0);
        }
    };

    const handleDownload = () => {
        // Simulate download
        const blob = new Blob(['Mock audio data'], { type: 'audio/mp3' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lecture-${formData.subjectId}-${formData.lectureNumber}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setDownloaded(true);
    };

    const handleFinalize = () => {
        // Navigate to Upload Page with pre-filled state
        navigate('/teacher/upload', {
            state: {
                ...formData,
                preRecorded: true,
                fileSize: fileSize.toFixed(1)
            }
        });
    };

    // Visualizer component
    const AudioVisualizer = () => {
        const bars = Array.from({ length: 30 }, (_, i) => i);
        return (
            <div className="flex items-center justify-center space-x-1 h-32 bg-gray-900/5 dark:bg-black/20 rounded-lg backdrop-blur-sm p-4">
                {bars.map((i) => (
                    <div
                        key={i}
                        className={`w-2 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-full transition-all duration-100 ${status === 'recording' ? 'animate-pulse' : 'opacity-30 h-8'
                            }`}
                        style={{
                            height: status === 'recording' ? `${Math.random() * 80 + 20}%` : '20%',
                            animationDelay: `${i * 0.05}s`
                        }}
                    />
                ))}
            </div>
        );
    };

    if (status === 'idle') {
        return (
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Record New Lecture</h1>
                    <p className="text-gray-600 dark:text-gray-400">Set up your session details to begin recording</p>
                </div>

                <Card>
                    <CardContent className="pt-6 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Select Subject</Label>
                                <Select
                                    value={formData.subjectId}
                                    onValueChange={(val) => setFormData({ ...formData, subjectId: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose a subject..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mySubjects.map(s => (
                                            <SelectItem key={s.id} value={s.id.toString()}>{s.code} - {s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Lecture Number</Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 5"
                                        value={formData.lectureNumber}
                                        onChange={(e) => setFormData({ ...formData, lectureNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Lecture Title</Label>
                                    <Input
                                        placeholder="e.g. Intro to Neural Networks"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Microphone</Label>
                                <Select defaultValue="default">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Microphone" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="default">Default - Macbook Pro Microphone</SelectItem>
                                        <SelectItem value="external">External - Yeti Stereo Microphone</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button size="lg" className="w-full h-14 text-lg bg-red-600 hover:bg-red-700" onClick={handleStart}>
                            <Mic className="w-5 h-5 mr-2" />
                            Start Recording
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center">
                <div className="inline-block bg-gray-100 dark:bg-gray-800 px-6 py-2 rounded-full mb-6">
                    <span className="text-4xl font-mono font-bold text-gray-900 dark:text-white tracking-wider">
                        {formatDuration(duration)}
                    </span>
                </div>
                {status === 'recording' && (
                    <div className="flex items-center justify-center gap-2 text-red-500 animate-pulse">
                        <span className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-sm font-medium uppercase tracking-widest">Recording</span>
                    </div>
                )}
                {status === 'paused' && <span className="text-yellow-500 font-medium">Paused</span>}
                {status === 'stopped' && <span className="text-green-500 font-medium">Recording Complete</span>}
            </div>

            <AudioVisualizer />

            {status !== 'stopped' ? (
                <div className="flex justify-center gap-6">
                    <Button
                        variant="outline"
                        size="lg"
                        className="h-16 w-16 rounded-full border-2"
                        onClick={handlePause}
                    >
                        {status === 'paused' ? <Play className="w-6 h-6 fill-current" /> : <Pause className="w-6 h-6 fill-current" />}
                    </Button>
                    <Button
                        variant="destructive"
                        size="lg"
                        className="h-16 w-16 rounded-full border-4 border-white dark:border-gray-900 shadow-lg"
                        onClick={handleStop}
                    >
                        <Square className="w-6 h-6 fill-current" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="lg"
                        className="h-16 w-16 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50"
                        onClick={handleCancel}
                    >
                        <Trash2 className="w-6 h-6" />
                    </Button>
                </div>
            ) : (
                <Card className="border-t-4 border-t-green-500">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center space-y-6">
                            <h3 className="text-xl font-bold">Preview Recording</h3>

                            {/* Fake Audio Player */}
                            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-12 flex items-center px-4 gap-3">
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full">
                                    <Play className="w-4 h-4 fill-current" />
                                </Button>
                                <div className="flex-1 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                                    <div className="w-1/3 h-full bg-blue-500 rounded-full" />
                                </div>
                                <span className="text-xs font-mono">{formatDuration(duration)}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-8 text-center w-full max-w-sm">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Duration</p>
                                    <p className="text-lg font-bold">{formatDuration(duration)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-xs text-gray-500 uppercase font-semibold">Size</p>
                                    <p className="text-lg font-bold">{fileSize.toFixed(1)} MB</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xl">
                                <Button variant="outline" className="flex-1" onClick={() => setStatus('idle')}>
                                    Start Over
                                </Button>
                                <Button
                                    variant="secondary"
                                    className={`flex-1 ${downloaded ? 'bg-green-100 text-green-700' : ''}`}
                                    onClick={handleDownload}
                                >
                                    {downloaded ? <Check className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                                    {downloaded ? 'Downloaded' : 'Download MP3'}
                                </Button>
                                <Button
                                    className="flex-1"
                                    disabled={!downloaded}
                                    onClick={handleFinalize}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Finalize
                                </Button>
                            </div>
                            {!downloaded && (
                                <p className="text-xs text-red-500">* You must download the recording before finalizing.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {status === 'recording' && (
                <div className="text-center text-sm text-gray-500">
                    Current size: {fileSize.toFixed(1)} MB
                </div>
            )}
        </div>
    );
};

export default RecordingPage;
