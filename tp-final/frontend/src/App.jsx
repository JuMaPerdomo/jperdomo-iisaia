import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-md p-8 text-center border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Project Tracking Dashboard
        </h1>
        <p className="text-gray-600 mb-6">
          Panel de control ejecutivo y seguimiento de salud de proyectos de software.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
          Frontend initialized successfully
        </div>
      </div>
    </div>
  );
}

