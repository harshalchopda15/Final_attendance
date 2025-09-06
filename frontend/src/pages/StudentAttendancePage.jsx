import React, { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';

const StudentAttendancePage = () => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await studentAPI.getAttendance();
      setAttendance(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-600">View your attendance records and statistics.</p>
      </div>

      {/* Statistics */}
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
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.subjectStatistics.map((subject, index) => (
                  <tr key={index}>
                    <td className="table-cell font-medium">{subject.subject}</td>
                    <td className="table-cell">{subject.total_classes}</td>
                    <td className="table-cell">{subject.attended_classes}</td>
                    <td className="table-cell">{subject.attendance_percentage}%</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subject.attendance_percentage >= 80 
                          ? 'bg-green-100 text-green-800'
                          : subject.attendance_percentage >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {subject.attendance_percentage >= 80 
                          ? 'Excellent'
                          : subject.attendance_percentage >= 60
                          ? 'Good'
                          : 'Needs Improvement'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Attendance Records */}
      {attendance?.attendance && attendance.attendance.length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">All Attendance Records</h2>
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
                {attendance.attendance.map((record) => (
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

      {(!attendance?.attendance || attendance.attendance.length === 0) && (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendance Records</h3>
          <p className="text-gray-600">You haven't marked attendance for any classes yet.</p>
        </div>
      )}
    </div>
  );
};

export default StudentAttendancePage;
