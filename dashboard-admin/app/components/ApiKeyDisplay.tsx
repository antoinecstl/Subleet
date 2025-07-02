'use client';

import { useState, useEffect } from 'react';

interface ApiKeyDisplayProps {
  projectId: string;
  onApiKeyViewed?: () => void;
}

export default function ApiKeyDisplay({ projectId, onApiKeyViewed }: ApiKeyDisplayProps) {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alreadyDisplayed, setAlreadyDisplayed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset states when projectId changes
    setApiKey(null);
    setIsRevealed(false);
    setAlreadyDisplayed(false);
    setError(null);
  }, [projectId]);

  const fetchApiKey = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/public/projects/api-key/${projectId}`);
      const data = await response.json();

      if (data.success) {
        setApiKey(data.api_key);
        setIsRevealed(true);
        
        // Mark the API key as displayed
        await markAsDisplayed();
        
        if (onApiKeyViewed) {
          onApiKeyViewed();
        }
      } else if (data.alreadyDisplayed) {
        setAlreadyDisplayed(true);
      } else {
        setError(data.message || 'Failed to retrieve API key');
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
      setError('An error occurred while fetching the API key');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsDisplayed = async () => {
    try {
      await fetch('/api/public/projects/api-key/mark-displayed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });
    } catch (error) {
      console.error('Error marking API key as displayed:', error);
    }
  };

  const copyToClipboard = async () => {
    if (apiKey) {
      try {
        await navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  if (alreadyDisplayed) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 text-yellow-600">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-yellow-800">API Key Already Viewed</h3>
        </div>
        <p className="text-yellow-700 mb-4">
          This API key has already been displayed and cannot be viewed again for security reasons.
        </p>
        <div className="bg-yellow-100 border border-yellow-300 rounded-md p-3">
          <p className="text-sm text-yellow-800">
            If you need to access your API key again, please contact support or regenerate a new one.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
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
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-6 text-blue-600">
          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-blue-800">Project API Key</h3>
      </div>
      <p className="text-blue-700 mb-6">
        Your API key for this project. This will only be displayed once for security reasons.
      </p>

      {!isRevealed ? (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-amber-600 mt-0.5">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-amber-800">Important:</p>
                <p className="text-amber-700 text-sm">
                  This API key will only be shown once. Make sure to copy and store it securely before proceeding.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchApiKey}
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <div className="w-4 h-4">
                  <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </div>
                Reveal API Key
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-green-600 mt-0.5">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-green-800">API key revealed successfully</p>
                <p className="text-green-700 text-sm">
                  Make sure to copy it now - you won&apos;t be able to see it again.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">API Key:</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-gray-100 border border-gray-300 rounded-md font-mono text-sm break-all">
                {apiKey}
              </div>
              <button
                onClick={copyToClipboard}
                className="flex-shrink-0 p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                title={copied ? 'Copied!' : 'Copy to clipboard'}
              >
                {copied ? (
                  <div className="w-4 h-4 text-green-600">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-4 h-4 text-gray-600">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-red-600 mt-0.5">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-red-800">Security Notice:</p>
                <p className="text-red-700 text-sm">
                  Store this API key securely. It will not be displayed again and provides access to your project.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
