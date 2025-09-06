import React, { useState } from 'react';
import { studentAPI } from '../services/api';

const QuickQRScanner = () => {
  const [qrString, setQrString] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!qrString.trim()) {
      setMessage('Please enter a QR code string');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await studentAPI.markAttendance({ qrString: qrString.trim() });
      
      setMessage('Attendance marked successfully!');
      setMessageType('success');
      setQrString('');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);
      
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to mark attendance');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">📱 Quick Attendance</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="quickQrString" className="block text-sm font-medium text-gray-700 mb-2">
            QR Code String
          </label>
          <input
            type="text"
            id="quickQrString"
            value={qrString}
            onChange={(e) => setQrString(e.target.value)}
            className="input-field"
            placeholder="Enter QR code string here..."
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !qrString.trim()}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Marking Attendance...' : 'Mark Attendance'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <a
          href="/student/scan"
          className="text-primary-600 hover:text-primary-500 text-sm font-medium"
        >
          📷 Use Camera Scanner →
        </a>
      </div>
    </div>
  );
};

export default QuickQRScanner;
