import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Upload as UploadIcon, FileText, File, CheckCircle, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Checkbox } from '../../components/ui/checkbox';
import { Progress } from '../../components/ui/progress';
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
    notes: '', // Additional Notes
    audioFiles: [], // Changed to array
    autoTranscript: true,
    manualTranscript: '',
    transcriptFile: null,
    notesFiles: []
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
    } else if (fileType === 'notes') {
      setFormData(prev => ({ ...prev, notesFiles: [...prev.notesFiles, ...files] }));
    } else if (fileType === 'transcript') {
      setFormData(prev => ({ ...prev, transcriptFile: files[0] }));
    }
  };

  const removeFile = (index, fileType) => {
    if (fileType === 'audio') {
      setFormData(prev => ({ ...prev, audioFiles: prev.audioFiles.filter((_, i) => i !== index) }));
    } else if (fileType === 'notes') {
      setFormData(prev => ({ ...prev, notesFiles: prev.notesFiles.filter((_, i) => i !== index) }));
    }
  };

  const handleSubmit = () => {
    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            alert('Lecture uploaded successfully!');
            navigate('/teacher/lectures');
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Lecture</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Add a new lecture with audio and materials</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${step >= s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
              >
                {step > s ? <CheckCircle className="w-6 h-6" /> : s}
              </div>
              <span className="text-xs mt-2 text-gray-600 dark:text-gray-400">
                {s === 1 ? 'Basic Info' : s === 2 ? 'Upload Files' : 'Review'}
              </span>
            </div>
            {s < 3 && (
              <div className={`w-20 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 ? 'Step 1: Basic Information' : step === 2 ? 'Step 2: Upload Files' : 'Step 3: Review & Submit'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Select Subject</Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                >
                  <SelectTrigger>
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
                  <Label htmlFor="lectureNumber">Lecture Number</Label>
                  <Input
                    id="lectureNumber"
                    type="number"
                    min="1"
                    value={formData.lectureNumber}
                    onChange={(e) => setFormData({ ...formData, lectureNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Lecture Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Introduction to Neural Networks"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  placeholder="Describe what will be covered in this lecture..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes / Key Takeaways</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  placeholder="Add brief summary or important notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Step 2: Upload Files */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Audio Files (MP3, WAV, M4A)</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".mp3,.wav,.m4a"
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleFileChange(e, 'audio')}
                  />
                  <UploadIcon className="w-12 h-12 mx-auto text-gray-400 mb-4 pointer-events-none" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 pointer-events-none">
                    Drag & drop your audio files here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 pointer-events-none">
                    Supported formats: MP3, WAV, M4A (Max 500MB)
                  </p>
                </div>

                {formData.audioFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.audioFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                          <FileText className="w-4 h-4" />
                          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index, 'audio')}
                          className="h-8 w-8 text-gray-500 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label>Transcript (Optional)</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoTranscript"
                    checked={formData.autoTranscript}
                    onCheckedChange={(checked) => setFormData({ ...formData, autoTranscript: checked })}
                  />
                  <Label htmlFor="autoTranscript" className="font-normal cursor-pointer">
                    Auto-generate transcript from audios
                  </Label>
                </div>

                {!formData.autoTranscript && (
                  <>
                    <Textarea
                      placeholder="Enter transcript manually..."
                      rows={6}
                      value={formData.manualTranscript}
                      onChange={(e) => setFormData({ ...formData, manualTranscript: e.target.value })}
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400">OR</p>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 text-center cursor-pointer relative">
                      <input
                        type="file"
                        accept=".txt,.doc,.docx"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => handleFileChange(e, 'transcript')}
                      />
                      <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2 pointer-events-none" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 pointer-events-none">Upload transcript file (.txt)</p>
                    </div>
                    {formData.transcriptFile && (
                      <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        {formData.transcriptFile.name}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label>Notes/Slides (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx"
                    multiple
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleFileChange(e, 'notes')}
                  />
                  <File className="w-12 h-12 mx-auto text-gray-400 mb-4 pointer-events-none" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 pointer-events-none">
                    Upload presentation slides or notes
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 pointer-events-none">
                    Supported formats: PDF, PPT, PPTX
                  </p>
                </div>

                {formData.notesFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.notesFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                          <File className="w-4 h-4" />
                          <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index, 'notes')} // Wait, notesFiles logic needed
                          className="h-8 w-8 text-gray-500 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Lecture Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Subject:</span>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                      {mySubjects.find(s => s.id.toString() === formData.subjectId)?.name || 'Not selected'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Lecture:</span>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">{formData.lectureNumber || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Date:</span>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">
                      {new Date(formData.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Title:</span>
                    <p className="font-medium text-gray-900 dark:text-white mt-1">{formData.title || '-'}</p>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Description:</span>
                  <p className="text-gray-900 dark:text-white mt-1">{formData.description || '-'}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Additional Notes:</span>
                  <p className="text-gray-900 dark:text-white mt-1">{formData.notes || '-'}</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Uploaded Files</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Audio Files:</span>
                    <span className="text-gray-900 dark:text-white">{formData.audioFiles.length} file(s)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Notes/Slides:</span>
                    <span className="text-gray-900 dark:text-white">{formData.notesFiles.length} file(s)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Transcript:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formData.autoTranscript ? 'Auto-generate' : (formData.transcriptFile ? formData.transcriptFile.name : 'Manual entry')}
                    </span>
                  </div>
                </div>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Uploading...</span>
                    <span className="text-gray-900 dark:text-white font-medium">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || uploading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {step < 3 ? (
              <Button onClick={handleNext}>
                Next: {step === 1 ? 'Upload Files' : 'Review'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Submit'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadLecture;