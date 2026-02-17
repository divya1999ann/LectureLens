import React from 'react';
import { Link } from 'react-router';
import { Book, Video, Users, Upload, Mic, ArrowRight, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { mockSubjects, mockLectures } from '../../utils/mockData';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card className="border-none bg-white dark:bg-gray-800/40 shadow-sm overflow-hidden">
    <CardContent className="p-5 flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${color.bg} ${color.text}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{value}</h3>
      </div>
    </CardContent>
  </Card>
);

const QuickActionCard = ({ title, icon: Icon, gradient, to }) => (
  <Link to={to} className="block group">
    <Card className={`border-none ${gradient} text-white transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5 h-24 flex items-center rounded-2xl`}>
      <CardContent className="w-full flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm border border-white/10">
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        </div>
        <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </CardContent>
    </Card>
  </Link>
);

const SubjectCard = ({ subject, lectureCount }) => (
  <Card className="group hover:shadow-md transition-all duration-300 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
    <CardContent className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
          <GraduationCap className="w-5 h-5" />
        </div>
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-none font-bold">
          {subject.code}
        </Badge>
      </div>

      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 line-clamp-1">
        {subject.name}
      </h3>

      <div className="flex items-center gap-6 mb-6">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium">Lectures</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">{lectureCount}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 font-medium">Students</span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">{subject.studentCount}</span>
        </div>
      </div>

      <Link to="/teacher/lectures">
        <Button variant="ghost" className="w-full group/btn font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-10">
          Open Resources
          <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </Link>
    </CardContent>
  </Card>
);

const TeacherDashboard = () => {
  const teacherId = 2; // Dr. Sarah Smith from mockData
  const mySubjects = mockSubjects.filter(s => s.instructorId === teacherId);
  const myLectures = mockLectures.filter(l => mySubjects.some(s => s.id === l.subjectId));

  const stats = {
    totalSubjects: mySubjects.length,
    totalLectures: myLectures.length,
    totalStudents: mySubjects.reduce((acc, sub) => acc + sub.studentCount, 0),
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6 animate-in fade-in duration-500">
      {/* Simplified Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Teacher Dashboard</h1>
          <p className="text-sm text-gray-500 font-medium">Managing your active curriculum and content</p>
        </div>
        <Badge variant="outline" className="h-7 px-3 text-xs font-bold border-gray-200 dark:border-gray-800 text-gray-500">
          Active Semester
        </Badge>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Subjects"
          value={stats.totalSubjects}
          icon={Book}
          color={{ bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' }}
        />
        <StatCard
          title="Lectures"
          value={stats.totalLectures}
          icon={Video}
          color={{ bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' }}
        />
        <StatCard
          title="Students"
          value={stats.totalStudents}
          icon={Users}
          color={{ bg: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-400' }}
        />
      </div>

      {/* Elegant Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QuickActionCard
          title="Record New Lecture"
          icon={Mic}
          gradient="bg-blue-600 hover:bg-blue-700"
          to="/teacher/record"
        />
        <QuickActionCard
          title="Upload Lecture Files"
          icon={Upload}
          gradient="bg-emerald-600 hover:bg-emerald-700"
          to="/teacher/upload"
        />
      </div>

      {/* My Subjects Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            My Subjects
          </h2>
          <Link to="/teacher/lectures" className="text-sm font-bold text-blue-600 hover:text-blue-700">
            View All Lectures
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mySubjects.map(subject => {
            const lectureCount = mockLectures.filter(l => l.subjectId === subject.id).length;
            return (
              <SubjectCard
                key={subject.id}
                subject={subject}
                lectureCount={lectureCount}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;