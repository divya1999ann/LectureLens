import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Book, FileText, Users, Clock, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import useAuthStore from '../../store/authStore';
import { coursesAPI, getErrorMessage } from '../../services/api';
import { getCurrentDate } from '../../utils/dateUtils';

const StatCard = ({ title, value, icon: Icon, iconBg, subtext, animated }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</h3>
          {subtext && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${iconBg} ${animated ? 'animate-pulse' : ''}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const SubjectCard = ({ subject }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/subjects/${subject.id}`)}
      className="block h-full cursor-pointer group"
    >
      <Card className="hover:shadow-lg transition-all duration-200 h-full">
        <CardContent className="pt-6 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                {subject.title}
              </h3>
              {subject.teacher_email && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subject.teacher_email}</p>
              )}
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg shrink-0">
              <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="space-y-3 mb-4 flex-1">
            {subject.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{subject.description}</p>
            )}
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <FileText className="w-4 h-4" />
              <span>{subject.lecture_count ?? 0} lectures</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>
                Added{' '}
                {subject.created_at
                  ? new Date(subject.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : '—'}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mt-auto" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => { e.stopPropagation(); navigate(`/subjects/${subject.id}`); }}
            >
              View Lectures
            </Button>
            <Link to={`/subjects/${subject.id}/chat`} className="flex-1">
              <Button size="sm" className="w-full">
                <MessageSquare className="w-4 h-4 mr-1" />
                Chat
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCourses = async () => {
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

  useEffect(() => { fetchCourses(); }, []);

  const totalLectures = courses.reduce((sum, c) => sum + (c.lecture_count ?? 0), 0);
  const displayName = user?.full_name || user?.email?.split('@')[0] || 'Student';

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {displayName}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{getCurrentDate()}</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </span>
          <Button variant="ghost" size="sm" onClick={fetchCourses} className="gap-1 text-red-600 hover:text-red-700">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="Available Subjects"
          value={loading ? '—' : courses.length}
          icon={Book}
          iconBg="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Total Lectures"
          value={loading ? '—' : totalLectures}
          icon={FileText}
          iconBg="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
          subtext="available"
        />
      </div>

      {/* Subjects */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Available Subjects</h2>
          {!loading && (
            <Badge variant="outline" className="text-xs font-semibold">
              {courses.length} subject{courses.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse"><CardContent className="p-6 h-52" /></Card>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <Book className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="font-medium">No subjects available yet</p>
            <p className="text-sm mt-1">Check back later for new subjects.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(subject => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;