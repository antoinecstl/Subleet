const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const USER_SESSION_KEY = 'user_session_id';

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  sessionId: string;
  userId?: string;
  expiryTime?: number;
}

export interface CacheOptions {
  duration?: number;
  userId?: string;
  persistent?: boolean; // Si true, survit à la déconnexion
}

// Gestionnaire d'événements pour synchroniser entre onglets
const cacheEventListeners = new Map<string, ((data: any) => void)[]>();

// Génère un ID de session unique
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('app_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('app_session_id', sessionId);
  }
  return sessionId;
}

// Définit l'utilisateur actuel pour associer le cache
export function setCurrentUser(userId: string): void {
  localStorage.setItem(USER_SESSION_KEY, userId);
}

// Récupère l'utilisateur actuel
export function getCurrentUser(): string | null {
  return localStorage.getItem(USER_SESSION_KEY);
}

// Vérifie si le cache appartient à l'utilisateur actuel
function isValidForCurrentUser(cacheItem: CacheItem<any>): boolean {
  const currentUser = getCurrentUser();
  if (!currentUser) return false;
  
  // Si le cache a un userId, il doit correspondre à l'utilisateur actuel
  if (cacheItem.userId && cacheItem.userId !== currentUser) {
    return false;
  }
  
  return true;
}

export function setCache<T>(
  key: string, 
  data: T, 
  options: CacheOptions = {}
): void {
  try {
    const { 
      duration = DEFAULT_CACHE_DURATION, 
      userId = getCurrentUser(),
      persistent = false 
    } = options;

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      sessionId: getSessionId(),
      userId: userId || undefined,
      expiryTime: Date.now() + duration
    };

    const storageKey = `cache_${key}`;
    localStorage.setItem(storageKey, JSON.stringify(cacheItem));

    // Notifier les autres onglets
    notifyTabsOfCacheUpdate(key, data);
  } catch (error) {
    console.error('Error setting cache:', error);
  }
}

export function getCache<T>(key: string, options: { ignoreExpiry?: boolean } = {}): T | null {
  try {
    const storageKey = `cache_${key}`;
    const cachedData = localStorage.getItem(storageKey);
    if (!cachedData) return null;
    
    const cacheItem: CacheItem<T> = JSON.parse(cachedData);
    const now = Date.now();
    
    // Vérifier si le cache appartient à l'utilisateur actuel
    if (!isValidForCurrentUser(cacheItem)) {
      localStorage.removeItem(storageKey);
      return null;
    }
    
    // Vérifier l'expiration (sauf si ignoré)
    if (!options.ignoreExpiry && cacheItem.expiryTime && now > cacheItem.expiryTime) {
      localStorage.removeItem(storageKey);
      return null;
    }
    
    return cacheItem.data;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

export function invalidateCache(key?: string): void {
  if (key) {
    const storageKey = `cache_${key}`;
    localStorage.removeItem(storageKey);
    notifyTabsOfCacheInvalidation(key);
  } else {
    // Invalider tout le cache
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey?.startsWith('cache_')) {
        keysToRemove.push(storageKey);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    notifyTabsOfCacheInvalidation();
  }
}

// Vide le cache spécifique à l'utilisateur lors de la déconnexion
export function clearUserCache(): void {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const storageKey = localStorage.key(i);
    if (storageKey?.startsWith('cache_')) {
      try {
        const cachedData = localStorage.getItem(storageKey);
        if (cachedData) {
          const cacheItem = JSON.parse(cachedData);
          if (cacheItem.userId === currentUser) {
            keysToRemove.push(storageKey);
          }
        }
      } catch (error) {
        // Si on ne peut pas parser, on supprime par sécurité
        keysToRemove.push(storageKey);
      }
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  localStorage.removeItem(USER_SESSION_KEY);
  
  // Notifier les autres onglets
  notifyTabsOfUserLogout();
}

// Nettoyage automatique du cache expiré
export function cleanExpiredCache(): void {
  const now = Date.now();
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const storageKey = localStorage.key(i);
    if (storageKey?.startsWith('cache_')) {
      try {
        const cachedData = localStorage.getItem(storageKey);
        if (cachedData) {
          const cacheItem = JSON.parse(cachedData);
          if (cacheItem.expiryTime && now > cacheItem.expiryTime) {
            keysToRemove.push(storageKey);
          }
        }
      } catch (error) {
        keysToRemove.push(storageKey);
      }
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

// Synchronisation entre onglets
function notifyTabsOfCacheUpdate(key: string, data: any): void {
  if (typeof window !== 'undefined') {
    window.postMessage({
      type: 'CACHE_UPDATE',
      key,
      data
    }, window.location.origin);
  }
}

function notifyTabsOfCacheInvalidation(key?: string): void {
  if (typeof window !== 'undefined') {
    window.postMessage({
      type: 'CACHE_INVALIDATE',
      key
    }, window.location.origin);
  }
}

function notifyTabsOfUserLogout(): void {
  if (typeof window !== 'undefined') {
    window.postMessage({
      type: 'USER_LOGOUT'
    }, window.location.origin);
  }
}

// Écouter les événements de cache
export function onCacheUpdate<T>(key: string, callback: (data: T | null) => void): () => void {
  const listeners = cacheEventListeners.get(key) || [];
  listeners.push(callback);
  cacheEventListeners.set(key, listeners);

  // Écouter les messages entre onglets
  const messageHandler = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    
    const { type, key: eventKey, data } = event.data;
    
    if (type === 'CACHE_UPDATE' && eventKey === key) {
      callback(data);
    } else if (type === 'CACHE_INVALIDATE' && (!eventKey || eventKey === key)) {
      callback(null);
    } else if (type === 'USER_LOGOUT') {
      callback(null);
    }
  };

  window.addEventListener('message', messageHandler);

  // Fonction de nettoyage
  return () => {
    const listeners = cacheEventListeners.get(key) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
    window.removeEventListener('message', messageHandler);
  };
}

// Initialisation automatique du nettoyage
if (typeof window !== 'undefined') {
  // Nettoyer le cache expiré au chargement
  cleanExpiredCache();
  
  // Nettoyer périodiquement
  setInterval(cleanExpiredCache, 60000); // Toutes les minutes
}
