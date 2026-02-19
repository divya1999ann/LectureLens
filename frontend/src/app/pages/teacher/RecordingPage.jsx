import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Mic, Square, Pause, Play, Trash2, Download, Check, Upload, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { mockSubjects } from '../../utils/mockData';

const RecordingPage = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState('idle'); // idle, recording, paused, stopped
    const [duration, setDuration] = useState(0);
    const [downloaded, setDownloaded] = useState(false);
    const [permissionError, setPermissionError] = useState(null);
    const [audioURL, setAudioURL] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [formData, setFormData] = useState({
        subjectId: '',
        lectureNumber: '',
        title: ''
    });

    const mySubjects = mockSubjects.filter(s => s.instructorId === 2);
    const timerRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);

    useEffect(() => {
        if (status === 'recording') {
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [status]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioURL) {
                URL.revokeObjectURL(audioURL);
            }
        };
    }, [audioURL]);

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleStart = useCallback(async () => {
        if (!formData.subjectId || !formData.lectureNumber || !formData.title) {
            alert('Please fill in all details before recording.');
            return;
        }

        setPermissionError(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });

            streamRef.current = stream;
            audioChunksRef.current = [];

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : 'audio/webm'
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioURL(url);
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(1000); // Collect data every second

            setStatus('recording');
            setDuration(0);
            setDownloaded(false);
            setAudioURL(null);
            setAudioBlob(null);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            if (err.name === 'NotAllowedError') {
                setPermissionError('Microphone access was denied. Please allow microphone access in your browser settings.');
            } else if (err.name === 'NotFoundError') {
                setPermissionError('No microphone found. Please connect a microphone and try again.');
            } else {
                setPermissionError('Could not access microphone. Please check your device settings.');
            }
        }
    }, [formData]);

    const handleStop = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setStatus('stopped');
    }, []);

    const handlePause = useCallback(() => {
        if (!mediaRecorderRef.current) return;

        if (status === 'paused') {
            mediaRecorderRef.current.resume();
            setStatus('recording');
        } else {
            mediaRecorderRef.current.pause();
            setStatus('paused');
        }
    }, [status]);

    const handleCancel = useCallback(() => {
        if (window.confirm('Are you sure you want to discard this recording?')) {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            setStatus('idle');
            setDuration(0);
            setAudioURL(null);
            setAudioBlob(null);
        }
    }, []);

    const handleDownload = useCallback(() => {
        if (!audioBlob) return;
        const url = URL.createObjectURL(audioBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lecture-${formData.title || 'recording'}-${formData.lectureNumber || '1'}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloaded(true);
    }, [audioBlob, formData]);

    const handleFinalize = () => {
        navigate('/teacher/upload', {
            state: {
                ...formData,
                preRecorded: true,
                duration: formatDuration(duration)
            }
        });
    };

    // Visualizer bars
    const AudioVisualizer = () => {
        const bars = Array.from({ length: 40 }, (_, i) => i);
        return (
            <div className="flex items-center justify-center gap-[3px] h-36 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                {bars.map((i) => (
                    <div
                        key={i}
                        className={`w-1.5 rounded-full transition-all ${status === 'recording'
                                ? 'bg-gradient-to-t from-blue-600 to-cyan-400'
                                : status === 'paused'
                                    ? 'bg-gradient-to-t from-yellow-500 to-amber-300 opacity-60'
                                    : 'bg-gray-300 dark:bg-gray-600 opacity-30'
                            }`}
                        style={{
                            height: status === 'recording'
                                ? `${Math.random() * 75 + 15}%`
                                : status === 'paused'
                                    ? '30%'
                                    : '15%',
                            animationDelay: `${i * 0.05}s`,
                            transition: 'height 0.15s ease-out'
                        }}
                    />
                ))}
            </div>
        );
    };

    const fileSizeEstimate = (duration * 0.016).toFixed(1); // ~16KB/sec for webm/opus

    if (status === 'idle') {
        return (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Record New Lecture</h1>
                    <p className="text-sm text-gray-500">Set up your session details, then start recording</p>
                </div>

                {permissionError && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20 text-red-700 dark:text-red-400">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-sm">{permissionError}</p>
                    </div>
                )}

                <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
                    <CardContent className="pt-6 space-y-5">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Select Subject</Label>
                            <Select
                                value={formData.subjectId}
                                onValueChange={(val) => setFormData({ ...formData, subjectId: val })}
                            >
                                <SelectTrigger className="h-11">
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
                                <Label className="text-sm font-semibold">Lecture Number</Label>
                                <Input
                                    type="number"
                                    className="h-11"
                                    placeholder="e.g. 5"
                                    value={formData.lectureNumber}
                                    onChange={(e) => setFormData({ ...formData, lectureNumber: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Lecture Title</Label>
                                <Input
                                    className="h-11"
                                    placeholder="e.g. Intro to Neural Networks"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className="w-full h-14 text-lg bg-red-600 hover:bg-red-700 gap-3 shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition-all duration-300"
                            onClick={handleStart}
                        >
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                            Start Recording
                        </Button>

                        <p className="text-xs text-center text-gray-400">
                            Your browser will ask for microphone permission when you start recording
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Timer Display */}
            <div className="text-center space-y-3">
                <div className="inline-block bg-gray-100 dark:bg-gray-800 px-8 py-3 rounded-2xl">
                    <span className="text-5xl font-mono font-bold text-gray-900 dark:text-white tracking-widest">
                        {formatDuration(duration)}
                    </span>
                </div>
                <div className="flex items-center justify-center gap-2">
                    {status === 'recording' && (
                        <div className="flex items-center gap-2 text-red-500">
                            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-sm font-semibold uppercase tracking-widest">Recording</span>
                        </div>
                    )}
                    {status === 'paused' && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-none">
                            Paused
                        </Badge>
                    )}
                    {status === 'stopped' && (
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none">
                            Recording Complete
                        </Badge>
                    )}
                </div>
            </div>

            {/* Visualizer */}
            <AudioVisualizer />

            {/* Controls */}
            {status !== 'stopped' ? (
                <div className="flex justify-center gap-5">
                    <Button
                        variant="outline"
                        size="lg"
                        className="h-16 w-16 rounded-full border-2 hover:border-gray-400 transition-all"
                        onClick={handlePause}
                        title={status === 'paused' ? 'Resume' : 'Pause'}
                    >
                        {status === 'paused' ? <Play className="w-6 h-6 fill-current" /> : <Pause className="w-6 h-6 fill-current" />}
                    </Button>
                    <Button
                        variant="destructive"
                        size="lg"
                        className="h-20 w-20 rounded-full border-4 border-white dark:border-gray-900 shadow-xl shadow-red-500/20 hover:shadow-red-500/30 transition-all"
                        onClick={handleStop}
                        title="Stop Recording"
                    >
                        <Square className="w-7 h-7 fill-current" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="lg"
                        className="h-16 w-16 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        onClick={handleCancel}
                        title="Discard"
                    >
                        <Trash2 className="w-6 h-6" />
                    </Button>
                </div>
            ) : (
                <Card className="border-t-4 border-t-emerald-500 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center space-y-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Preview Recording</h3>

                            {/* Real Audio Player */}
                            {audioURL && (
                                <audio controls src={audioURL} className="w-full max-w-md rounded-lg" />
                            )}

                            <div className="grid grid-cols-2 gap-6 text-center w-full max-w-sm">
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Duration</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">{formatDuration(duration)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                                    <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Size</p>
                                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                        {audioBlob ? (audioBlob.size / (1024 * 1024)).toFixed(1) : fileSizeEstimate} MB
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xl">
                                <Button variant="outline" className="flex-1" onClick={() => {
                                    setStatus('idle');
                                    setDuration(0);
                                    setAudioURL(null);
                                    setAudioBlob(null);
                                }}>
                                    Start Over
                                </Button>
                                <Button
                                    variant="secondary"
                                    className={`flex-1 gap-2 ${downloaded ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}`}
                                    onClick={handleDownload}
                                >
                                    {downloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                                    {downloaded ? 'Downloaded' : 'Download Recording'}
                                </Button>
                                <Button
                                    className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
                                    disabled={!downloaded}
                                    onClick={handleFinalize}
                                >
                                    <Upload className="w-4 h-4" />
                                    Finalize & Upload
                                </Button>
                            </div>
                            {!downloaded && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    Download the recording before finalizing
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {(status === 'recording' || status === 'paused') && (
                <div className="text-center text-xs text-gray-400">
                    Estimated size: {fileSizeEstimate} MB
                </div>
            )}
        </div>
    );
};

export default RecordingPage;
