import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  Home, Users, User, Upload, Mic,
  ChevronLeft, ChevronRight,
  Moon, Sun, LogOut, GraduationCap, Menu, X, Sparkles
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { authAPI, coursesAPI } from '../../services/api';

const Sidebar = ({ role, collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, refreshToken } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [askAIOpen, setAskAIOpen] = useState(false);
  const [aiCourses, setAiCourses] = useState([]);

  const menuItems = {
    admin: [
      { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
      { icon: Users, label: 'Teachers', path: '/admin/teachers' },
      { icon: GraduationCap, label: 'Subjects', path: '/admin/subjects' },
      { icon: User, label: 'Students', path: '/admin/students' },
    ],
    teacher: [
      { icon: Home, label: 'Dashboard', path: '/teacher/dashboard' },
      { icon: Mic, label: 'Record New', path: '/teacher/record' },
      { icon: Upload, label: 'Upload Lectures', path: '/teacher/upload' },
      { icon: User, label: 'Profile', path: '/teacher/profile' }
    ],
    student: [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: Sparkles, label: 'Ask AI', action: 'ask-ai' },
      { icon: User, label: 'Profile', path: '/profile' }
    ]
  };

  const items = menuItems[role] || menuItems.student;

  const handleLogout = async () => {
    try {
      if (refreshToken) await authAPI.logout(refreshToken);
    } catch (e) {
      // Ignore logout errors — clean up locally regardless
    }
    logout();
    navigate('/login');
  };

  // Fetch courses for the Ask AI dialog when it opens
  useEffect(() => {
    if (askAIOpen) {
      coursesAPI.list().then(({ data }) => {
        setAiCourses(data.results ?? data);
      }).catch(() => setAiCourses([]));
    }
  }, [askAIOpen]);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <Link to={`/${role === 'admin' ? 'admin/dashboard' : role === 'teacher' ? 'teacher/dashboard' : 'dashboard'}`}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            {!collapsed && (
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                LectureAI
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.action === 'ask-ai') {
            return (
              <button
                key={item.label}
                onClick={() => {
                  setMobileOpen(false);
                  setAskAIOpen(true);
                }}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 w-full
                  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${isActive
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
              title={collapsed ? item.label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`
            flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full
            text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? (darkMode ? 'Light Mode' : 'Dark Mode') : ''}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {!collapsed && (
            <span className="font-medium">
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>

        {/* Profile Section */}
        {!collapsed && (
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar>
                <AvatarFallback className="bg-blue-500 text-white">
                  {(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.full_name || user?.email}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {role?.charAt(0).toUpperCase() + role?.slice(1)}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        )}

        {collapsed && (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-3 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 h-screen sticky top-0
          ${collapsed ? 'w-20' : 'w-64'}
        `}
      >
        <SidebarContent />

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`
          lg:hidden fixed left-0 top-0 bottom-0 z-40 w-64
          bg-white dark:bg-gray-800 flex flex-col
          transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent />
      </aside>

      {/* Ask AI Subject Selection Modal */}
      <Dialog open={askAIOpen} onOpenChange={setAskAIOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select a Subject</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {aiCourses.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">No subjects available.</p>
            ) : aiCourses.map((subject) => (
              <button
                key={subject.id}
                onClick={() => {
                  setAskAIOpen(false);
                  navigate(`/subjects/${subject.id}/chat`);
                }}
                className="w-full flex items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 text-left group"
              >
                <div className="bg-blue-50 dark:bg-blue-900/30 p-2.5 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-200">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {subject.title}
                  </h4>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Sidebar;