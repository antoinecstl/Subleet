import { useState, useEffect } from 'react';

interface ApiKeyState {
  apiKey: string | null;
  isDisplayed: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useApiKey(projectId: string) {
  const [state, setState] = useState<ApiKeyState>({
    apiKey: null,
    isDisplayed: false,
    isLoading: false,
    error: null,
  });

  const checkApiKeyStatus = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/public/projects/api-key/${projectId}`);
      const data = await response.json();

      if (data.alreadyDisplayed) {
        setState(prev => ({ ...prev, isDisplayed: true, isLoading: false }));
      } else if (!data.success) {
        setState(prev => ({ ...prev, error: data.message, isLoading: false }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch {
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to check API key status', 
        isLoading: false 
      }));
    }
  };

  const revealApiKey = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`/api/public/projects/api-key/${projectId}`);
      const data = await response.json();

      if (data.success) {
        setState(prev => ({ 
          ...prev, 
          apiKey: data.api_key, 
          isDisplayed: true, 
          isLoading: false 
        }));

        // Mark as displayed
        await fetch('/api/public/projects/api-key/mark-displayed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ projectId }),
        });

        return data.api_key;
      } else {
        setState(prev => ({ 
          ...prev, 
          error: data.message || 'Failed to retrieve API key', 
          isLoading: false 
        }));
        return null;
      }
    } catch {
      setState(prev => ({ 
        ...prev, 
        error: 'An error occurred while fetching the API key', 
        isLoading: false 
      }));
      return null;
    }
  };

  useEffect(() => {
    if (projectId) {
      checkApiKeyStatus();
    }
  }, [projectId, checkApiKeyStatus]);

  return {
    ...state,
    revealApiKey,
    checkApiKeyStatus,
  };
}
