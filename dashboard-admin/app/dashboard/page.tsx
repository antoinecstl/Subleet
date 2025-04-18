"use client"

import { useState, useEffect, useRef } from 'react';
import { useUser } from "@clerk/nextjs";
import { format } from 'date-fns';
import Toast from '../components/Toast';
import { useRouter } from 'next/navigation';
import { getCache, setCache } from '../../lib/cache-utils';
import { FaSync } from 'react-icons/fa';

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
  const lastFetchRef = useRef<number>(0);
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
        // If we're returning via back navigation, prioritize cache
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

  const fetchUserData = async (bypassCache = false, isReturningNavigation = false) => {
    try {
      setIsLoading(true);
      
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
      
      const response = await fetch('/api/public/fetch/dashboard');
      
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

  const handleRefresh = () => {
    fetchUserData(true);
  };

  const truncateText = (text: string | null | undefined, maxLength: number = 40): string => {
    if (!text) return 'N/A';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="min-h-screen p-4 sm:p-8 pb-20 bg-background text-foreground relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-500 opacity-5 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-purple-600 opacity-5 blur-3xl"></div>

      <main className="flex flex-col items-center mt-16 max-w-6xl mx-auto relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Loading your projects...</p>
          </div>
        ) : (
          <>
            {clientProfile && (
              <div className="w-full mb-8 p-8 glass-card rounded-xl border border-white/10 hover-scale shadow-xl">
                <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Your Profile</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p><span className="font-semibold text-white/70">Name:</span> {clientProfile.name}</p>
                    <p><span className="font-semibold text-white/70">Email:</span> {clientProfile.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p><span className="font-semibold text-white/70">Phone:</span> {clientProfile.phone || 'N/A'}</p>
                    <p>
                      <span className="font-semibold text-white/70">Created:</span> {clientProfile.creation_date 
                        ? format(new Date(clientProfile.creation_date), 'dd/MM/yyyy') 
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {projects.length === 0 ? (
              <div className="text-center p-12 glass-card rounded-xl border border-white/10 shadow-lg w-full">
                <p className="text-xl text-white/70">No projects found for your account.</p>
                <p className="mt-2 text-sm text-white/50">Please contact the administrator for assistance.</p>
              </div>
            ) : (
              <div className="w-full">
                <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Your Projects</h1>
                <div className="overflow-hidden rounded-xl shadow-2xl glass-card border border-white/10">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-blue-800 to-purple-800">
                        <tr>
                          <th className="py-4 px-6 text-left font-semibold">Project Name</th>
                          <th className="py-4 px-6 text-center font-semibold">Context</th>
                          <th className="py-4 px-6 text-center font-semibold">Total Calls</th>
                          <th className="py-4 px-6 text-center font-semibold">Creation date</th>
                          <th className="py-4 px-6 text-center font-semibold relative">
                            Status
                            <FaSync 
                              className="absolute top-1/2 right-4 transform -translate-y-1/2 text-blue-400 hover:text-blue-600 cursor-pointer hover:rotate-180 transition-all duration-500"
                              size={16}
                              onClick={handleRefresh}
                              aria-label="Refresh data"
                            />
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((project, index) => (
                          <tr 
                            key={project.project_id} 
                            className={`cursor-pointer transition-colors duration-150 hover:bg-white/5 ${index !== projects.length-1 ? 'border-b border-white/10' : ''}`}
                            onClick={() => router.push(`/dashboard/project/${project.project_id}`)}
                          >
                            <td className="py-4 px-6 text-left">{project.project_name}</td>
                            <td className="py-4 px-6 text-center" title={project.context || 'N/A'}>
                              {truncateText(project.context)}
                            </td>
                            <td className="py-4 px-6 text-center">{project.total_call}</td>
                            <td className="py-4 px-6 text-center">{format(new Date(project.creation_timestamp), 'dd/MM/yyyy')}</td>
                            <td className="py-4 px-6 text-center">
                              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${project.working ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                                {project.working ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
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
