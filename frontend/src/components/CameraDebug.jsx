import React, { useState, useEffect } from 'react';

const CameraDebug = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    checkCameraSupport();
    getCameraDevices();
  }, []);

  const checkCameraSupport = () => {
    const info = {
      hasMediaDevices: !!navigator.mediaDevices,
      hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      isSecureContext: window.isSecureContext,
      protocol: window.location.protocol,
      userAgent: navigator.userAgent,
      platform: navigator.platform
    };
    setDebugInfo(info);
  };

  const getCameraDevices = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const cameras = deviceList.filter(device => device.kind === 'videoinput');
        setDevices(cameras);
      }
    } catch (error) {
      console.error('Error getting devices:', error);
    }
  };

  const testCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      console.log('Camera test successful:', stream);
      alert('Camera test successful! Check console for details.');
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Camera test failed:', error);
      alert(`Camera test failed: ${error.message}`);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">🔧 Camera Debug Info</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Browser Support:</h3>
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <p><strong>MediaDevices API:</strong> {debugInfo.hasMediaDevices ? '✅ Supported' : '❌ Not supported'}</p>
            <p><strong>getUserMedia:</strong> {debugInfo.hasGetUserMedia ? '✅ Supported' : '❌ Not supported'}</p>
            <p><strong>Secure Context:</strong> {debugInfo.isSecureContext ? '✅ Yes' : '❌ No (HTTPS required)'}</p>
            <p><strong>Protocol:</strong> {debugInfo.protocol}</p>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-2">Device Info:</h3>
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <p><strong>Platform:</strong> {debugInfo.platform}</p>
            <p><strong>User Agent:</strong> {debugInfo.userAgent}</p>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-2">Available Cameras:</h3>
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            {devices.length > 0 ? (
              <ul>
                {devices.map((device, index) => (
                  <li key={device.deviceId}>
                    <strong>Camera {index + 1}:</strong> {device.label || 'Unknown camera'}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No cameras detected</p>
            )}
          </div>
        </div>

        <button
          onClick={testCamera}
          className="btn-primary"
        >
          Test Camera Access
        </button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Common Issues:</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• <strong>Not HTTPS:</strong> Camera requires secure connection</li>
            <li>• <strong>Permission denied:</strong> Allow camera access when prompted</li>
            <li>• <strong>Camera in use:</strong> Close other apps using camera</li>
            <li>• <strong>No camera:</strong> Device doesn't have a camera</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CameraDebug;
