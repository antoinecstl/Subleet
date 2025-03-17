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
          className="mb-4 px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/20 transition duration-300 flex items-center gap-2"
        >
          &larr; <span>Back</span>
        </button>
        <p className="text-center text-red-500">Project not found or you don't have permission to view it.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background text-foreground relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-500 opacity-5 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-purple-600 opacity-5 blur-3xl"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <button 
          onClick={handleBack} 
          className="mb-6 px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/20 transition duration-300 flex items-center gap-2 transform hover:translate-x-1"
        >
          &larr; <span>Back</span>
        </button>
        
        {/* Project Details Card */}
        <div className="mb-8 p-8 glass-card rounded-xl border border-white/10 shadow-xl hover-scale">
          <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">{project.project_name}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="font-semibold text-white/70 mr-2">Status:</span> 
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${project.working ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                  {project.working ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p><span className="font-semibold text-white/70">Total API Calls:</span> {project.total_call}</p>
              {project.creation_timestamp && (
                <p>
                  <span className="font-semibold text-white/70">Created:</span> {
                    format(new Date(project.creation_timestamp), 'dd/MM/yyyy')
                  }
                </p>
              )}
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-white/70">Context:</span>
                {!isEditingContext ? (
                  <button 
                    onClick={startEditingContext}
                    className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full text-white text-sm transition duration-300 transform hover:scale-105"
                  >
                    Edit Context
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button 
                      onClick={saveContextChanges}
                      disabled={isUpdating}
                      className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-full text-white text-sm transition duration-300 transform hover:scale-105"
                    >
                      {isUpdating ? 'Saving...' : 'Save'}
                    </button>
                    <button 
                      onClick={cancelEditingContext}
                      className="px-3 py-1.5 border border-white/20 hover:bg-white/10 rounded-full text-white text-sm transition duration-300"
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
                  className="w-full h-32 p-4 rounded-xl bg-white/10 text-white border border-white/10 focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Enter context for this project..."
                />
              ) : (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 h-32 overflow-auto">
                  <p className="text-sm">{project.context || 'No context provided'}</p>
                </div>
              )}
            </div>
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
