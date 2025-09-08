import React, { useState, useEffect } from 'react';
import { teacherAPI } from '../services/api';

const AttendanceDetailsModal = ({ isOpen, onClose, classId, classInfo }) => {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);

  useEffect(() => {
    if (isOpen && classId) {
      fetchAttendanceDetails();
    }
  }, [isOpen, classId]);

  const fetchAttendanceDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await teacherAPI.getClassAttendance(classId);
      setAttendance(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance details:', error);
      setError('Failed to load attendance details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudentEmail.trim()) return;

    setAddingStudent(true);
    try {
      const response = await teacherAPI.addStudentAttendance(classId, newStudentEmail.trim());
      
      // Show success message
      alert(`Student ${response.data.data.student.name} has been marked present successfully!`);
      
      setNewStudentEmail('');
      setShowAddStudent(false);
      // Refresh the attendance list
      fetchAttendanceDetails();
    } catch (error) {
      console.error('Error adding student:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add student';
      alert(errorMessage);
    } finally {
      setAddingStudent(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const isQRExpired = () => {
    if (!classInfo?.qr_expiry_time) return false;
    return new Date(classInfo.qr_expiry_time) < new Date();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Attendance Details - {classInfo?.subject}
              </h2>
              <p className="text-sm text-gray-600">
                {classInfo?.date && new Date(classInfo.date).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 text-xl mb-2">⚠️</div>
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchAttendanceDetails}
                className="mt-4 btn-primary"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Class Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">QR Code</p>
                    <code className="text-xs bg-white px-2 py-1 rounded border">
                      {classInfo?.qr_code}
                    </code>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isQRExpired()
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {isQRExpired() ? 'Expired' : 'Active'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Present</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {attendance?.totalPresent || 0} students
                    </p>
                  </div>
                </div>
              </div>

              {/* Present Students List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Present Students ({attendance?.attendance?.length || 0})
                  </h3>
                  {isQRExpired() && (
                    <button
                      onClick={() => setShowAddStudent(!showAddStudent)}
                      className="btn-secondary text-sm"
                    >
                      + Add Student Manually
                    </button>
                  )}
                </div>

                {/* Add Student Form */}
                {showAddStudent && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Add Student Manually</h4>
                    <form onSubmit={handleAddStudent} className="flex gap-2">
                      <input
                        type="email"
                        value={newStudentEmail}
                        onChange={(e) => setNewStudentEmail(e.target.value)}
                        placeholder="Enter student email"
                        className="flex-1 input-field"
                        required
                      />
                      <button
                        type="submit"
                        disabled={addingStudent}
                        className="btn-primary disabled:opacity-50"
                      >
                        {addingStudent ? 'Adding...' : 'Add'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddStudent(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </form>
                  </div>
                )}

                {/* Students List */}
                {attendance?.attendance && attendance.attendance.length > 0 ? (
                  <div className="space-y-2">
                    {attendance.attendance.map((student) => (
                      <div
                        key={student.student_id}
                        className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {student.student_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-green-900">
                              {student.student_name}
                            </p>
                            <p className="text-sm text-green-600">
                              {student.student_email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-green-600">
                            Marked at
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTime(student.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <div className="text-4xl mb-2">👥</div>
                    <p className="text-gray-600">No students have marked attendance yet</p>
                    {isQRExpired() && (
                      <p className="text-sm text-gray-500 mt-1">
                        QR code has expired. You can add students manually above.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions for Expired QR */}
              {isQRExpired() && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-yellow-500 text-xl mr-3">⚠️</span>
                    <div>
                      <h4 className="font-medium text-yellow-800">QR Code Expired</h4>
                      <p className="text-sm text-yellow-600 mt-1">
                        Students can no longer scan this QR code, but you can still review and manually add attendance records.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Close
            </button>
            <button
              onClick={fetchAttendanceDetails}
              className="btn-primary"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDetailsModal;
