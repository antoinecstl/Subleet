"use client"

import { useState, useEffect, useRef } from 'react';
import { useUser } from "@clerk/nextjs";
import { FaCopy } from 'react-icons/fa';
import { format } from 'date-fns';
import Toast from '../components/Toast';

interface ApiKey {
  id: number;
  name: string;
  email: string;
  key: string | null;
  created_at: string;
  revoked: boolean;
  total_calls: number;
}

export default function Dashboard() {
  const { user } = useUser();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [visibleApiKeys, setVisibleApiKeys] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const lastFetchRef = useRef<number>(0);
  const RATE_LIMIT_DELAY = 10000; 
  
  const loadCachedData = () => {
    const cached = localStorage.getItem('apiKeysCache');
    if (cached) {
      try {
        const parsedData = JSON.parse(cached);
        setApiKeys(parsedData);
        setIsLoading(false);
        return true; // Indique que des données ont été chargées depuis le cache
      } catch (e) {
        console.error('Error parsing cached data');
      }
    }
    return false; // Indique qu'aucune donnée n'a été chargée depuis le cache
  };

  useEffect(() => {
    if (user) {
      const hasCachedData = loadCachedData();
      // Ne faire le fetch initial que si aucune donnée n'est en cache
      if (!hasCachedData) {
        fetchUserData();
      } else {
        // Si on a des données en cache, on attend un peu avant de les rafraîchir
        const timer = setTimeout(() => {
          fetchUserData();
        }, 2000); // Attendre 1 seconde avant de rafraîchir
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  // Modifier la gestion du toast
  useEffect(() => {
    if (toast) {
      setToastVisible(true);
      const timer = setTimeout(() => {
        setToastVisible(false);
        setTimeout(() => setToast(null), 500);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const canFetch = () => {
    const now = Date.now();
    if (now - lastFetchRef.current >= RATE_LIMIT_DELAY) {
      lastFetchRef.current = now;
      return true;
    }
    return false;
  };

  const fetchUserData = async () => {
    if (!canFetch()) {
      setIsRateLimited(true);
      setToast({ 
        message: 'Please wait a few seconds before refreshing again', 
        type: 'error' 
      });
      return;
    }

    try {
      setIsLoading(true);
      setIsRateLimited(false);
      const response = await fetch('/api/fetch-user-dash');
      
      if (response.status === 429) {
        setToast({ 
          message: 'Too many requests. Please wait a moment.', 
          type: 'error' 
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        // Ne pas effacer les données existantes en cas d'erreur
        return;
      }

      // Trier les clés : d'abord les actives (non révoquées), puis par date de création décroissante
      const sortedData = [...data].sort((a, b) => {
        // D'abord trier par statut (actif/révoqué)
        if (a.revoked !== b.revoked) {
          return a.revoked ? 1 : -1;
        }
        // Ensuite trier par date de création (plus récent en premier)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      // Sauvegarder dans le localStorage
      localStorage.setItem('apiKeysCache', JSON.stringify(sortedData));
      setApiKeys(sortedData);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      // Ne pas effacer les données existantes en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (apiKey: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(apiKey).then(() => {
        setToast({ message: 'API Key copied to clipboard', type: 'success' });
      }).catch(() => {
        setToast({ message: 'Failed to copy API Key', type: 'error' });
      });
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = apiKey;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setToast({ message: 'API Key copied to clipboard', type: 'success' });
      } catch (err) {
        setToast({ message: 'Failed to copy API Key', type: 'error' });
      }
      document.body.removeChild(textArea);
    }
  };

  const toggleApiKeyVisibility = (apiKey: string) => {
    setVisibleApiKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(apiKey)) {
        newSet.delete(apiKey);
      } else {
        newSet.add(apiKey);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 pb-20 bg-background text-foreground">
      <main className="flex flex-col items-center mt-16 max-w-6xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Loading your API keys...</p>
          </div>
        ) : (
          apiKeys.length === 0 ? (
            <div className="text-center p-8 bg-table-bg border border-table-border rounded-lg shadow-lg">
              <p className="text-lg text-gray-400">No API keys found for your account.</p>
              <p className="mt-2 text-sm text-gray-500">Please contact the administrator to get access.</p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <h1 className="text-3xl font-bold mb-8">Your API Keys</h1>
              <table className="min-w-full bg-table-bg border border-table-border shadow-lg rounded-lg">
                <thead className="bg-table-bg">
                  <tr>
                    <th className="py-3 px-4 border-b border-table-border text-left">API Key</th>
                    <th className="py-3 px-4 border-b border-table-border text-center">Usage</th>
                    <th className="py-3 px-4 border-b border-table-border text-center">Created At</th>
                    <th className="py-3 px-4 border-b border-table-border text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((key, index) => (
                    <tr key={index}>
                      <td className="py-3 px-4 border-b border-table-border">
                        {key.key ? (
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => key.key && toggleApiKeyVisibility(key.key)}
                              className="hover:text-blue-600 focus:outline-none"
                            >
                              {visibleApiKeys.has(key.key) 
                                ? key.key 
                                : `${key.key.slice(0,5)}*****${key.key.slice(-5)}`}
                            </button>
                            <button 
                              onClick={() => key.key && handleCopy(key.key)}
                              className="text-gray-300 hover:text-white focus:outline-none"
                            >
                              <FaCopy />
                            </button>
                          </div>
                        ) : (
                          'No API Key'
                        )}
                      </td>
                      <td className="py-3 px-4 border-b border-table-border text-center">
                        {key.total_calls}
                      </td>
                      <td className="py-3 px-4 border-b border-table-border text-center">
                        {key.created_at ? format(new Date(key.created_at), 'dd/MM/yyyy HH:mm') : 'N/A'}
                      </td>
                      <td className="py-3 px-4 border-b border-table-border text-center">
                        <span className={`px-2 py-1 rounded ${key.revoked ? 'bg-red-500' : 'bg-green-500'}`}>
                          {key.revoked ? 'Revoked' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            visible={toastVisible}
            onClose={() => {
              setToastVisible(false);
              setTimeout(() => setToast(null), 500);
            }} 
          />
        )}
      </main>
    </div>
  );
}
