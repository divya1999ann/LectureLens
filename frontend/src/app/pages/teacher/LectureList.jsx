import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
    Plus, Search, Filter, Trash2, FileText, Video, MoreHorizontal,
    FileAudio, Calendar, SortDesc, AlertCircle, RefreshCw
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import useAuthStore from '../../store/authStore';
import { coursesAPI, lecturesAPI, getErrorMessage } from '../../services/api';

const LectureList = () => {
    const { user } = useAuthStore();
    const [search, setSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');

    const [courses, setCourses] = useState([]);
    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            // Fetch teacher's courses first
            const { data: coursesData } = await coursesAPI.list(user?.id);
            const myCourses = coursesData.results ?? coursesData;
            setCourses(myCourses);

            // Fetch all lectures for each course
            const lecturePromises = myCourses.map(c =>
                lecturesAPI.list(c.id).then(r => r.data.results ?? r.data)
            );
            const lectureArrays = await Promise.all(lecturePromises);
            setLectures(lectureArrays.flat());
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [user?.id]);

    const handleDelete = async (lectureId) => {
        if (!window.confirm('Delete this lecture? This cannot be undone.')) return;
        try {
            await lecturesAPI.delete(lectureId);
            setLectures(prev => prev.filter(l => l.id !== lectureId));
        } catch (err) {
            alert(getErrorMessage(err));
        }
    };

    const filteredLectures = lectures
        .filter(lecture => {
            const matchesSearch = lecture.title.toLowerCase().includes(search.toLowerCase());
            const matchesSubject = subjectFilter === 'all' || lecture.subject === subjectFilter;
            return matchesSearch && matchesSubject;
        })
        .sort((a, b) => {
            if (sortOrder === 'newest') return new Date(b.lecture_date || b.created_at) - new Date(a.lecture_date || a.created_at);
            if (sortOrder === 'oldest') return new Date(a.lecture_date || a.created_at) - new Date(b.lecture_date || b.created_at);
            if (sortOrder === 'subject') return (a.subject_title || '').localeCompare(b.subject_title || '');
            return 0;
        });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Lectures</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and organize your lecture content</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/teacher/record">
                        <Button variant="secondary" className="gap-2">
                            <Video className="w-4 h-4" />
                            Record New
                        </Button>
                    </Link>
                    <Link to="/teacher/upload">
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="w-4 h-4" />
                            Upload Lecture
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="flex items-center justify-between gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
                    <span className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                    </span>
                    <Button variant="ghost" size="sm" onClick={fetchData} className="gap-1 text-red-600 hover:text-red-700">
                        <RefreshCw className="w-3.5 h-3.5" /> Retry
                    </Button>
                </div>
            )}

            {/* Filters and Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search lectures..."
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="w-4 h-4 mr-2 text-gray-500" />
                                    <SelectValue placeholder="Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Subjects</SelectItem>
                                    {courses.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={sortOrder} onValueChange={setSortOrder}>
                                <SelectTrigger className="w-[160px]">
                                    <SortDesc className="w-4 h-4 mr-2 text-gray-500" />
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                    <SelectItem value="subject">By Subject</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Lecture Cards Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-5 h-44" />
                        </Card>
                    ))}
                </div>
            ) : filteredLectures.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <FileAudio className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="font-medium">No lectures found</p>
                    <p className="text-sm mt-1">Upload a lecture to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLectures.map((lecture) => (
                        <Card key={lecture.id} className="group hover:shadow-lg transition-all duration-200 flex flex-col h-full">
                            <CardContent className="p-5 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                                            {lecture.subject_title || 'Unknown Subject'}
                                        </Badge>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
                                            {lecture.title}
                                        </h3>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 shrink-0">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link to={`/teacher/lectures/${lecture.id}`}>
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    View Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-600"
                                                onClick={() => handleDelete(lecture.id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {lecture.lecture_date
                                            ? new Date(lecture.lecture_date).toLocaleDateString()
                                            : '—'}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="flex items-center text-xs font-medium bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full text-gray-600 dark:text-gray-300">
                                            <FileAudio className="w-3 h-3 mr-1.5" />
                                            {lecture.audio ? '1 Audio' : 'No Audio'}
                                        </div>
                                        <div className="flex items-center text-xs font-medium bg-purple-50 dark:bg-purple-900/20 px-2.5 py-1 rounded-full text-purple-700 dark:text-purple-400">
                                            <FileText className="w-3 h-3 mr-1.5" />
                                            {lecture.material_count ?? 0} materials
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end">
                                    <Link to={`/teacher/lectures/${lecture.id}`}>
                                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 p-0 h-auto">
                                            View Details <span className="ml-1">→</span>
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LectureList;
