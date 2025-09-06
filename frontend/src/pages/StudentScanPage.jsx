import React from 'react';
import SimpleQRScanner from '../components/SimpleQRScanner';
import CameraDebug from '../components/CameraDebug';

const StudentScanPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Scan QR Code</h1>
        <p className="text-gray-600">Mark your attendance by scanning or entering the QR code.</p>
      </div>

      <SimpleQRScanner />
      
      {/* Debug component - remove this after fixing camera issues */}
      <CameraDebug />
    </div>
  );
};

export default StudentScanPage;
