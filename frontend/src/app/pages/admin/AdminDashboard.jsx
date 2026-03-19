import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  GraduationCap, BookOpen, Presentation, ArrowRight, AlertCircle, RefreshCw
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { coursesAPI, getErrorMessage } from '../../services/api';

const StatCard = ({ title, value, subtitle, icon: Icon, color, onClick, loading }) => {
  const colorMap = {
    blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-600 dark:text-blue-400', ring: 'hover:ring-blue-200 dark:hover:ring-blue-800' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-600 dark:text-emerald-400', ring: 'hover:ring-emerald-200 dark:hover:ring-emerald-800' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-900/20', icon: 'text-purple-600 dark:text-purple-400', ring: 'hover:ring-purple-200 dark:hover:ring-purple-800' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-900/20', icon: 'text-orange-600 dark:text-orange-400', ring: 'hover:ring-orange-200 dark:hover:ring-orange-800' },
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
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
            {loading ? <span className="inline-block w-8 h-6 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" /> : value}
          </p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-200" />
      </div>
    </button>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await coursesAPI.list();
      const results = data.results ?? data;
      setCourses(results);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalLectures = courses.reduce((acc, c) => acc + (c.lecture_count ?? 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of teachers, subjects, and content</p>
      </div>

      {/* Error */}
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

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Teachers"
          value="0"
          subtitle="Active faculty"
          icon={GraduationCap}
          color="blue"
          loading={false}
          onClick={() => navigate('/admin/teachers')}
        />
        <StatCard
          title="Students"
          value="0"
          subtitle="Enrolled"
          icon={GraduationCap}
          color="emerald"
          loading={false}
          onClick={() => navigate('/admin/students')}
        />
        <StatCard
          title="Subjects"
          value={loading ? '—' : courses.length}
          subtitle="From backend"
          icon={BookOpen}
          color="purple"
          loading={loading}
          onClick={() => navigate('/admin/subjects')}
        />
        <StatCard
          title="Lectures"
          value={loading ? '—' : totalLectures}
          subtitle="Uploaded"
          icon={Presentation}
          color="orange"
          loading={loading}
          onClick={() => navigate('/admin/subjects')}
        />
      </div>

      {/* Quick Overview Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teachers — still mock (no user-management API in phase 1) */}
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between p-5 pb-3 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Teachers</h2>
              <p className="text-[10px] text-amber-500 mt-0.5">Sample data — no user-management API yet</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700 h-7 px-2 gap-1" onClick={() => navigate('/admin/teachers')}>
              View all <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          <CardContent className="p-0">
            <div className="px-5 py-6 text-center text-sm text-gray-400">
              User management API coming soon
            </div>
          </CardContent>
        </Card>

        {/* Subjects — real API data */}
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between p-5 pb-3 border-b border-gray-100 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Subjects</h2>
            <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700 h-7 px-2 gap-1" onClick={() => navigate('/admin/subjects')}>
              View all <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
          <CardContent className="p-0">
            {loading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 dark:border-gray-800/50 last:border-b-0">
                  <div className="w-16 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              ))
            ) : courses.length === 0 ? (
              <div className="px-5 py-6 text-center text-sm text-gray-400">No subjects yet.</div>
            ) : (
              courses.slice(0, 4).map(subject => (
                <div
                  key={subject.id}
                  className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 dark:border-gray-800/50 last:border-b-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                  onClick={() => navigate('/admin/subjects')}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{subject.title}</p>
                    <p className="text-xs text-gray-400 truncate">{subject.teacher_email || '—'}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 text-xs text-gray-400">
                    <Presentation className="w-3 h-3" />
                    {subject.lecture_count ?? 0}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
