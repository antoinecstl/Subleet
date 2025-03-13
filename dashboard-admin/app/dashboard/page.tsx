"use client"

import { useState, useEffect, useRef } from 'react';
import { useUser } from "@clerk/nextjs";
import { format } from 'date-fns';
import Toast from '../components/Toast';
import { useRouter } from 'next/navigation';
import { getCache, setCache } from '../../lib/cache-utils';

interface Project {
  project_id: number;
  project_name: string;
  context: string;
  total_call: number;
  working: boolean;
  creation_timestamp: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { user } = useUser();
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const lastFetchRef = useRef<number>(0);
  const RATE_LIMIT_DELAY = 10000; 
  const isFirstMount = useRef(true);

  const loadCachedData = () => {
    // First check our central cache
    const cachedData = getCache<{client: any, projects: Project[]}>('cache_user_dashboard');
    if (cachedData) {
      setClientProfile(cachedData.client);
      setProjects(cachedData.projects);
      setIsLoading(false);
      return true;
    }
    
    // Fallback to localStorage
    const cached = localStorage.getItem('Projects');
    if (cached) {
      try {
        const parsedData = JSON.parse(cached);
        setProjects(parsedData);
        setIsLoading(false);
        return true;
      } catch (e) {
        console.error('Error parsing cached data');
      }
    }
    return false;
  };

  useEffect(() => {
    // Set a flag in session storage when dashboard mounts
    const isReturningNavigation = sessionStorage.getItem('returning_to_dashboard') === 'true';
    sessionStorage.setItem('returning_to_dashboard', 'true');
    
    // On first render
    if (user) {
      const hasCachedData = loadCachedData();
      
      if (isReturningNavigation) {
        // If we're returning via back navigation, prioritize cache and reset rate limit
        lastFetchRef.current = 0;
        if (hasCachedData) {
          setIsLoading(false);
          // Only refetch after a delay if we have cached data and are returning
          const timer = setTimeout(() => {
            fetchUserData(false, true);
          }, 3000); // Delayed refresh
          return () => clearTimeout(timer);
        }
      }
      
      if (!hasCachedData) {
        fetchUserData(false, isReturningNavigation);
      } else {
        // If we have cached data but it's not a back navigation, refresh after a short delay
        const timer = setTimeout(() => {
          fetchUserData();
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
    
    return () => {
      if (isFirstMount.current) {
        isFirstMount.current = false;
      }
    };
  }, [user]);

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

  const canFetch = (isReturningNavigation = false) => {
    const now = Date.now();
    // Skip rate limiting on return navigation
    if (isReturningNavigation) return true;
    
    if (now - lastFetchRef.current >= RATE_LIMIT_DELAY) {
      lastFetchRef.current = now;
      return true;
    }
    return false;
  };

  const fetchUserData = async (bypassCache = false, isReturningNavigation = false) => {
    if (!canFetch(isReturningNavigation) && !bypassCache) {
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
      
      // Try to get from cache first if not bypassing
      if (!bypassCache) {
        const cachedData = getCache<{client: any, projects: Project[]}>('cache_user_dashboard');
        if (cachedData) {
          setClientProfile(cachedData.client);
          setProjects(cachedData.projects);
          setIsLoading(false);
          return;
        }
      }
      
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
        return;
      }

      const { client, projects: projectsData } = data;
      setClientProfile(client);

      const sortedProjects = [...projectsData].sort((a: Project, b: Project) => {
        if (a.working !== b.working) {
          return a.working ? -1 : 1;
        }
        return b.total_call - a.total_call;
      });

      // Save to cache with our utility
      setCache('cache_user_dashboard', { client, projects: sortedProjects });
      
      setProjects(sortedProjects);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 pb-20 bg-background text-foreground">
      <main className="flex flex-col items-center mt-16 max-w-6xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Loading your projects...</p>
          </div>
        ) : (
          <>
            {clientProfile && (
              <div className="w-full mb-8 p-6 bg-table-bg border border-table-border rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Profile</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-semibold">Name:</span> {clientProfile.name}</p>
                    <p><span className="font-semibold">Email:</span> {clientProfile.email}</p>
                  </div>
                  <div>
                    <p><span className="font-semibold">Phone:</span> {clientProfile.phone || 'N/A'}</p>
                    <p>
                      <span className="font-semibold">Created:</span> {clientProfile.creation_date 
                        ? format(new Date(clientProfile.creation_date), 'dd/MM/yyyy') 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {projects.length === 0 ? (
              <div className="text-center p-8 bg-table-bg border border-table-border rounded-lg shadow-lg">
                <p className="text-lg text-gray-400">No projects found for your account.</p>
                <p className="mt-2 text-sm text-gray-500">Please contact the administrator for assistance.</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <h1 className="text-3xl font-bold mb-8">Your Projects</h1>
                <table className="min-w-full bg-table-bg border border-table-border shadow-lg rounded-lg">
                  <thead className="bg-table-bg">
                    <tr>
                      <th className="py-3 px-4 border-b border-table-border text-left">Project Name</th>
                      <th className="py-3 px-4 border-b border-table-border text-center">Context</th>
                      <th className="py-3 px-4 border-b border-table-border text-center">Total Calls</th>
                      <th className="py-3 px-4 border-b border-table-border text-center">Creation date</th>
                      <th className="py-3 px-4 border-b border-table-border text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project) => (
                      <tr 
                        key={project.project_id} 
                        className="cursor-pointer hover:bg-gray-700"
                        onClick={() => router.push(`/dashboard/project/${project.project_id}`)}
                      >
                        <td className="py-3 px-4 border-b border-table-border text-left">{project.project_name}</td>
                        <td className="py-3 px-4 border-b border-table-border text-center">{project.context || 'N/A'}</td>
                        <td className="py-3 px-4 border-b border-table-border text-center">{project.total_call}</td>
                        <td className="py-3 px-4 border-b border-table-border text-center">{format(new Date(project.creation_timestamp), 'dd/MM/yyyy')}</td>
                        <td className="py-3 px-4 border-b border-table-border text-center">
                          <span className={`px-2 py-1 rounded ${project.working ? 'bg-green-500' : 'bg-red-500'}`}>
                            {project.working ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
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
