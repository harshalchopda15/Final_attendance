import React, { useState, useEffect } from 'react';
import { teacherAPI } from '../services/api';

const TeacherClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await teacherAPI.getClasses();
      setClasses(response.data.data.classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewAttendance = async (classId) => {
    try {
      const response = await teacherAPI.getClassAttendance(classId);
      // You could open a modal or navigate to a detailed view
      console.log('Class attendance:', response.data.data);
      // For now, we'll just show an alert
      alert(`Attendance for this class: ${response.data.data.totalPresent} students present`);
    } catch (error) {
      console.error('Error fetching class attendance:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
        <p className="text-gray-600">View all your classes and their attendance records.</p>
      </div>

      {/* Classes Table */}
      {classes && classes.length > 0 ? (
        <div className="card p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">Subject</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">QR Code</th>
                  <th className="table-header">Attendance</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classes.map((classItem) => (
                  <tr key={classItem.id}>
                    <td className="table-cell font-medium">{classItem.subject}</td>
                    <td className="table-cell">{new Date(classItem.date).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {classItem.qr_code}
                      </code>
                    </td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {classItem.attendance_count || 0} students
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        new Date(classItem.qr_expiry_time) > new Date()
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {new Date(classItem.qr_expiry_time) > new Date() ? 'Active' : 'Expired'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => viewAttendance(classItem.id)}
                        className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Yet</h3>
          <p className="text-gray-600 mb-4">You haven't created any classes yet.</p>
          <a
            href="/teacher/generate-qr"
            className="btn-primary"
          >
            Generate Your First QR Code
          </a>
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
              <p className="font-medium text-primary-900">Generate New QR Code</p>
              <p className="text-sm text-primary-600">Create a QR code for a new class</p>
            </div>
          </a>
          
          <a
            href="/teacher/dashboard"
            className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span className="text-2xl mr-3">📊</span>
            <div>
              <p className="font-medium text-blue-900">View Dashboard</p>
              <p className="text-sm text-blue-600">See real-time attendance overview</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TeacherClassesPage;
