"use client"

import { useState, useEffect, useRef } from 'react';
import { useUser } from "@clerk/nextjs";
import { format } from 'date-fns';
import Toast from '../components/Toast';

interface Project {
  project_id: number;
  project_name: string;
  context: string;
  total_call: number;
  working: boolean;
}

export default function Dashboard() {
  const { user } = useUser();
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const lastFetchRef = useRef<number>(0);
  const RATE_LIMIT_DELAY = 10000; 

  const loadCachedData = () => {
    const cached = localStorage.getItem('apiKeysCache');
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
    if (user) {
      const hasCachedData = loadCachedData();
      if (!hasCachedData) {
        fetchUserData();
      } else {
        const timer = setTimeout(() => {
          fetchUserData();
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
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

  const canFetch = () => {
    const now = Date.now();
    if (now - lastFetchRef.current >= RATE_LIMIT_DELAY) {
      lastFetchRef.current = now;
      return true;
    }
    return false;
  };

  const fetchUserData = async () => {
    if (!canFetch()) {
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

      localStorage.setItem('apiKeysCache', JSON.stringify(sortedProjects));
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
                      <th className="py-3 px-4 border-b border-table-border text-center">Total Calls</th>
                      <th className="py-3 px-4 border-b border-table-border text-left">Context</th>
                      <th className="py-3 px-4 border-b border-table-border text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project, index) => (
                      <tr key={project.project_id}>
                        <td className="py-3 px-4 border-b border-table-border">{project.project_name}</td>
                        <td className="py-3 px-4 border-b border-table-border text-center">{project.total_call}</td>
                        <td className="py-3 px-4 border-b border-table-border">{project.context}</td>
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
