import React, { useState, useEffect } from 'react';
import { teacherAPI } from '../services/api';

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [realTimeAttendance, setRealTimeAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchDashboardData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [classesResponse, realTimeResponse] = await Promise.all([
        teacherAPI.getClasses(),
        teacherAPI.getRealTimeAttendance()
      ]);

      setClasses(classesResponse.data.data.classes);
      setRealTimeAttendance(realTimeResponse.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600">Manage your classes and track attendance in real-time.</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Classes</p>
              <p className="text-2xl font-bold text-gray-900">
                {realTimeAttendance?.totalActiveClasses || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Attendance</p>
              <p className="text-2xl font-bold text-gray-900">
                {realTimeAttendance?.currentAttendance?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Attendance</p>
              <p className="text-2xl font-bold text-gray-900">
                {classes.reduce((sum, cls) => sum + (cls.attendance_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Attendance */}
      {realTimeAttendance?.currentAttendance && realTimeAttendance.currentAttendance.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            👥 Current Class Attendance ({realTimeAttendance.currentAttendance.length} students)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {realTimeAttendance.currentAttendance.map((student) => (
              <div key={student.student_id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {student.student_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-green-900">{student.student_name}</p>
                    <p className="text-sm text-green-600">
                      {new Date(student.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Classes */}
      {realTimeAttendance?.activeClasses && realTimeAttendance.activeClasses.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🟢 Active Classes</h2>
          <div className="space-y-3">
            {realTimeAttendance.activeClasses.map((classItem) => (
              <div key={classItem.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">{classItem.subject}</p>
                    <p className="text-sm text-blue-600">
                      {new Date(classItem.date).toLocaleDateString()} • 
                      Expires: {new Date(classItem.qr_expiry_time).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-900">{classItem.present_count}</p>
                    <p className="text-sm text-blue-600">students present</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Classes */}
      {classes && classes.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Classes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Subject</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Attendance</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classes.slice(0, 10).map((classItem) => (
                  <tr key={classItem.id}>
                    <td className="table-cell font-medium">{classItem.subject}</td>
                    <td className="table-cell">{new Date(classItem.date).toLocaleDateString()}</td>
                    <td className="table-cell">{classItem.attendance_count || 0} students</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        new Date(classItem.qr_expiry_time) > new Date()
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {new Date(classItem.qr_expiry_time) > new Date() ? 'Active' : 'Expired'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/teacher/generate-qr"
            className="flex items-center p-4 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <span className="text-2xl mr-3">📱</span>
            <div>
              <p className="font-medium text-primary-900">Generate QR Code</p>
              <p className="text-sm text-primary-600">Create a new QR code for your class</p>
            </div>
          </a>
          
          <a
            href="/teacher/classes"
            className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span className="text-2xl mr-3">📚</span>
            <div>
              <p className="font-medium text-blue-900">View All Classes</p>
              <p className="text-sm text-blue-600">See all your classes and attendance records</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
