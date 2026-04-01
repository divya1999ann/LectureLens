import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Upload as UploadIcon, CheckCircle, ArrowRight, ArrowLeft, X,
  Headphones, Presentation, FileAudio, Sparkles, AlertCircle
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
import useAuthStore from '../../store/authStore';
import { coursesAPI, lecturesAPI, transcriptionsAPI, getErrorMessage } from '../../services/api';

const UploadLecture = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');

  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [formData, setFormData] = useState({
    subjectId: '',
    title: '',
    summary: '',
    audioFile: null,
    slidesFile: null,
    autoTranscript: true,
  });

  // Fetch teacher's courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await coursesAPI.list(user?.id);
        setCourses(data.results ?? data);
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchCourses();
  }, [user?.id]);

  const handleNext = () => { if (step < 3) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData(prev => ({ ...prev, audioFile: file }));
  };

  const removeAudio = () => setFormData(prev => ({ ...prev, audioFile: null }));

  const handleSlidesChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData(prev => ({ ...prev, slidesFile: file }));
  };

  const removeSlides = () => setFormData(prev => ({ ...prev, slidesFile: null }));

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleSubmit = async () => {
    setUploading(true);
    setUploadProgress(0);
    setUploadError('');

    try {
      // Build multipart form data
      const fd = new FormData();
      fd.append('subject', formData.subjectId);
      fd.append('title', formData.title);
      if (formData.summary) fd.append('summary', formData.summary);
      if (formData.audioFile) fd.append('audio_file', formData.audioFile);
      if (formData.slidesFile) fd.append('slides_file', formData.slidesFile);

      setUploadProgress(30);

      const { data: lecture } = await lecturesAPI.create(fd);

      setUploadProgress(70);

      // Auto-trigger transcription if audio was uploaded and auto-transcript enabled
      if (formData.audioFile && formData.autoTranscript) {
        try {
          await transcriptionsAPI.start(lecture.id);
        } catch (e) {
          console.warn('Transcription start failed (non-critical):', e);
        }
      }

      setUploadProgress(100);

      setTimeout(() => {
        navigate(`/teacher/lectures/${lecture.id}`);
      }, 600);
    } catch (err) {
      setUploadError(getErrorMessage(err));
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const steps = [
    { num: 1, label: 'Lecture Info', desc: 'Basic details' },
    { num: 2, label: 'Upload Audio', desc: 'Audio file' },
    { num: 3, label: 'Review', desc: 'Confirm & submit' },
  ];

  const selectedCourse = courses.find(c => c.id === formData.subjectId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Upload Lecture</h1>
          <p className="text-sm text-gray-500 mt-1">Add a new lecture with audio and auto-transcription</p>
        </div>
        <Badge variant="outline" className="text-xs font-medium">Step {step} of 3</Badge>
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
              <span className={`text-xs mt-2 font-medium ${step >= s.num ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                {s.label}
              </span>
              <span className="text-[10px] text-gray-400">{s.desc}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-16 h-0.5 rounded-full mt-[-20px] transition-colors duration-300 ${step > s.num ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
        <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
          <CardTitle className="text-lg">
            {step === 1 ? 'Lecture Information' : step === 2 ? 'Upload Audio' : 'Review & Submit'}
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
                  disabled={coursesLoading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={coursesLoading ? 'Loading subjects...' : 'Choose a subject'} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {courses.length === 0 && !coursesLoading && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">No subjects found. Ask your admin to create one.</p>
                )}
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
                <Label htmlFor="summary" className="text-sm font-semibold">Summary <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Textarea
                  id="summary"
                  rows={3}
                  placeholder="Briefly describe what is covered in this lecture..."
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* === Step 2: Upload Audio === */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-blue-500" />
                  <Label className="text-sm font-semibold">Audio File</Label>
                  <span className="text-xs text-gray-400">MP3, WAV, M4A, OGG</span>
                </div>
                {!formData.audioFile ? (
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors cursor-pointer relative group">
                    <input
                      type="file"
                      accept=".mp3,.wav,.m4a,.ogg,.webm"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleAudioChange}
                    />
                    <div className="pointer-events-none">
                      <FileAudio className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3 group-hover:text-blue-400 transition-colors duration-300" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Drop audio file here or <span className="text-blue-600 dark:text-blue-400">browse</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Max 500MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                    <div className="flex items-center gap-2.5">
                      <FileAudio className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[250px]">{formData.audioFile.name}</span>
                      <span className="text-xs text-gray-400">{formatFileSize(formData.audioFile.size)}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={removeAudio} className="h-7 w-7 text-gray-400 hover:text-red-500">
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              {formData.audioFile && (
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
              )}

              {/* Slides Upload */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Presentation className="w-4 h-4 text-purple-500" />
                  <Label className="text-sm font-semibold">Lecture Slides</Label>
                  <span className="text-xs text-gray-400">PDF, PPTX, PPT — optional</span>
                </div>
                {!formData.slidesFile ? (
                  <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors cursor-pointer relative group">
                    <input
                      type="file"
                      accept=".pdf,.pptx,.ppt"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleSlidesChange}
                    />
                    <div className="pointer-events-none">
                      <Presentation className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3 group-hover:text-purple-400 transition-colors duration-300" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Drop slides here or <span className="text-purple-600 dark:text-purple-400">browse</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Max 100MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/20">
                    <div className="flex items-center gap-2.5">
                      <Presentation className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[250px]">{formData.slidesFile.name}</span>
                      <span className="text-xs text-gray-400">{formatFileSize(formData.slidesFile.size)}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={removeSlides} className="h-7 w-7 text-gray-400 hover:text-red-500">
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* === Step 3: Review === */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-5 space-y-4 border border-blue-100 dark:border-blue-900/20">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                  Lecture Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs font-medium">Subject</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">
                      {selectedCourse?.title || 'Not selected'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs font-medium">Title</span>
                    <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{formData.title || '—'}</p>
                  </div>
                </div>
                {formData.summary && (
                  <div>
                    <span className="text-gray-500 text-xs font-medium">Summary</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{formData.summary}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 space-y-3 border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                  Files
                </h3>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Headphones className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-400">Audio File</span>
                  </div>
                  <Badge variant={formData.audioFile ? 'default' : 'secondary'} className="text-xs">
                    {formData.audioFile ? formData.audioFile.name : 'None'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Presentation className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-600 dark:text-gray-400">Slides</span>
                  </div>
                  <Badge variant={formData.slidesFile ? 'default' : 'secondary'} className="text-xs">
                    {formData.slidesFile ? formData.slidesFile.name : 'None'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <span className="text-gray-600 dark:text-gray-400">Transcript</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {formData.audioFile && formData.autoTranscript ? 'AI Auto-Generate' : 'None'}
                  </Badge>
                </div>
              </div>

              {uploadError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {uploadError}
                </div>
              )}

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

          {/* Navigation */}
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
              <Button
                onClick={handleNext}
                disabled={
                  (step === 1 && (!formData.subjectId || !formData.title))
                }
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                Next: {step === 1 ? 'Upload Audio' : 'Review'}
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