'use client';

import { useState } from 'react';
import { authAPI } from '@/lib/api';

export default function DebugPage() {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const testLogin = async () => {
    setResult(null);
    setError(null);

    try {
      console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
      console.log('Attempting login...');

      const response = await authAPI.login({
        email: 'admin@mipage.cl',
        password: 'password123'
      });

      console.log('Response:', response);
      setResult(response.data);
    } catch (err: any) {
      console.error('Error:', err);
      setError({
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Debug Login</h1>

        <div className="bg-dark-850 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Environment</h2>
          <pre className="text-green-400 text-sm">
            NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}
          </pre>
        </div>

        <button
          onClick={testLogin}
          className="bg-fire-500 text-white px-6 py-3 rounded-lg font-bold mb-6"
        >
          Test Login
        </button>

        {result && (
          <div className="bg-green-900/20 border border-green-500 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-bold text-green-400 mb-4">✅ Success</h2>
            <pre className="text-green-300 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-red-400 mb-4">❌ Error</h2>
            <pre className="text-red-300 text-sm overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
