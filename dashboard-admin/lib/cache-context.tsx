"use client";

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { clearUserCache, setCurrentUser, cleanExpiredCache } from '@/lib/cache-utils';
import { useUser } from '@clerk/nextjs';

interface CacheContextType {
  clearCache: () => void;
  refreshCache: (keys?: string[]) => void;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

export function CacheProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();

  // Gérer les changements d'utilisateur
  useEffect(() => {
    if (isLoaded) {
      if (user) {
        // Utilisateur connecté
        setCurrentUser(user.id);
        // Nettoyer le cache expiré
        cleanExpiredCache();
      } else {
        // Utilisateur déconnecté
        clearUserCache();
      }
    }
  }, [user, isLoaded]);

  // Nettoyer périodiquement le cache expiré
  useEffect(() => {
    const interval = setInterval(() => {
      cleanExpiredCache();
    }, 60000); // Toutes les minutes

    return () => clearInterval(interval);
  }, []);

  // Nettoyer le cache avant fermeture de la page
  useEffect(() => {
    const handleBeforeUnload = () => {
      cleanExpiredCache();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const clearCache = () => {
    clearUserCache();
  };

  const refreshCache = (keys?: string[]) => {
    if (keys) {
      // Invalider seulement les clés spécifiées
      keys.forEach(key => {
        localStorage.removeItem(`cache_${key}`);
      });
    } else {
      // Invalider tout le cache utilisateur
      clearUserCache();
    }
    
    // Recharger la page pour forcer le refetch
    window.location.reload();
  };

  return (
    <CacheContext.Provider value={{ clearCache, refreshCache }}>
      {children}
    </CacheContext.Provider>
  );
}

export function useGlobalCache() {
  const context = useContext(CacheContext);
  if (context === undefined) {
    throw new Error('useGlobalCache must be used within a CacheProvider');
  }
  return context;
}
