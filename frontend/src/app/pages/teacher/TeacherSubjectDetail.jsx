import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import {
    ArrowLeft, FileAudio, FileText, Download, Play, Pause, Upload,
    GraduationCap, Users, Calendar, Clock, File, ChevronDown, ChevronUp,
    Headphones, StickyNote, Presentation
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { coursesAPI, lecturesAPI, getErrorMessage } from '../../services/api';

const TeacherSubjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [subject, setSubject] = useState(null);
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedLecture, setExpandedLecture] = useState(null);
    const [activeTranscriptTab, setActiveTranscriptTab] = useState(null);
    const [playingAudio, setPlayingAudio] = useState(null);
    // Lazy-loaded full lecture details keyed by lecture ID
    const [lectureDetails, setLectureDetails] = useState({});
    const [detailLoading, setDetailLoading] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const { data } = await coursesAPI.get(id);
                setSubject(data);
                setLectures(data.lectures || []);
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="p-8">Loading...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!subject) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
                <GraduationCap className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Subject not found</h2>
                <p className="text-gray-500 mb-6">The subject you're looking for doesn't exist.</p>
                <Button onClick={() => navigate('/teacher/dashboard')} variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>
            </div>
        );
    }

    const toggleLecture = async (lectureId) => {
        const isClosing = expandedLecture === lectureId;
        setExpandedLecture(isClosing ? null : lectureId);
        setActiveTranscriptTab(null);
        // Lazy-load full lecture details on first expand
        if (!isClosing && !lectureDetails[lectureId]) {
            setDetailLoading(prev => ({ ...prev, [lectureId]: true }));
            try {
                const { data } = await lecturesAPI.get(lectureId);
                setLectureDetails(prev => ({ ...prev, [lectureId]: data }));
            } catch (err) {
                console.error('Failed to load lecture detail:', err);
            } finally {
                setDetailLoading(prev => ({ ...prev, [lectureId]: false }));
            }
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/teacher/dashboard')}
                    className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {subject.title}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
                        {subject.description}
                    </p>
                </div>
            </div>

            {/* Subject Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="border-none bg-blue-50/50 dark:bg-blue-900/10">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Presentation className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Lectures</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{lectures.length}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lectures Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Lectures</h2>
                    <Link to="/teacher/upload">
                        <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-sm">
                            <Upload className="w-3.5 h-3.5" />
                            Upload New
                        </Button>
                    </Link>
                </div>

                {lectures.length === 0 ? (
                    <Card className="border-dashed border-2 border-gray-200 dark:border-gray-700">
                        <CardContent className="py-12 text-center">
                            <Presentation className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 font-medium">No lectures uploaded yet</p>
                            <p className="text-sm text-gray-400 mt-1">Upload your first lecture to get started</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {lectures.map((lecture, idx) => {
                            const isExpanded = expandedLecture === lecture.id;
                            const isLoadingDetail = detailLoading[lecture.id];
                            const detail = lectureDetails[lecture.id] || null;
                            // Derive file buckets from lazy-loaded detail
                            const audioFiles = detail?.audio ? [{
                                id: detail.audio.id,
                                name: `${lecture.title} — Audio`,
                                duration: detail.audio.duration_seconds
                                    ? `${Math.floor(detail.audio.duration_seconds / 60)}m ${detail.audio.duration_seconds % 60}s`
                                    : 'Duration unknown',
                                size: detail.audio.file_size
                                    ? `${(detail.audio.file_size / 1048576).toFixed(1)} MB`
                                    : 'Size unknown',
                            }] : [];
                            const materials = detail?.materials || [];
                            const slidesFiles = materials.filter(m => m.m_type === 'PPT').map(m => ({
                                id: m.id, name: m.file_url ? m.file_url.split('/').pop() : 'Slides', size: '', pages: ''
                            }));
                            const notesFiles = materials.filter(m => m.m_type === 'NOTES').map(m => ({
                                id: m.id, name: m.file_url ? m.file_url.split('/').pop() : 'Notes', size: ''
                            }));
                            const hasTranscript = materials.some(m => m.m_type === 'TRANSCRIPT' && m.is_processed_for_rag);
                            const transcriptMaterial = materials.find(m => m.m_type === 'TRANSCRIPT');

                            return (
                                <Card
                                    key={lecture.id}
                                    className={`overflow-hidden transition-all duration-300 ${isExpanded
                                        ? 'shadow-lg border-blue-200 dark:border-blue-800/50 ring-1 ring-blue-100 dark:ring-blue-900/30'
                                        : 'hover:shadow-md border-gray-100 dark:border-gray-800'
                                        }`}
                                >
                                    {/* Lecture Header Row */}
                                    <button
                                        onClick={() => toggleLecture(lecture.id)}
                                        className="w-full text-left"
                                    >
                                        <CardContent className="p-4 flex items-center gap-4">
                                            {/* Lecture Number Badge */}
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors duration-300 ${isExpanded
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                                }`}>
                                                {idx + 1}
                                            </div>

                                            {/* Title + Meta */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                                                    {lecture.title}
                                                </h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(lecture.lecture_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{lecture.material_count} materials</span>
                                                </div>
                                            </div>

                                            {/* Resource indicators */}
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center" title="Audio">
                                                        <Headphones className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    {lecture.has_transcript && (
                                                        <div className="w-6 h-6 rounded-md bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center" title="Transcript">
                                                            <FileText className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </button>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2 duration-300">
                                            {isLoadingDetail ? (
                                                <div className="p-8 flex items-center justify-center text-sm text-gray-500">
                                                    <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
                                                    Loading details...
                                                </div>
                                            ) : (
                                            <div className="p-5 space-y-5">

                                                {/* Audio Section */}
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                        <Headphones className="w-4 h-4 text-blue-500" />
                                                        Audio Recording
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {audioFiles.map(file => (
                                                            <div key={file.id} className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20">
                                                                <div className="flex items-center gap-3">
                                                                    <button
                                                                        onClick={() => setPlayingAudio(playingAudio === file.id ? null : file.id)}
                                                                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                                                    >
                                                                        {playingAudio === file.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                                                                    </button>
                                                                    <div>
                                                                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{file.name}</p>
                                                                        <p className="text-xs text-gray-500">{file.duration} • {file.size}</p>
                                                                    </div>
                                                                </div>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600">
                                                                    <Download className="w-4 h-4" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Slides & Notes - Side by Side */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Slides */}
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                            <Presentation className="w-4 h-4 text-orange-500" />
                                                            Lecture Slides
                                                        </h4>
                                                        {slidesFiles.length > 0 ? (
                                                            slidesFiles.map(file => (
                                                                <div key={file.id} className="flex items-center justify-between p-3 bg-orange-50/50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-900/20">
                                                                    <div className="flex items-center gap-3">
                                                                        <File className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                                                        <div>
                                                                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate max-w-[180px]">{file.name}</p>
                                                                            <p className="text-xs text-gray-500">{file.size} • {file.pages}</p>
                                                                        </div>
                                                                    </div>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-orange-600">
                                                                        <Download className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-6 text-gray-400 border-dashed border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm">
                                                                No slides uploaded
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Notes */}
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                            <StickyNote className="w-4 h-4 text-purple-500" />
                                                            Additional Notes
                                                        </h4>
                                                        {notesFiles.length > 0 ? (
                                                            notesFiles.map(file => (
                                                                <div key={file.id} className="flex items-center justify-between p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/20">
                                                                    <div className="flex items-center gap-3">
                                                                        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                                        <div>
                                                                            <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate max-w-[180px]">{file.name}</p>
                                                                            <p className="text-xs text-gray-500">{file.size}</p>
                                                                        </div>
                                                                    </div>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-purple-600">
                                                                        <Download className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-center py-6 text-gray-400 border-dashed border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm">
                                                                No notes uploaded
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Transcript */}
                                                {hasTranscript && (
                                                    <div>
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                                <FileText className="w-4 h-4 text-emerald-500" />
                                                                Transcript
                                                            </h4>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setActiveTranscriptTab(activeTranscriptTab === lecture.id ? null : lecture.id)}
                                                                    className="text-xs h-7 px-2 text-blue-600 hover:text-blue-700"
                                                                >
                                                                    {activeTranscriptTab === lecture.id ? 'Collapse' : 'Expand'}
                                                                    {activeTranscriptTab === lecture.id ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        <div className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 ${activeTranscriptTab === lecture.id ? 'max-h-[400px]' : 'max-h-24'
                                                            }`}>
                                                            <ScrollArea className={activeTranscriptTab === lecture.id ? 'h-[400px]' : 'h-24'}>
                                                                <div className="p-4 space-y-3">
                                                                    {transcriptMaterial?.content_text ? (
                                                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                                                            {transcriptMaterial.content_text}
                                                                        </p>
                                                                    ) : (
                                                                        <p className="text-sm text-gray-400">No transcript available for this lecture.</p>
                                                                    )}
                                                                </div>
                                                            </ScrollArea>
                                                            {activeTranscriptTab !== lecture.id && (
                                                                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-50 dark:from-gray-800/50 to-transparent pointer-events-none" />
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-3 pt-2">
                                                    <Link to={`/teacher/lectures/${lecture.id}`}>
                                                        <Button variant="outline" size="sm" className="text-xs gap-1.5">
                                                            View Full Details
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-gray-500">
                                                        <Download className="w-3.5 h-3.5" />
                                                        Download All
                                                    </Button>
                                                </div>
                                            </div>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherSubjectDetail;
