"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Toast from '../../../components/Toast';
import { getCache, setCache } from '@/lib/cache-utils';

export default function AdminProjectDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchProjectData = async (bypassCache = false) => {
      try {
        if (!bypassCache) {
          const cachedData = getCache<any>(`cache_admin_project_${id}`);
          if (cachedData) {
            setProject(cachedData.project);
            setClientInfo(cachedData.clientInfo);
            setLoading(false);
            return;
          }
        }
        
        const res = await fetch(`/api/admin/fetch/project?project_id=${id}`);
        const data = await res.json();
        
        if (data.error) {
          setToast({ message: data.error, type: 'error' });
          setProject(null);
        } else {
          setProject(data.project);
          setClientInfo(data.clientInfo || null);
          
          // Cache the data
          setCache(`cache_admin_project_${id}`, data);
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

  const toggleProjectStatus = async () => {
    if (!project || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/projects/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          project_id: project.project_id, 
          working: !project.working 
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update project status');
      }
      
      setProject({ ...project, working: !project.working });
      setToast({ message: 'Project status updated successfully', type: 'success' });
      
      // After successful toggle, update cache
      setCache(`cache_admin_project_${id}`, {
        project: { ...project, working: !project.working },
        clientInfo
      });
      // Also invalidate the client cache since project status changed
      localStorage.removeItem(`cache_client_${project.project_owner}`);
      
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
          className="mb-4 px-2 py-1 rounded-lg bg-gradient-to-r from-blue-700 to-purple-700 text-white hover:underline"
        >
          &larr; Back
        </button>
        <p className="text-center text-red-500">Project not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background text-foreground">
      <button 
        onClick={() => router.back()} 
        className="mb-4 px-2 py-1 rounded-lg bg-gradient-to-r from-blue-700 to-purple-700 text-white hover:underline"
      >
        &larr; Back
      </button>
      
      {/* Project Details Card */}
      <div className="mb-8 p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold mb-4">{project.project_name}</h1>
          <button 
            onClick={toggleProjectStatus}
            disabled={isUpdating}
            className={`px-3 py-1 rounded-md ${project.working 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-green-500 hover:bg-green-600'} text-white transition`}
          >
            {isUpdating ? 'Updating...' : project.working ? 'Disable Project' : 'Enable Project'}
          </button>
        </div>
        
        {clientInfo && (
          <div className="mb-6 p-4 bg-gray-900 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Client Information</h3>
            <p><span className="font-semibold text-gray-400">Name:</span> {clientInfo.name}</p>
            <p><span className="font-semibold text-gray-400">Email:</span> {clientInfo.email}</p>
            <p><span className="font-semibold text-gray-400">Phone:</span> {clientInfo.phone || 'N/A'}</p>
            <p><span className="font-semibold text-gray-400">Registration Date:</span> {clientInfo.creation_date ? 
              format(new Date(clientInfo.creation_date), 'dd/MM/yyyy') : 'N/A'}</p>
          </div>
        )}
        
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
