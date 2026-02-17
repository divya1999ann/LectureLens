import React, { useState } from 'react';
import Sidebar from './Sidebar';
import useAuthStore from '../../store/authStore';

const DashboardLayout = ({ children, role }) => {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((state) => state.user);
  const userRole = role || user?.role || 'student';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar role={userRole} collapsed={collapsed} setCollapsed={setCollapsed} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
