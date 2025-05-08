"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from "@clerk/nextjs";
import { getCache, setCache } from '@/lib/cache-utils';
import Toast from '../components/Toast';

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    // Fetch user dashboard data when component mounts
    fetchUserData();
  }, []);

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

  const fetchUserData = async (bypassCache = false) => {
    try {
      setLoading(true);
      
      // Try to get from cache first unless bypassing
      if (!bypassCache) {
        const cachedData = getCache<any[]>('cache_user_dashboard');
        if (cachedData) {
          setProjects(cachedData);
          setLoading(false);
          return;
        }
      }

      // If no cache or bypassing, fetch from API
      const response = await fetch('/api/public/fetch/dashboard');
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Update state with fetched projects
      setProjects(data.projects || []);
      
      // Cache the result
      setCache('cache_user_dashboard', data.projects || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to fetch dashboard data',
        type: 'error'
      });
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const projectCards = () => {
    if (loading) {
      return (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (projects.length === 0) {
      return (
        <div className="min-h-[200px] flex flex-col items-center justify-center p-8 glass-card rounded-xl">
          <div className="w-16 h-16 bg-gray-200/20 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-medium mb-2">No projects yet</h2>
          <p className="text-center text-muted mb-4 max-w-md">
            You don't have any AI projects set up. Contact the admin team to get started with your first AI assistant.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Link href={`/dashboard/project/${project.project_id}`} key={project.project_id} className="hover:no-underline">
            <div className="glass-card rounded-xl p-6 h-full flex flex-col hover-scale">
              <div className="flex justify-between items-start mb-4">
                <h3 className="card-header mb-0 text-xl">
                  {project.project_name}
                </h3>
                <div className={`status-badge ${project.working ? 'status-active' : 'status-inactive'}`}>
                  {project.working ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="text-sm text-muted mb-4 flex-grow">
                <p className="mb-2">
                  {project.description || 'No description available'}
                </p>
                {project.creation_timestamp && (
                  <p className="text-xs mt-3">
                    Created on {new Date(project.creation_timestamp).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary opacity-5 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-secondary opacity-5 blur-3xl"></div>
      
      <div className="relative z-10 content-container">
        <div className="page-header">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-lg text-muted">
                Welcome back{user?.firstName ? `, ${user.firstName}` : ''}. Here are your AI projects.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button 
                onClick={() => fetchUserData(true)} 
                className="btn-outline px-4 py-2 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Project cards section */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Your Projects</h2>
          </div>
          {projectCards()}
        </div>
      </div>
      
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
    </div>
  );
}
