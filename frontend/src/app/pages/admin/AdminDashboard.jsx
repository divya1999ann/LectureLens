import React from 'react';
import { useNavigate } from 'react-router';
import {
  Users, GraduationCap, BookOpen, Presentation, ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { mockTeachers, mockSubjects, mockStudents, mockEnrollments, mockLectures } from '../../utils/mockData';

const StatCard = ({ title, value, subtitle, icon: Icon, color, onClick }) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      ring: 'hover:ring-blue-200 dark:hover:ring-blue-800',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      icon: 'text-emerald-600 dark:text-emerald-400',
      ring: 'hover:ring-emerald-200 dark:hover:ring-emerald-800',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      ring: 'hover:ring-purple-200 dark:hover:ring-purple-800',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      icon: 'text-orange-600 dark:text-orange-400',
      ring: 'hover:ring-orange-200 dark:hover:ring-orange-800',
    },
  };
  const c = colorMap[color];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-300 ring-2 ring-transparent ${c.ring} group`}
    >
      <div className="p-5 flex items-center gap-4">
        <div className={`p-2.5 rounded-xl ${c.bg}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-200" />
      </div>
    </button>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const totalStudents = mockStudents.length;
  const totalSubjects = mockSubjects.length;
  const totalLectures = mockLectures.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage teachers, subjects, and student enrollments</p>
      </div>

      {/* Stat Cards — all clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Teachers"
          value={mockTeachers.length}
          subtitle="Active faculty"
          icon={Users}
          color="blue"
          onClick={() => navigate('/admin/teachers')}
        />
        <StatCard
          title="Students"
          value={totalStudents}
          subtitle="Enrolled"
          icon={GraduationCap}
          color="emerald"
          onClick={() => navigate('/admin/students')}
        />
        <StatCard
          title="Subjects"
          value={totalSubjects}
          subtitle="Offered"
          icon={BookOpen}
          color="purple"
          onClick={() => navigate('/admin/subjects')}
        />
        <StatCard
          title="Lectures"
          value={totalLectures}
          subtitle="Uploaded"
          icon={Presentation}
          color="orange"
          onClick={() => navigate('/admin/subjects')}
        />
      </div>

      {/* Quick Overview Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Recent Teachers */}
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between p-5 pb-3 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Teachers</h2>
            <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700 h-7 px-2 gap-1" onClick={() => navigate('/admin/teachers')}>
              View all <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          <CardContent className="p-0">
            {mockTeachers.slice(0, 4).map(teacher => {
              const subjectCount = mockSubjects.filter(s => s.instructorId === teacher.id).length;
              return (
                <div key={teacher.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 dark:border-gray-800/50 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer" onClick={() => navigate('/admin/teachers')}>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    {teacher.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{teacher.name}</p>
                    <p className="text-xs text-gray-400 truncate">{teacher.department}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">{subjectCount} subject{subjectCount !== 1 ? 's' : ''}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Subjects Overview */}
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between p-5 pb-3 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Subjects</h2>
            <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700 h-7 px-2 gap-1" onClick={() => navigate('/admin/subjects')}>
              View all <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          <CardContent className="p-0">
            {mockSubjects.slice(0, 4).map(subject => {
              const enrolledCount = mockEnrollments.filter(e => e.subjectId === subject.id).length;
              return (
                <div key={subject.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 dark:border-gray-800/50 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer" onClick={() => navigate('/admin/subjects')}>
                  <Badge variant="secondary" className="text-[10px] font-bold shrink-0">{subject.code}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{subject.name}</p>
                    <p className="text-xs text-gray-400 truncate">{subject.instructor}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-xs text-gray-400">
                    <GraduationCap className="w-3 h-3" />
                    {enrolledCount}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
