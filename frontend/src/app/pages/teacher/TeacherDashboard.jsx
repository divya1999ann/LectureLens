import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Book, Video, Users, Upload, Mic, ArrowRight, GraduationCap, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import useAuthStore from '../../store/authStore';
import { coursesAPI, lecturesAPI, getErrorMessage } from '../../services/api';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <Card className="border-none bg-white dark:bg-gray-800/40 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
    <CardContent className="p-5 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color.bg} ${color.text} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{value}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </CardContent>
  </Card>
);

const QuickActionCard = ({ title, description, icon: Icon, gradient, to }) => (
  <Link to={to} className="block group">
    <Card className={`border-none ${gradient} text-white transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 h-28 flex items-center rounded-2xl overflow-hidden relative`}>
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-300" />
      <CardContent className="w-full flex items-center justify-between p-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/15 rounded-xl backdrop-blur-sm border border-white/10 group-hover:bg-white/25 transition-all duration-300">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">{title}</h3>
            <p className="text-sm text-white/70 mt-0.5">{description}</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
      </CardContent>
    </Card>
  </Link>
);

const SubjectCard = ({ subject, onClick }) => (
  <button onClick={onClick} className="block w-full text-left group">
    <Card className="group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden cursor-pointer">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
            <GraduationCap className="w-5 h-5" />
          </div>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-none font-bold text-xs">
            {subject.lecture_count ?? 0} lectures
          </Badge>
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          {subject.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
          {subject.description || 'No description provided.'}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            {subject.created_at
              ? new Date(subject.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : '—'}
          </div>
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
            View Subject
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </CardContent>
    </Card>
  </button>
);

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [courses, setCourses] = useState([]);
  const [totalLectures, setTotalLectures] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch courses belonging to this teacher
        const { data: coursesData } = await coursesAPI.list(user?.id);

        // data is paginated: { count, next, previous, results } or plain array
        const results = coursesData.results ?? coursesData;
        setCourses(results);

        // Sum lecture counts from the list serializer
        const lectureSum = results.reduce((acc, c) => acc + (c.lecture_count ?? 0), 0);
        setTotalLectures(lectureSum);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const stats = {
    totalSubjects: courses.length,
    totalLectures,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Teacher Dashboard</h1>
          <p className="text-sm text-gray-500 font-medium">
            Welcome back, {user?.full_name || user?.email}
          </p>
        </div>
        <Badge variant="outline" className="h-7 px-3 text-xs font-bold border-gray-200 dark:border-gray-800 text-gray-500">
          Active Semester
        </Badge>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Subjects"
          value={loading ? '—' : stats.totalSubjects}
          subtitle="Active courses"
          icon={Book}
          color={{ bg: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400' }}
        />
        <StatCard
          title="Lectures"
          value={loading ? '—' : stats.totalLectures}
          subtitle="Total uploaded"
          icon={Video}
          color={{ bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' }}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <QuickActionCard
          title="Record New Lecture"
          description="Start a live recording session"
          icon={Mic}
          gradient="bg-gradient-to-br from-blue-600 to-blue-700"
          to="/teacher/record"
        />
        <QuickActionCard
          title="Upload Lecture Files"
          description="Upload audio, transcripts & slides"
          icon={Upload}
          gradient="bg-gradient-to-br from-emerald-600 to-emerald-700"
          to="/teacher/upload"
        />
      </div>

      {/* My Subjects */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Subjects</h2>
            <p className="text-xs text-gray-500 mt-1">Click on a subject to view lectures and resources</p>
          </div>
          <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
            {loading ? '—' : `${courses.length} subjects`}
          </Badge>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="border-gray-100 dark:border-gray-800 animate-pulse">
                <CardContent className="p-6 h-48" />
              </Card>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <GraduationCap className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="font-medium">No subjects yet</p>
            <p className="text-sm mt-1">Contact your admin to have subjects assigned to you.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(subject => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onClick={() => navigate(`/teacher/subjects/${subject.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;