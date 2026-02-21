import React, { useState } from 'react';
import { Link } from 'react-router';
import { Plus, Search, Filter, Edit, Trash2, FileText, Video, MoreHorizontal, Download, FileAudio, Calendar, SortDesc } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { mockLectures, mockSubjects } from '../../utils/mockData';

const LectureList = () => {
    const [search, setSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');

    // Filter lectures for current teacher (id=2)
    const mySubjects = mockSubjects.filter(s => s.instructorId === 2);
    const myLectures = mockLectures.filter(l => mySubjects.some(s => s.id === l.subjectId));

    const filteredLectures = myLectures.filter(lecture => {
        const matchesSearch = lecture.title.toLowerCase().includes(search.toLowerCase());
        const matchesSubject = subjectFilter === 'all' || lecture.subjectId.toString() === subjectFilter;
        const matchesStatus = statusFilter === 'all' || lecture.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesSubject && matchesStatus;
    }).sort((a, b) => {
        if (sortOrder === 'newest') return new Date(b.date) - new Date(a.date);
        if (sortOrder === 'oldest') return new Date(a.date) - new Date(b.date);
        if (sortOrder === 'subject') {
            const subA = mySubjects.find(s => s.id === a.subjectId)?.code || '';
            const subB = mySubjects.find(s => s.id === b.subjectId)?.code || '';
            return subA.localeCompare(subB);
        }
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
                                <SelectTrigger className="w-[160px]">
                                    <Filter className="w-4 h-4 mr-2 text-gray-500" />
                                    <SelectValue placeholder="Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Subjects</SelectItem>
                                    {mySubjects.map(s => (
                                        <SelectItem key={s.id} value={s.id.toString()}>{s.code}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="processed">Processed</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="error">Error</SelectItem>
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
            {filteredLectures.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    <p>No lectures found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLectures.map((lecture) => {
                        const subject = mySubjects.find(s => s.id === lecture.subjectId);
                        return (
                            <Card key={lecture.id} className="group hover:shadow-lg transition-all duration-200 flex flex-col h-full">
                                <CardContent className="p-5 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <Badge variant="outline" className="mb-2 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                                                {subject?.code} • Lecture {lecture.number}
                                            </Badge>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
                                                {lecture.title}
                                            </h3>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
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
                                                <DropdownMenuItem>
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download Assets
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            {new Date(lecture.date).toLocaleDateString()}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <div className="flex items-center text-xs font-medium bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full text-gray-600 dark:text-gray-300">
                                                <FileAudio className="w-3 h-3 mr-1.5" />
                                                1 Audio
                                            </div>
                                            {lecture.hasPPT && (
                                                <div className="flex items-center text-xs font-medium bg-orange-50 dark:bg-orange-900/20 px-2.5 py-1 rounded-full text-orange-700 dark:text-orange-400">
                                                    <FileText className="w-3 h-3 mr-1.5" />
                                                    Slides
                                                </div>
                                            )}
                                            {lecture.hasNotes && (
                                                <div className="flex items-center text-xs font-medium bg-purple-50 dark:bg-purple-900/20 px-2.5 py-1 rounded-full text-purple-700 dark:text-purple-400">
                                                    <FileText className="w-3 h-3 mr-1.5" />
                                                    Notes
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                        <Badge variant={lecture.status === 'Processed' ? 'default' : lecture.status === 'Processing' ? 'secondary' : 'destructive'}>
                                            {lecture.status}
                                        </Badge>
                                        <Link to={`/teacher/lectures/${lecture.id}`}>
                                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 p-0 h-auto">
                                                View Details <span className="ml-1">→</span>
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LectureList;
