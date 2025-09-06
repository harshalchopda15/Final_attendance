import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import { teacherAPI } from '../services/api';

const QRGenerator = () => {
  const [formData, setFormData] = useState({
    subject: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim()) {
      setError('Please enter a subject');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await teacherAPI.generateQR(formData);
      setQrData(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (qrData?.qrString) {
      navigator.clipboard.writeText(qrData.qrString);
      // You could add a toast notification here
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📱 Generate QR Code</h2>
          <p className="text-gray-600">Create a QR code for your class session</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter subject name (e.g., Mathematics, Computer Science)"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="input-field"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !formData.subject.trim()}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating QR Code...' : 'Generate QR Code'}
          </button>
        </form>

        {qrData && (
          <div className="border-t pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                QR Code Generated Successfully!
              </h3>
              
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                <QRCode 
                  value={qrData.qrString} 
                  size={200}
                  level="M"
                />
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <strong>Subject:</strong> {qrData.subject}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Date:</strong> {new Date(qrData.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Expires:</strong> {new Date(qrData.expiryTime).toLocaleString()}
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  ⏰ This QR code will expire in 30 seconds. Students must scan it before then.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">QR Code String:</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={qrData.qrString}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="btn-secondary text-sm"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Instructions:</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• QR codes are valid for 30 seconds only</li>
            <li>• Students can scan the QR code or enter the string manually</li>
            <li>• Each student can only mark attendance once per class</li>
            <li>• You can view attendance records in the "My Classes" section</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
