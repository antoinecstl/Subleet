"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@clerk/nextjs';

interface SubscriptionContextType {
  hasClassicPlan: boolean;
  isLoading: boolean;
  checkPlanStatus: (forceRefresh?: boolean) => Promise<boolean>;
}

const SUBSCRIPTION_CACHE_KEY = 'subscription_cache';
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface CachedPlanData {
  hasClassicPlan: boolean;
  timestamp: number;
}

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { isLoaded, has } = useAuth();
  const [hasClassicPlan, setHasClassicPlan] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getCachedPlanData = (): CachedPlanData | null => {
    if (typeof window === 'undefined') return null;
    
    const cachedData = localStorage.getItem(SUBSCRIPTION_CACHE_KEY);
    if (!cachedData) return null;
    
    try {
      const parsedData = JSON.parse(cachedData) as CachedPlanData;
      const isExpired = Date.now() - parsedData.timestamp > CACHE_EXPIRY_TIME;
      
      return isExpired ? null : parsedData;
    } catch (error) {
      console.error('Error parsing cached subscription data:', error);
      return null;
    }
  };

  const setCachedPlanData = (data: boolean) => {
    if (typeof window === 'undefined') return;
    
    const cacheData: CachedPlanData = {
      hasClassicPlan: data,
      timestamp: Date.now()
    };
    
    localStorage.setItem(SUBSCRIPTION_CACHE_KEY, JSON.stringify(cacheData));
  };

  const checkPlanStatus = async (forceRefresh = false): Promise<boolean> => {
    if (!isLoaded) return hasClassicPlan;
    
    try {
      setIsLoading(true);
      
      // Check cache first unless forced refresh
      if (!forceRefresh) {
        const cachedData = getCachedPlanData();
        if (cachedData) {
          setHasClassicPlan(cachedData.hasClassicPlan);
          setIsLoading(false);
          return cachedData.hasClassicPlan;
        }
      }
      
      // If no cache or forced refresh, get from API
      const userHasClassicPlan = await has({ plan: 'classic' });
      setHasClassicPlan(userHasClassicPlan);
      setCachedPlanData(userHasClassicPlan);
      return userHasClassicPlan;
    } catch (error) {
      console.error('Error checking plan status:', error);
      return hasClassicPlan;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkPlanStatus();
  }, [isLoaded]);

  return (
    <SubscriptionContext.Provider value={{ hasClassicPlan, isLoading, checkPlanStatus }}>
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
