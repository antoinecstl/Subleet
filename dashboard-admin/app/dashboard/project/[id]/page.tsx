"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Toast from '../../../components/Toast';
import { getCache, setCache } from '@/lib/cache-utils';

export default function ProjectDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  const handleBack = () => {
    // Set flag that we're returning to dashboard via back navigation
    sessionStorage.setItem('returning_to_dashboard', 'true');
    router.back();
  };

  useEffect(() => {
    const fetchProjectData = async (bypassCache = false) => {
      try {
        if (!bypassCache) {
          const cachedProject = getCache<any>(`cache_project_${id}`);
          if (cachedProject) {
            setProject(cachedProject.project);
            setLoading(false);
            return;
          }
        }
        
        const res = await fetch(`/api/fetch-project-details?project_id=${id}`);
        const data = await res.json();
        
        if (data.error) {
          setToast({ message: data.error, type: 'error' });
          setProject(null);
        } else {
          setProject(data.project);
          
          // Cache the result
          setCache(`cache_project_${id}`, data);
        }
      } catch (error) {
        console.error(error);
        setToast({ message: 'Failed to load project data', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    if (id) fetchProjectData();
  }, [id]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="min-h-screen p-6 bg-background text-foreground">
        <button onClick={() => router.back()} className="mb-4 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">&larr; Back</button>
        <p className="text-center text-red-500">Project not found or you don't have permission to view it.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background text-foreground">
      <button onClick={handleBack} className="mb-4 px-3 py-1 bg-gradient-to-r from-blue-700 to-purple-700 text-white rounded-md hover:bg-blue-700">&larr; Back</button>
      
      {/* Project Details Card */}
      <div className="mb-8 p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">{project.project_name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p><span className="font-semibold text-gray-400">Status:</span> 
              <span className={`ml-2 px-2 py-1 rounded ${project.working ? 'bg-green-500' : 'bg-red-500'}`}>
                {project.working ? 'Active' : 'Inactive'}
              </span>
            </p>
            <p className="mt-2"><span className="font-semibold text-gray-400">Total API Calls:</span> {project.total_call}</p>

            {project.creation_timestamp && (
              <p className="mt-2">
                <span className="font-semibold text-gray-400">Created:</span> {
                  format(new Date(project.creation_timestamp), 'dd/MM/yyyy')
                }
              </p>
            )}
          </div>
          
          <div>
            <p><span className="font-semibold text-gray-400">Context:</span></p>
            <p className="mt-1 bg-gray-900 p-3 rounded-md text-sm">{project.context || 'No context provided'}</p>
          </div>
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
