import React, { useEffect, useState } from 'react';
import { teacherAPI } from '../services/api';

const TeacherAttendancePage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await teacherAPI.getClasses();
        const fetched = res.data.data.classes || [];
        setClasses(fetched);
        if (fetched.length > 0) {
          setSelectedClassId(String(fetched[0].id));
        }
      } catch (err) {
        setError('Failed to load classes');
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!selectedClassId) return;
      setAttendanceData(null);
      try {
        const res = await teacherAPI.getClassAttendance(selectedClassId);
        setAttendanceData(res.data.data);
      } catch (err) {
        setError('Failed to load attendance');
      }
    };
    fetchAttendance();
  }, [selectedClassId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-600">Select a class to view detailed attendance.</p>
      </div>

      <div className="card p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
          <select
            className="input-field"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.subject} • {new Date(c.date).toLocaleDateString()} ({c.attendance_count || 0} present)
              </option>
            ))}
          </select>
        </div>

        {attendanceData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{attendanceData.class.subject}</h2>
                <p className="text-sm text-gray-600">
                  {new Date(attendanceData.class.date).toLocaleDateString()} • Teacher: {attendanceData.class.teacher_name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Present</p>
                <p className="text-2xl font-bold text-gray-900">{attendanceData.totalPresent}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Student</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceData.attendance.map((a) => (
                    <tr key={a.id}>
                      <td className="table-cell font-medium">{a.student_name}</td>
                      <td className="table-cell">{a.student_email}</td>
                      <td className="table-cell">{new Date(a.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                  {attendanceData.attendance.length === 0 && (
                    <tr>
                      <td className="table-cell" colSpan="3">No attendance records for this class.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendancePage;


