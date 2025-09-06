import React, { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import QuickQRScanner from '../components/QuickQRScanner';

const StudentDashboard = () => {
  const [attendance, setAttendance] = useState(null);
  const [recentClasses, setRecentClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [attendanceResponse, classesResponse] = await Promise.all([
        studentAPI.getAttendance(),
        studentAPI.getRecentClasses()
      ]);

      setAttendance(attendanceResponse.data.data);
      setRecentClasses(classesResponse.data.data.classes);
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
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your attendance overview.</p>
      </div>

      {/* Statistics Cards */}
      {attendance?.statistics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendance.statistics.total_classes || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attended</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendance.statistics.attended_classes || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attendance %</p>
                <p className="text-2xl font-bold text-gray-900">
                  {attendance.statistics.attendance_percentage || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subject-wise Statistics */}
      {attendance?.subjectStatistics && attendance.subjectStatistics.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Attendance by Subject</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Subject</th>
                  <th className="table-header">Total Classes</th>
                  <th className="table-header">Attended</th>
                  <th className="table-header">Percentage</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.subjectStatistics.map((subject, index) => (
                  <tr key={index}>
                    <td className="table-cell font-medium">{subject.subject}</td>
                    <td className="table-cell">{subject.total_classes}</td>
                    <td className="table-cell">{subject.attended_classes}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subject.attendance_percentage >= 80 
                          ? 'bg-green-100 text-green-800'
                          : subject.attendance_percentage >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {subject.attendance_percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick QR Scanner */}
      <QuickQRScanner />

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/student/scan"
            className="flex items-center p-4 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
          >
            <span className="text-2xl mr-3">📱</span>
            <div>
              <p className="font-medium text-primary-900">Camera Scanner</p>
              <p className="text-sm text-primary-600">Use camera to scan QR codes</p>
            </div>
          </a>
          
          <a
            href="/student/attendance"
            className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span className="text-2xl mr-3">📋</span>
            <div>
              <p className="font-medium text-blue-900">View Attendance</p>
              <p className="text-sm text-blue-600">Check your attendance records</p>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Classes */}
      {recentClasses && recentClasses.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Classes</h2>
          <div className="space-y-3">
            {recentClasses.slice(0, 5).map((classItem) => (
              <div key={classItem.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{classItem.subject}</p>
                  <p className="text-sm text-gray-600">
                    {classItem.teacher_name} • {new Date(classItem.date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  classItem.status === 'attended'
                    ? 'bg-green-100 text-green-800'
                    : classItem.status === 'active'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {classItem.status === 'attended' ? 'Attended' : 
                   classItem.status === 'active' ? 'Active' : 'Expired'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Attendance Records */}
      {attendance?.attendance && attendance.attendance.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Attendance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Subject</th>
                  <th className="table-header">Teacher</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.attendance.slice(0, 10).map((record) => (
                  <tr key={record.id}>
                    <td className="table-cell font-medium">{record.subject}</td>
                    <td className="table-cell">{record.teacher_name}</td>
                    <td className="table-cell">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="table-cell">{new Date(record.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
