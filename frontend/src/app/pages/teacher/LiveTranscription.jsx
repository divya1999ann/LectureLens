import React, { useState, useEffect } from 'react';
import { Mic, Square, Pause, Play, Save, FileText, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { mockSubjects, sampleLiveTexts } from '../../utils/mockData';

const LiveTranscription = () => {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [lectureNumber, setLectureNumber] = useState('');
  const [wordCount, setWordCount] = useState(0);

  const mySubjects = mockSubjects.filter(s => s.instructorId === 2);

  // Timer effect
  useEffect(() => {
    let interval;
    if (recording && !paused) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [recording, paused]);

  // Simulate live transcription
  useEffect(() => {
    let interval;
    if (recording && !paused) {
      interval = setInterval(() => {
        const randomText = sampleLiveTexts[Math.floor(Math.random() * sampleLiveTexts.length)];
        const timestamp = formatDuration(duration);
        setTranscript(prev => {
          const newText = prev + `\n\n[${timestamp}] ${randomText}`;
          setWordCount(newText.split(/\s+/).length);
          return newText;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [recording, paused, duration]);

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    if (recording) {
      // Stop recording
      setRecording(false);
      setPaused(false);
    } else {
      // Start recording
      if (!subjectId || !lectureNumber) {
        alert('Please select a subject and enter lecture number first');
        return;
      }
      setRecording(true);
      setTranscript('');
      setDuration(0);
      setWordCount(0);
    }
  };

  const handlePauseResume = () => {
    setPaused(!paused);
  };

  const handleSave = () => {
    if (transcript) {
      alert('Transcript saved successfully!');
      // Reset
      setRecording(false);
      setPaused(false);
      setDuration(0);
      setTranscript('');
      setWordCount(0);
    }
  };

  // Audio visualizer bars
  const AudioVisualizer = () => {
    const bars = Array.from({ length: 20 }, (_, i) => i);
    return (
      <div className="flex items-center justify-center space-x-1 h-24">
        {bars.map((i) => (
          <div
            key={i}
            className={`w-2 bg-blue-500 rounded-full transition-all ${recording && !paused ? 'animate-pulse' : 'opacity-30'
              }`}
            style={{
              height: recording && !paused ? `${Math.random() * 60 + 20}%` : '20%',
              animationDelay: `${i * 0.05}s`,
              animationDuration: `${0.5 + Math.random()}s`
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Live Transcription</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Record and transcribe lectures in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Controls */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Recording Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select value={subjectId} onValueChange={setSubjectId} disabled={recording}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {mySubjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id.toString()}>
                        {subject.code} - {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lectureNumber">Lecture Number</Label>
                <Input
                  id="lectureNumber"
                  type="number"
                  min="1"
                  value={lectureNumber}
                  onChange={(e) => setLectureNumber(e.target.value)}
                  disabled={recording}
                />
              </div>

              {/* Status */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <div className="flex items-center space-x-2">
                    {recording && !paused && (
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    )}
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {recording ? (paused ? 'Paused' : 'Recording') : 'Ready'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                  <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                    {formatDuration(duration)}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-3">
                {!recording ? (
                  transcript ? (
                    <div className="space-y-3">
                      <Button
                        onClick={() => {
                          const blob = new Blob(['Mock audio data'], { type: 'audio/mp3' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `lecture-recording-${new Date().toISOString()}.mp3`;
                          a.click();
                        }}
                        variant="outline"
                        className="w-full border-blue-200 hover:bg-blue-50 text-blue-700"
                        size="lg"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download MP3
                      </Button>
                      <Button
                        onClick={handleSave}
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                        size="lg"
                      >
                        <Save className="w-5 h-5 mr-2" />
                        Save Transcript & End
                      </Button>
                      <Button
                        onClick={() => {
                          setTranscript('');
                          setDuration(0);
                          setWordCount(0);
                        }}
                        variant="ghost"
                        className="w-full text-gray-500"
                      >
                        Discard & New Recording
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={handleStartStop}
                      className="w-full bg-red-500 hover:bg-red-600 text-white"
                      size="lg"
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Start Recording
                    </Button>
                  )
                ) : (
                  <>
                    <Button
                      onClick={handlePauseResume}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      {paused ? (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="w-5 h-5 mr-2" />
                          Pause
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleStartStop}
                      variant="outline"
                      className="w-full border-red-200 hover:bg-red-50 text-red-600"
                      size="lg"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      End Recording
                    </Button>
                  </>
                )}
              </div>

              {/* Audio Visualizer */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <AudioVisualizer />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Transcript */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Live Transcript</CardTitle>
                {transcript && (
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{wordCount} words</span>
                    <span>{transcript.length} characters</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {transcript ? (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 min-h-[500px] max-h-[600px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white font-sans leading-relaxed">
                    {transcript}
                  </pre>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[500px] text-gray-400 dark:text-gray-500">
                  <Mic className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium mb-2">No transcript yet</p>
                  <p className="text-sm">Start recording to see live transcription</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LiveTranscription;
