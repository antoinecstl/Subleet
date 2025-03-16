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
  const [isEditingContext, setIsEditingContext] = useState(false);
  const [editedContext, setEditedContext] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleBack = () => {
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
        
        const res = await fetch(`/api/public/fetch/project?project_id=${id}`);
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

  const startEditingContext = () => {
    setEditedContext(project.context || '');
    setIsEditingContext(true);
  };

  const cancelEditingContext = () => {
    setIsEditingContext(false);
    setEditedContext('');
  };

  const saveContextChanges = async () => {
    if (!project || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch('/api/public/projects/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          project_id: project.project_id, 
          context: editedContext 
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update project context');
      }
      
      const updatedProject = { ...project, context: editedContext };
      setProject(updatedProject);
      setToast({ message: 'Project context updated successfully', type: 'success' });
      setIsEditingContext(false);
      
      // Update project-specific cache
      setCache(`cache_project_${id}`, { project: updatedProject });
      
      // Invalidate ALL relevant caches to ensure dashboard updates
      localStorage.removeItem(`cache_client_${project.project_owner}`);
      localStorage.removeItem(`cache_project_${id}`);
      
      // Critical fix: also remove the dashboard central cache that the dashboard page uses
      localStorage.removeItem('cache_user_dashboard');
      
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

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
        <button 
        onClick={() => router.back()} 
        className="mb-4 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          &larr; Back
        </button>
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
            <p>
              <span className="font-semibold text-gray-400">Status:</span> 
              <span className={`ml-2 px-2 py-1 rounded ${project.working ? 'bg-green-500' : 'bg-red-500'}`}>
                {project.working ? 'Active' : 'Inactive'}
              </span>
            </p>
            <p className="mt-2"><span className="font-semibold text-gray-400">Total Calls:</span> {project.total_call}</p>

            {project.creation_timestamp && (
              <p className="mt-2">
                <span className="font-semibold text-gray-400">Created:</span> {
                  format(new Date(project.creation_timestamp), 'dd/MM/yyyy')
                }
              </p>
            )}
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold text-gray-400">Context:</span>
              {!isEditingContext ? (
                <button 
                  onClick={startEditingContext}
                  className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
                >
                  Edit Context
                </button>
              ) : (
                <div className="space-x-2">
                  <button 
                    onClick={saveContextChanges}
                    disabled={isUpdating}
                    className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-white"
                  >
                    {isUpdating ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={cancelEditingContext}
                    className="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-white"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            {isEditingContext ? (
              <textarea 
                value={editedContext}
                onChange={(e) => setEditedContext(e.target.value)}
                className="w-full h-32 p-3 rounded-md bg-gray-900 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
                placeholder="Enter context for this project..."
              />
            ) : (
              <p className="mt-1 bg-gray-900 p-3 rounded-md text-sm">{project.context || 'No context provided'}</p>
            )}
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
