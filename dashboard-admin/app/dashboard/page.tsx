"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from "@clerk/nextjs";
import { getCache, setCache } from '@/lib/cache-utils';
import Toast from '../components/Toast';
import { useSubscription } from '@/lib/subscription-context';

interface Project {
  project_id: number;
  project_name: string;
  working: boolean;
  creation_timestamp?: string;
  project_url?: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user } = useUser();
  const { hasClassicPlan } = useSubscription();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  useEffect(() => {
    // Only fetch user dashboard data if user has Classic plan
    if (hasClassicPlan) {
      fetchUserData();
    } else {
      // Set loading to false for users without Classic plan
      setLoading(false);
    }
  }, [hasClassicPlan]);

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
        const cachedData = getCache<Project[]>('cache_user_dashboard');
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

  // Handler for create project button
  const handleCreateProject = () => {
    if (hasClassicPlan) {
      if (projects.length >= 1) {
        // User already has the maximum number of projects allowed
        setToast({
          message: 'You have reached the maximum number of projects allowed with your current plan',
          type: 'error'
        });
      } else {
        // Navigate to create project page or show modal
        router.push('/dashboard/project/create');
      }
    } else {
      // Redirect to pricing page
      router.push('/pricing');
    }
  };

  // Show loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
                Welcome back{user?.firstName ? `, ${user.firstName}` : ''} !
              </p>
            </div>            <div className="mt-4 md:mt-0">
              {hasClassicPlan && (
                <button 
                  onClick={() => fetchUserData(true)} 
                  className="btn-outline px-4 py-2 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Project cards section */}       
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Projects</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* No projects message */}
            {!hasClassicPlan && projects.length === 0 && (
              <Link href="/pricing">
              <div className="p-4 h-full glass-card rounded-xl flex flex-col items-center justify-center">
                <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Subscribe to create your projects</h3>
                <p className="text-muted mb-4">
                  With the Classic subscription, you can create and manage your own AI project.
                </p>
                </div>
              </div>
              </Link>
            )}

            {/* Create Project Card Button */}
            <div
              className={`glass-card rounded-xl p-6 h-full flex flex-col justify-center items-center cursor-pointer hover-scale border-2 border-dashed border-primary/40 hover:border-primary transition-colors ${
                hasClassicPlan && projects.length >= 1 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleCreateProject}
              tabIndex={0}
              role="button"
              aria-disabled={hasClassicPlan && projects.length >= 1}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-primary">Create a project</h3>
              <p className="text-sm text-muted text-center">
                Start a new AI project
              </p>
            </div>

            {/* Existing Project Cards */}
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
          
          {/* Project limit info */}
          {hasClassicPlan && (
            <div className="fixed bottom-3 left-0 w-full backdrop-blur py-2 text-center text-xs sm:text-sm text-muted z-[-10]">
              <footer>
                <p>
                  Your current plan allows a maximum of 1 project.
                  {projects.length >= 1 ? (
                    <>
                    <br />
                    You have reached your project limit.
                    </>
                  ) : (
                    <>
                    <br />
                    You have created {projects.length} project{projects.length !== 1 && 's'}.
                    </>
                  )}
                </p>
              </footer>
            </div>
          )}
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
