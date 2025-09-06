import React from 'react';
import QRGenerator from '../components/QRGenerator';

const TeacherGenerateQRPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Generate QR Code</h1>
        <p className="text-gray-600">Create a QR code for your class session.</p>
      </div>

      <QRGenerator />
    </div>
  );
};

export default TeacherGenerateQRPage;
