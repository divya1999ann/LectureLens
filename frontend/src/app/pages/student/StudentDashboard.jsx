import React from 'react';
import { Link, useNavigate } from 'react-router';
import { Book, FileText, Flame, Users, Clock, TrendingUp, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { mockSubjects, getCurrentDate, formatDate } from '../../utils/mockData';

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

  const handleCardClick = () => {
    navigate(`/subjects/${subject.id}`);
  };

  const handleChatClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={handleCardClick}
      className="block h-full cursor-pointer group"
    >
      <Card className="hover:shadow-lg transition-all duration-200 h-full">
        <CardContent className="pt-6 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{subject.code}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{subject.name}</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Book className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="space-y-3 mb-4 flex-1">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>{subject.instructor}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <FileText className="w-4 h-4" />
              <span>{subject.lectureCount} lectures</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Last accessed {formatDate(subject.lastAccessed)}</span>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium text-gray-900 dark:text-white">{subject.progress}%</span>
            </div>
            <Progress value={subject.progress} />
          </div>

          <div className="flex gap-2 mt-auto">
            <Button variant="outline" size="sm" className="flex-1">
              View Lectures
            </Button>
            <Link to={`/subjects/${subject.id}/chat`} onClick={handleChatClick} className="flex-1">
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
  const enrolledSubjects = mockSubjects.slice(0, 5);

  const stats = {
    enrolledSubjects: enrolledSubjects.length,
    totalLectures: enrolledSubjects.reduce((sum, s) => sum + s.lectureCount, 0),
    studyStreak: 7
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, John Student! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{getCurrentDate()}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Enrolled Subjects"
          value={stats.enrolledSubjects}
          icon={Book}
          iconBg="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Total Lectures"
          value={stats.totalLectures}
          icon={FileText}
          iconBg="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
          subtext="available"
        />
        <StatCard
          title="Study Streak"
          value={`${stats.studyStreak} 🔥`}
          icon={Flame}
          iconBg="bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400"
          subtext="days in a row"
          animated
        />
      </div>

      {/* Enrolled Subjects */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Subjects</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledSubjects.map(subject => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      </div>


    </div>
  );
};

export default StudentDashboard;