"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { useCache } from '@/hooks/useCache';

interface SubscriptionContextType {
  hasClassicPlan: boolean;
  isLoading: boolean;
  checkPlanStatus: (forceRefresh?: boolean) => Promise<boolean>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { isLoaded, has } = useAuth();
  const { user } = useUser();

  // Fonction pour vérifier le plan
  const fetchPlanStatus = async (): Promise<boolean> => {
    if (!isLoaded || !has) return false;
    return await has({ plan: 'classic' });
  };

  // Utiliser le cache pour le statut de l'abonnement
  const {
    data: hasClassicPlan,
    isLoading,
    revalidate
  } = useCache<boolean>(
    'subscription_status',
    fetchPlanStatus,
    {
      userId: user?.id,
      duration: 5 * 60 * 1000, // 5 minutes
      initialData: false,
      enabled: isLoaded && !!user // Seulement si l'auth est chargée et l'utilisateur connecté
    }
  );

  const checkPlanStatus = async (forceRefresh = false): Promise<boolean> => {
    if (forceRefresh) {
      await revalidate();
    }
    return hasClassicPlan || false;
  };

  return (
    <SubscriptionContext.Provider value={{ 
      hasClassicPlan: hasClassicPlan || false, 
      isLoading, 
      checkPlanStatus 
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
