'use client';

import { useState, useEffect } from 'react';

interface ExistingApiKeyDisplayProps {
  projectId: string;
}

export default function ExistingApiKeyDisplay({ projectId }: ExistingApiKeyDisplayProps) {
  const [apiKeyStatus, setApiKeyStatus] = useState<'checking' | 'already-displayed' | 'available' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkApiKeyStatus();
  }, [projectId]);

  const checkApiKeyStatus = async () => {
    try {
      const response = await fetch(`/api/public/projects/api-key/${projectId}`);
      const data = await response.json();

      if (data.alreadyDisplayed) {
        setApiKeyStatus('already-displayed');
      } else if (data.success === false && data.message) {
        setError(data.message);
        setApiKeyStatus('error');
      } else {
        setApiKeyStatus('available');
      }
    } catch (error) {
      console.error('Error checking API key status:', error);
      setError('Failed to check API key status');
      setApiKeyStatus('error');
    }
  };

  const generateNewApiKey = () => {
    // Cette fonction pourrait être implémentée pour régénérer une clé API
    // Elle nécessiterait une nouvelle route API et une logique de révocation
    alert('Feature not implemented: Contact support to regenerate your API key');
  };

  if (apiKeyStatus === 'checking') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Checking API key status...</span>
        </div>
      </div>
    );
  }

  if (apiKeyStatus === 'already-displayed') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 text-yellow-600">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159-.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1.002.43-1.563A6 6 0 1 1 21.75 8.25Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-yellow-800">API Key</h3>
            </div>
            <p className="text-yellow-700 mb-4">
              Your API key for this project has already been displayed and cannot be viewed again for security reasons.
            </p>
            <div className="bg-yellow-100 border border-yellow-300 rounded-md p-3 mb-4">
              <p className="text-sm text-yellow-800">
                If you have lost access to your API key, you can request a new one through the support team.
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateNewApiKey}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Request New API Key
          </button>
          <button
            onClick={() => window.open('mailto:support@example.com?subject=API Key Support Request', '_blank')}
            className="border border-yellow-600 text-yellow-600 hover:bg-yellow-50 font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            Contact Support
          </button>
        </div>
      </div>
    );
  }

  if (apiKeyStatus === 'available') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 text-blue-600">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159-.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1.002.43-1.563A6 6 0 1 1 21.75 8.25Z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-blue-800">API Key Available</h3>
        </div>
        <p className="text-blue-700 mb-4">
          Your API key for this project is available for viewing. This can only be done once for security reasons.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <p className="text-sm text-amber-800">
            <strong>Important:</strong> Once you view your API key, it cannot be displayed again. Make sure you are ready to copy and store it securely.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()} // Simple refresh to show the full ApiKeyDisplay component
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          View API Key
        </button>
      </div>
    );
  }

  if (apiKeyStatus === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 text-red-600">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9 12l-9-9m0 0l-9-9m9 9l-9 9m9-9l9-9" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-800">Error</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={checkApiKeyStatus}
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return null;
}
