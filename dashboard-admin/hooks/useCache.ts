"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { getCache, setCache, invalidateCache, onCacheUpdate, CacheOptions } from '@/lib/cache-utils';

interface UseCacheOptions<T> extends CacheOptions {
  initialData?: T;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  enabled?: boolean;
}

interface UseCacheReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  mutate: (data?: T) => void;
  revalidate: () => Promise<void>;
  invalidate: () => void;
}

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions<T> = {}
): UseCacheReturn<T> {
  const {
    initialData = null,
    revalidateOnFocus = false,
    revalidateOnReconnect = true,
    enabled = true,
    ...cacheOptions
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Refs pour éviter les boucles infinies
  const fetcherRef = useRef(fetcher);
  const optionsRef = useRef(cacheOptions);
  const hasFetchedRef = useRef(false);
  
  // Mettre à jour les refs
  fetcherRef.current = fetcher;
  optionsRef.current = cacheOptions;

  // Fonction pour récupérer les données
  const fetchData = useCallback(async (bypassCache = false): Promise<T | null> => {
    if (!enabled) return null;
    
    try {
      setIsLoading(true);
      setError(null);

      // Essayer le cache d'abord
      if (!bypassCache) {
        const cachedData = getCache<T>(key);
        if (cachedData !== null) {
          setData(cachedData);
          setIsLoading(false);
          return cachedData;
        }
      }

      // Fetch depuis l'API
      const freshData = await fetcherRef.current();
      setData(freshData);
      
      // Mettre en cache
      setCache(key, freshData, optionsRef.current);
      
      return freshData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error(`Error fetching data for key "${key}":`, error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [key, enabled]);

  // Fonction pour forcer une revalidation
  const revalidate = useCallback(async (): Promise<void> => {
    await fetchData(true);
  }, [fetchData]);

  // Fonction pour muter manuellement les données
  const mutate = useCallback((newData?: T) => {
    if (newData !== undefined) {
      setData(newData);
      setCache(key, newData, optionsRef.current);
    } else {
      // Si pas de données fournies, refetch
      fetchData(true);
    }
  }, [key, fetchData]);

  // Fonction pour invalider le cache
  const invalidate = useCallback(() => {
    invalidateCache(key);
    setData(null);
  }, [key]);

  // Effet initial pour charger les données (une seule fois)
  useEffect(() => {
    if (enabled && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchData();
    }
  }, [enabled]); // Dépendances minimales

  // Écouter les changements de cache (synchronisation entre onglets)
  useEffect(() => {
    const unsubscribe = onCacheUpdate<T>(key, (updatedData) => {
      if (updatedData === null) {
        setData(null);
      } else {
        setData(updatedData);
      }
    });

    return unsubscribe;
  }, [key]);

  // Revalidation lors du focus (optionnel)
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const handleFocus = () => {
      if (enabled) revalidate();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [revalidate, revalidateOnFocus, enabled]);

  // Revalidation lors de la reconnexion (optionnel)
  useEffect(() => {
    if (!revalidateOnReconnect) return;

    const handleOnline = () => {
      if (enabled) revalidate();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [revalidate, revalidateOnReconnect, enabled]);

  return {
    data,
    isLoading,
    error,
    mutate,
    revalidate,
    invalidate
  };
}

// Hook spécialisé pour les listes avec invalidation optimiste
export function useCacheList<T extends { id?: number | string }>(
  key: string,
  fetcher: () => Promise<T[]>,
  options: UseCacheOptions<T[]> = {}
): UseCacheReturn<T[]> & {
  addItem: (item: T) => void;
  updateItem: (id: number | string, updates: Partial<T>) => void;
  removeItem: (id: number | string) => void;
} {
  const cacheResult = useCache(key, fetcher, options);

  const addItem = useCallback((item: T) => {
    const currentData = cacheResult.data || [];
    const newData = [...currentData, item];
    cacheResult.mutate(newData);
  }, [cacheResult]);

  const updateItem = useCallback((id: number | string, updates: Partial<T>) => {
    const currentData = cacheResult.data || [];
    const newData = currentData.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    cacheResult.mutate(newData);
  }, [cacheResult]);

  const removeItem = useCallback((id: number | string) => {
    const currentData = cacheResult.data || [];
    const newData = currentData.filter(item => item.id !== id);
    cacheResult.mutate(newData);
  }, [cacheResult]);

  return {
    ...cacheResult,
    addItem,
    updateItem,
    removeItem
  };
}
