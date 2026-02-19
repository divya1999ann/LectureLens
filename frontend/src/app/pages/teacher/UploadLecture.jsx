import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Upload as UploadIcon, FileText, File, CheckCircle, ArrowRight, ArrowLeft, X,
  Headphones, Presentation, StickyNote, FileAudio, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { mockSubjects } from '../../utils/mockData';

const UploadLecture = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    subjectId: '',
    lectureNumber: '',
    date: new Date().toISOString().split('T')[0],
    title: '',
    description: '',
    audioFiles: [],
    transcriptFile: null,
    autoTranscript: true,
    slidesFiles: [],
    notesFiles: [],
  });

  const mySubjects = mockSubjects.filter(s => s.instructorId === 2);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFileChange = (e, fileType) => {
    const files = Array.from(e.target.files);
    if (fileType === 'audio') {
      setFormData(prev => ({ ...prev, audioFiles: [...prev.audioFiles, ...files] }));
    } else if (fileType === 'transcript') {
      setFormData(prev => ({ ...prev, transcriptFile: files[0] }));
    } else if (fileType === 'slides') {
      setFormData(prev => ({ ...prev, slidesFiles: [...prev.slidesFiles, ...files] }));
    } else if (fileType === 'notes') {
      setFormData(prev => ({ ...prev, notesFiles: [...prev.notesFiles, ...files] }));
    }
  };

  const removeFile = (index, fileType) => {
    if (fileType === 'audio') {
      setFormData(prev => ({ ...prev, audioFiles: prev.audioFiles.filter((_, i) => i !== index) }));
    } else if (fileType === 'slides') {
      setFormData(prev => ({ ...prev, slidesFiles: prev.slidesFiles.filter((_, i) => i !== index) }));
    } else if (fileType === 'notes') {
      setFormData(prev => ({ ...prev, notesFiles: prev.notesFiles.filter((_, i) => i !== index) }));
    } else if (fileType === 'transcript') {
      setFormData(prev => ({ ...prev, transcriptFile: null }));
    }
  };

  const handleSubmit = () => {
    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            alert('Lecture uploaded successfully!');
            navigate('/teacher/dashboard');
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const steps = [
    { num: 1, label: 'Lecture Info', desc: 'Basic details' },
    { num: 2, label: 'Upload Files', desc: 'Audio, slides & notes' },
    { num: 3, label: 'Review', desc: 'Confirm & submit' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Upload Lecture</h1>
          <p className="text-sm text-gray-500 mt-1">Add a new lecture with audio, transcripts, and materials</p>
        </div>
        <Badge variant="outline" className="text-xs font-medium">
          Step {step} of 3
        </Badge>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-3">
        {steps.map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${step > s.num
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : step === s.num
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}
              >
                {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
              </div>
              <span className={`text-xs mt-2 font-medium ${step >= s.num ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                }`}>
                {s.label}
              </span>
              <span className="text-[10px] text-gray-400">{s.desc}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-16 h-0.5 rounded-full mt-[-20px] transition-colors duration-300 ${step > s.num ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
        <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-lg">
            {step === 1 ? 'Lecture Information' : step === 2 ? 'Upload Files' : 'Review & Submit'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* === Step 1: Basic Info === */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-semibold">Select Subject</Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Choose a subject" />
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lectureNumber" className="text-sm font-semibold">Lecture Number</Label>
                  <Input
                    id="lectureNumber"
                    type="number"
                    min="1"
                    className="h-11"
                    placeholder="e.g., 5"
                    value={formData.lectureNumber}
                    onChange={(e) => setFormData({ ...formData, lectureNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-semibold">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    className="h-11"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold">Lecture Title</Label>
                <Input
                  id="title"
                  className="h-11"
                  placeholder="e.g., Introduction to Neural Networks"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Describe what will be covered in this lecture..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* === Step 2: Upload Files === */}
          {step === 2 && (
            <div className="space-y-6">

              {/* Audio Upload */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-blue-500" />
                  <Label className="text-sm font-semibold">Audio Files</Label>
                  <span className="text-xs text-gray-400">MP3, WAV, M4A</span>
                </div>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer relative group">
                  <input
                    type="file"
                    accept=".mp3,.wav,.m4a,.ogg,.webm"
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleFileChange(e, 'audio')}
                  />
                  <div className="pointer-events-none">
                    <FileAudio className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3 group-hover:text-blue-400 transition-colors duration-300" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Drop audio files here or <span className="text-blue-600 dark:text-blue-400">browse</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Max 500MB per file</p>
                  </div>
                </div>
                {formData.audioFiles.length > 0 && (
                  <div className="space-y-2">
                    {formData.audioFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                        <div className="flex items-center gap-2.5">
                          <FileAudio className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[250px]">{file.name}</span>
                          <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFile(index, 'audio')} className="h-7 w-7 text-gray-400 hover:text-red-500">
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transcript Upload */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <Label className="text-sm font-semibold">Transcript</Label>
                  <span className="text-xs text-gray-400">Optional</span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                  <Checkbox
                    id="autoTranscript"
                    checked={formData.autoTranscript}
                    onCheckedChange={(checked) => setFormData({ ...formData, autoTranscript: checked })}
                  />
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <Label htmlFor="autoTranscript" className="font-medium text-sm cursor-pointer">
                      Auto-generate transcript from audio using AI
                    </Label>
                  </div>
                </div>

                {!formData.autoTranscript && (
                  <div className="space-y-3 pl-1">
                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer relative group hover:border-emerald-400 transition-colors">
                      <input
                        type="file"
                        accept=".txt,.doc,.docx,.srt"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => handleFileChange(e, 'transcript')}
                      />
                      <div className="pointer-events-none">
                        <FileText className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2 group-hover:text-emerald-400 transition-colors" />
                        <p className="text-sm text-gray-500">Upload transcript file <span className="text-xs">(.txt, .doc, .srt)</span></p>
                      </div>
                    </div>
                    {formData.transcriptFile && (
                      <div className="flex items-center justify-between p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg border border-emerald-100 dark:border-emerald-900/20">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm font-medium">{formData.transcriptFile.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFile(0, 'transcript')} className="h-7 w-7 text-gray-400 hover:text-red-500">
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Lecture Slides Upload */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Presentation className="w-4 h-4 text-orange-500" />
                  <Label className="text-sm font-semibold">Lecture Slides</Label>
                  <span className="text-xs text-gray-400">PDF, PPT, PPTX — Optional</span>
                </div>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center hover:border-orange-400 dark:hover:border-orange-500 transition-colors cursor-pointer relative group">
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx"
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleFileChange(e, 'slides')}
                  />
                  <div className="pointer-events-none">
                    <Presentation className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3 group-hover:text-orange-400 transition-colors duration-300" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Drop lecture slides here or <span className="text-orange-600 dark:text-orange-400">browse</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PDF, PPT, PPTX</p>
                  </div>
                </div>
                {formData.slidesFiles.length > 0 && (
                  <div className="space-y-2">
                    {formData.slidesFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/20">
                        <div className="flex items-center gap-2.5">
                          <File className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[250px]">{file.name}</span>
                          <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFile(index, 'slides')} className="h-7 w-7 text-gray-400 hover:text-red-500">
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Notes Upload */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-purple-500" />
                  <Label className="text-sm font-semibold">Additional Notes</Label>
                  <span className="text-xs text-gray-400">PDF, DOC, TXT — Optional</span>
                </div>
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors cursor-pointer relative group">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleFileChange(e, 'notes')}
                  />
                  <div className="pointer-events-none">
                    <StickyNote className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3 group-hover:text-purple-400 transition-colors duration-300" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Drop additional notes here or <span className="text-purple-600 dark:text-purple-400">browse</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, TXT</p>
                  </div>
                </div>
                {formData.notesFiles.length > 0 && (
                  <div className="space-y-2">
                    {formData.notesFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[250px]">{file.name}</span>
                          <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFile(index, 'notes')} className="h-7 w-7 text-gray-400 hover:text-red-500">
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* === Step 3: Review === */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Lecture Details */}
              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-5 space-y-4 border border-blue-100 dark:border-blue-900/20">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                  Lecture Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs font-medium">Subject</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
                      {mySubjects.find(s => s.id.toString() === formData.subjectId)?.name || 'Not selected'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs font-medium">Lecture No.</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{formData.lectureNumber || '—'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs font-medium">Date</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
                      {new Date(formData.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs font-medium">Title</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{formData.title || '—'}</p>
                  </div>
                </div>
                {formData.description && (
                  <div>
                    <span className="text-gray-500 text-xs font-medium">Description</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{formData.description}</p>
                  </div>
                )}
              </div>

              {/* Files Summary */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 space-y-4 border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                  Uploaded Files
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600 dark:text-gray-400">Audio Files</span>
                    </div>
                    <Badge variant={formData.audioFiles.length > 0 ? 'default' : 'secondary'} className="text-xs">
                      {formData.audioFiles.length} file(s)
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-500" />
                      <span className="text-gray-600 dark:text-gray-400">Transcript</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {formData.autoTranscript ? 'AI Auto-Generate' : (formData.transcriptFile ? formData.transcriptFile.name : (formData.manualTranscript ? 'Manual Entry' : 'None'))}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Presentation className="w-4 h-4 text-orange-500" />
                      <span className="text-gray-600 dark:text-gray-400">Lecture Slides</span>
                    </div>
                    <Badge variant={formData.slidesFiles.length > 0 ? 'default' : 'secondary'} className="text-xs">
                      {formData.slidesFiles.length} file(s)
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <StickyNote className="w-4 h-4 text-purple-500" />
                      <span className="text-gray-600 dark:text-gray-400">Additional Notes</span>
                    </div>
                    <Badge variant={formData.notesFiles.length > 0 ? 'default' : 'secondary'} className="text-xs">
                      {formData.notesFiles.length} file(s)
                    </Badge>
                  </div>
                </div>
              </div>

              {uploading && (
                <div className="space-y-3 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Uploading...</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-5 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || uploading}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            {step < 3 ? (
              <Button onClick={handleNext} className="gap-2 bg-blue-600 hover:bg-blue-700">
                Next: {step === 1 ? 'Upload Files' : 'Review'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={uploading}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 min-w-[140px]"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-4 h-4" />
                    Submit Lecture
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadLecture;