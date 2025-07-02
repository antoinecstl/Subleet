"use client";

import { useState, useEffect } from 'react';

export default function CacheDebugger() {
  const [cacheEntries, setCacheEntries] = useState<{key: string, data: any}[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const refreshCacheEntries = () => {
    const entries: {key: string, data: any}[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('cache_')) {
        try {
          const value = localStorage.getItem(key);
          const parsed = value ? JSON.parse(value) : null;
          entries.push({ key: key.replace('cache_', ''), data: parsed });
        } catch (e) {
          entries.push({ key: key.replace('cache_', ''), data: 'Error parsing' });
        }
      }
    }
    setCacheEntries(entries);
  };

  useEffect(() => {
    refreshCacheEntries();
    const interval = setInterval(refreshCacheEntries, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded z-50"
        style={{ fontSize: '12px' }}
      >
        🔍 Cache
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-auto z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-sm">Cache Debug</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-red-500 font-bold"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={refreshCacheEntries}
          className="bg-green-500 text-white px-2 py-1 rounded text-xs"
        >
          Refresh
        </button>
        
        <button
          onClick={() => {
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('cache_')) {
                localStorage.removeItem(key);
              }
            });
            refreshCacheEntries();
          }}
          className="bg-red-500 text-white px-2 py-1 rounded text-xs ml-2"
        >
          Clear All
        </button>
      </div>
      
      <div className="mt-2 space-y-1">
        {cacheEntries.length === 0 ? (
          <p className="text-gray-500 text-xs">No cache entries</p>
        ) : (
          cacheEntries.map((entry, index) => (
            <div key={index} className="border-b pb-1">
              <div className="font-medium text-xs text-blue-600">{entry.key}</div>
              <div className="text-xs text-gray-600 truncate">
                {typeof entry.data === 'object' 
                  ? JSON.stringify(entry.data).substring(0, 100) + '...'
                  : String(entry.data).substring(0, 100)
                }
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
