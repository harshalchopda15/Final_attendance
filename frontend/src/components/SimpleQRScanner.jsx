import React, { useState, useRef, useEffect } from 'react';
import { studentAPI } from '../services/api';

const SimpleQRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [qrString, setQrString] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    checkCameraSupport();
    return () => {
      stopScanning();
    };
  }, []);

  const checkCameraSupport = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false);
      setCameraError('Camera not supported on this device');
      return;
    }
    setHasPermission(null); // Unknown state
  };

  const startScanning = async () => {
    try {
      setMessage('');
      setCameraError('');
      
      console.log('Requesting camera access...');
      
      // Try different camera configurations
      const constraints = [
        { video: { facingMode: 'environment' } }, // Back camera
        { video: { facingMode: 'user' } },        // Front camera
        { video: true }                           // Any camera
      ];

      let stream = null;
      let lastError = null;

      for (const constraint of constraints) {
        try {
          console.log('Trying constraint:', constraint);
          stream = await navigator.mediaDevices.getUserMedia(constraint);
          console.log('Camera access granted!');
          break;
        } catch (error) {
          console.log('Constraint failed:', error);
          lastError = error;
          continue;
        }
      }

      if (!stream) {
        throw lastError || new Error('No camera available');
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        setHasPermission(true);
        
        // Wait for video to load
        videoRef.current.onloadedmetadata = () => {
          console.log('Video loaded successfully');
        };
      }
      
    } catch (error) {
      console.error('Camera error:', error);
      setHasPermission(false);
      
      if (error.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Please allow camera access and try again.');
      } else if (error.name === 'NotFoundError') {
        setCameraError('No camera found on this device.');
      } else if (error.name === 'NotReadableError') {
        setCameraError('Camera is already in use by another application.');
      } else {
        setCameraError(`Camera error: ${error.message}`);
      }
      
      setMessage('Unable to access camera. Please use manual input below.');
      setMessageType('error');
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      streamRef.current = null;
    }
    setIsScanning(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
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

        {cameraError && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
            <div className="flex items-center">
              <span className="text-yellow-500 text-xl mr-3">⚠️</span>
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Camera Issue</h3>
                <p className="text-sm text-yellow-600 mt-1">{cameraError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Camera Scanner */}
        <div className="mb-6">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '4/3' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ display: isScanning ? 'block' : 'none' }}
            />
            
            {!isScanning && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-gray-600">Camera ready</p>
                  {hasPermission === false && (
                    <p className="text-sm text-red-600 mt-2">Camera not available</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            {!isScanning ? (
              <button
                onClick={startScanning}
                className="flex-1 btn-primary"
                disabled={hasPermission === false}
              >
                📷 Start Camera
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="flex-1 btn-secondary"
              >
                ⏹️ Stop Camera
              </button>
            )}
          </div>

          {isScanning && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                📱 Camera is active! Point it at a QR code. For now, you'll need to manually enter the QR code string below.
              </p>
            </div>
          )}
        </div>

        {/* Manual Input */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter QR Code Manually</h3>
          <form onSubmit={handleManualSubmit} className="space-y-4">
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
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 mb-2">How to use:</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Click "Start Camera" to activate your device camera</li>
            <li>• Ask your teacher for the QR code string</li>
            <li>• Enter the string in the field above and click "Mark Attendance"</li>
            <li>• QR codes expire after 30 seconds</li>
            <li>• Make sure to allow camera permissions when prompted</li>
          </ul>
        </div>

        {/* Troubleshooting */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-800 mb-2">Camera not working?</h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Make sure you're using HTTPS (required for camera access)</li>
            <li>• Check if camera is being used by another app</li>
            <li>• Try refreshing the page and allowing permissions again</li>
            <li>• Use manual input as an alternative</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimpleQRScanner;
