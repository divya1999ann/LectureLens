import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Landing Page
import LandingPage from './pages/LandingPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import UploadLecture from './pages/teacher/UploadLecture';
import RecordingPage from './pages/teacher/RecordingPage';
import LectureList from './pages/teacher/LectureList';
import TeacherLectureDetail from './pages/teacher/TeacherLectureDetail';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import SubjectDetail from './pages/student/SubjectDetail';
import LectureDetail from './pages/student/LectureDetail';
import ChatInterface from './pages/student/ChatInterface';

// Shared Pages
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout role="admin">
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/teachers"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout role="admin">
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout role="admin">
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Configure system-wide settings</p>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher/dashboard"
          element={
            <ProtectedRoute role="teacher">
              <DashboardLayout role="teacher">
                <TeacherDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/lectures"
          element={
            <ProtectedRoute role="teacher">
              <DashboardLayout role="teacher">
                <LectureList />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/upload"
          element={
            <ProtectedRoute role="teacher">
              <DashboardLayout role="teacher">
                <UploadLecture />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/record"
          element={
            <ProtectedRoute role="teacher">
              <DashboardLayout role="teacher">
                <RecordingPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/lectures/:id"
          element={
            <ProtectedRoute role="teacher">
              <DashboardLayout role="teacher">
                <TeacherLectureDetail />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="student">
              <DashboardLayout role="student">
                <StudentDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects"
          element={
            <ProtectedRoute role="student">
              <DashboardLayout role="student">
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Subjects</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Browse all your enrolled subjects</p>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects/:id"
          element={
            <ProtectedRoute role="student">
              <DashboardLayout role="student">
                <SubjectDetail />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects/:id/chat"
          element={
            <ProtectedRoute role="student">
              <DashboardLayout role="student">
                <ChatInterface />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/subjects/:subjectId/lectures/:lectureId"
          element={
            <ProtectedRoute role="student">
              <DashboardLayout role="student">
                <LectureDetail />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat-history"
          element={
            <ProtectedRoute role="student">
              <DashboardLayout role="student">
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Chat History</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">View all your chat conversations</p>
                </div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Shared Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute role="any">
              <DashboardLayout role="any">
                <ProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Page not found</p>
                <a href="/login" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
                  Go back to login
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}