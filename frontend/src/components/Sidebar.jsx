import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return null;
  }

  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
          { path: '/admin/users', label: 'Manage Users', icon: '👥' },
        ];
      case 'teacher':
        return [
          { path: '/teacher/dashboard', label: 'Dashboard', icon: '📊' },
          { path: '/teacher/generate-qr', label: 'Generate QR', icon: '📱' },
          { path: '/teacher/classes', label: 'My Classes', icon: '📚' },
          { path: '/teacher/attendance', label: 'Attendance', icon: '✅' },
        ];
      case 'student':
        return [
          { path: '/student/dashboard', label: 'Dashboard', icon: '📊' },
          { path: '/student/scan', label: 'Scan QR', icon: '📱' },
          { path: '/student/attendance', label: 'My Attendance', icon: '📋' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="bg-white shadow-lg h-full w-64 border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Navigation
        </h2>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
