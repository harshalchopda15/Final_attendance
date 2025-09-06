import React, { useState, useRef, useEffect } from 'react';
import { studentAPI } from '../services/api';

const QRCodeScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [qrString, setQrString] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Check for camera permission and initialize scanner
  useEffect(() => {
    checkCameraPermission();
    return () => {
      stopScanning();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera if available
      });
      setHasPermission(true);
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
    } catch (error) {
      setHasPermission(false);
      console.error('Camera permission denied:', error);
    }
  };

  const startScanning = async () => {
    try {
      setMessage('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setMessage('Unable to access camera. Please check permissions.');
      setMessageType('error');
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleQRCodeDetected = async (qrCode) => {
    if (qrCode && qrCode.trim()) {
      stopScanning();
      await markAttendance(qrCode.trim());
    }
  };

  const markAttendance = async (qrString) => {
    setMessage('Processing...');
    setMessageType('info');

    try {
      const response = await studentAPI.markAttendance({ qrString });
      
      setMessage('Attendance marked successfully!');
      setMessageType('success');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);
      
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to mark attendance');
      setMessageType('error');
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    if (!qrString.trim()) {
      setMessage('Please enter a QR code string');
      setMessageType('error');
      return;
    }

    await markAttendance(qrString.trim());
    setQrString('');
  };

  // Simple QR code detection using canvas (basic implementation)
  const detectQRCode = () => {
    if (!videoRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // This is a simplified QR detection - in a real app you'd use a proper QR library
    // For now, we'll just show the manual input option
  };

  // Check for QR codes periodically when scanning
  useEffect(() => {
    let interval;
    if (isScanning) {
      interval = setInterval(detectQRCode, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning]);

  if (hasPermission === false) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">📱 QR Code Scanner</h2>
            <p className="text-gray-600">Camera access is required to scan QR codes</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <span className="text-red-500 text-xl mr-3">⚠️</span>
              <div>
                <h3 className="text-sm font-medium text-red-800">Camera Permission Required</h3>
                <p className="text-sm text-red-600 mt-1">
                  Please allow camera access to use the QR scanner, or use manual input below.
                </p>
              </div>
            </div>
          </div>

          <ManualInputForm 
            qrString={qrString}
            setQrString={setQrString}
            handleSubmit={handleManualSubmit}
            message={message}
            messageType={messageType}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📱 QR Code Scanner</h2>
          <p className="text-gray-600">Scan QR code or enter manually</p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700'
              : messageType === 'error'
              ? 'bg-red-100 border border-red-400 text-red-700'
              : 'bg-blue-100 border border-blue-400 text-blue-700'
          }`}>
            {message}
          </div>
        )}

        {/* Camera Scanner */}
        <div className="mb-6">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
            {isScanning ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-gray-600">Camera ready</p>
                </div>
              </div>
            )}
            
            {/* Scanning overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-primary-500 rounded-lg relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary-500"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary-500"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary-500"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary-500"></div>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            {!isScanning ? (
              <button
                onClick={startScanning}
                className="flex-1 btn-primary"
              >
                📷 Start Scanning
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex-1 btn-secondary"
              >
                ⏹️ Stop Scanning
              </button>
            )}
          </div>
        </div>

        {/* Manual Input */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Or Enter Manually</h3>
          <ManualInputForm 
            qrString={qrString}
            setQrString={setQrString}
            handleSubmit={handleManualSubmit}
            message={message}
            messageType={messageType}
          />
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">How to use:</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Click "Start Scanning" and point camera at QR code</li>
            <li>• Or ask your teacher for the QR code string</li>
            <li>• Enter the string manually in the field above</li>
            <li>• QR codes expire after 30 seconds</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Manual Input Form Component
const ManualInputForm = ({ qrString, setQrString, handleSubmit, message, messageType }) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="qrString" className="block text-sm font-medium text-gray-700 mb-2">
          QR Code String
        </label>
        <input
          type="text"
          id="qrString"
          value={qrString}
          onChange={(e) => setQrString(e.target.value)}
          className="input-field"
          placeholder="Enter QR code string here..."
        />
      </div>

      <button
        type="submit"
        disabled={!qrString.trim()}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Mark Attendance
      </button>
    </form>
  );
};

export default QRCodeScanner;
