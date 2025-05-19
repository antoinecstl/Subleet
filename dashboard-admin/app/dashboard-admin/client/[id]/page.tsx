"use client"

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Toast from '../../../components/Toast';
import { getCache, setCache } from '../../../../lib/cache-utils';

export default function ClientDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);

  const fetchClientData = async (bypassCache = false) => {
    try {
      setLoading(true);
      
      // Try to get from cache first, unless bypassing cache
      if (!bypassCache) {
        const cachedData = getCache<any>(`cache_client_${id}`);
        if (cachedData) {
          setClient(cachedData.client);
          setProjects(cachedData.projects || []);
          setLoading(false);
          return;
        }
      }
      
      const clientResponse = await fetch(`/api/admin/fetch/user?client_id=${id}`);
      if (!clientResponse.ok) {
        throw new Error(`Error: ${clientResponse.status}`);
      }
      
      const clientData = await clientResponse.json();
      setClient(clientData.client);
      setProjects(clientData.projects || []);
      
      // Store in cache
      setCache(`cache_client_${id}`, {
        client: clientData.client,
        projects: clientData.projects || []
      });
    } catch (error) {
      console.error('Error fetching client data:', error);
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to fetch client data', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    fetchClientData(true);
  };

  useEffect(() => {
    if (id) {
      fetchClientData();
    }
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

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      setToast({ message: 'Project name is required', type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/admin/projects/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          project_name: newProjectName.trim(),
          project_owner: id 
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add project');
      }
      
      // Update local state with the new project
      setProjects([...projects, data.project]);
      
      // Update cache
      const cachedData = getCache<any>(`cache_client_${id}`);
      if (cachedData) {
        setCache(`cache_client_${id}`, {
          ...cachedData,
          projects: [...(cachedData.projects || []), data.project]
        });
      }
      
      // Also invalidate admin dashboard cache since project count changed
      localStorage.removeItem('cache_admin_clients');
      
      setToast({ message: 'Project added successfully', type: 'success' });
      setShowProjectForm(false);
      setNewProjectName('');
    } catch (error) {
      console.error('Error adding project:', error);
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to add project', 
        type: 'error' 
      });
    }
  };

  const handleDeleteProject = async (projectId: number): Promise<void> => {
    try {
      const response = await fetch('/api/admin/projects/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ project_id: projectId }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Update local state
      const updatedProjects = projects.filter(project => project.project_id !== projectId);
      setProjects(updatedProjects);
      
      // Update cache
      const cachedData = getCache<any>(`cache_client_${id}`);
      if (cachedData) {
        setCache(`cache_client_${id}`, {
          ...cachedData,
          projects: updatedProjects
        });
      }
      
      // Also invalidate admin dashboard cache since project count changed
      localStorage.removeItem('cache_admin_clients');
      
      // Also invalidate project cache
      localStorage.removeItem(`cache_admin_project_${projectId}`);
      localStorage.removeItem(`cache_project_${projectId}`);
      
      setToast({ message: 'Project deleted successfully', type: 'success' });
    } catch (error) {
      console.error('Error deleting project:', error);
      setToast({ 
        message: error instanceof Error ? error.message : 'Failed to delete project', 
        type: 'error' 
      });
    }
  };

  const confirmDeleteProject = () => {
    if (projectToDelete) {
      handleDeleteProject(projectToDelete.project_id);
      setProjectToDelete(null);
    }
  };

  const cancelDeleteProject = () => {
    setProjectToDelete(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen p-6">
        <button onClick={() => router.push('/dashboard-admin')} className="btn-gradient px-6 py-2 mb-6">
          &larr; Back to Dashboard
        </button>
        <div className="alert alert-error">Client not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary opacity-5 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-secondary opacity-5 blur-3xl"></div>
      
      <div className="relative z-10 content-container">
        <button 
          onClick={() => router.push('/dashboard-admin')} 
          className="mb-6 px-6 py-2 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-[var(--button-hover-from)] hover:to-[var(--button-hover-to)] text-white shadow-lg hover:shadow-primary/20 transition duration-300 flex items-center gap-2 transform hover:translate-x-1"
        >
          &larr; <span>Back to Dashboard</span>
        </button>
        
        {/* Client Details Card */}
        <div className="mb-8 p-8 glass-card rounded-xl">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">{client.name}</h1>
              <div className="text-lg text-muted">
                <p className="mb-1">{client.email}</p>
                {client.phone && <p>{client.phone}</p>}
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex gap-2">
              <button 
                onClick={handleRefresh} 
                className="btn-outline px-4 py-2 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button 
                onClick={() => setShowProjectForm(true)}
                className="btn-gradient px-4 py-2 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Project
              </button>
            </div>
          </div>
          
          {/* Client details section */}
          <div className="p-6 glass-card rounded-xl mb-6">
            <h3 className="card-header">Client Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold text-muted block mb-1">Client ID</span>
                  <span>{client.id}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-muted block mb-1">Creation Date</span>
                  <span>{new Date(client.creation_date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold text-muted block mb-1">Total Projects</span>
                  <span>{projects.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Projects Section */}
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Client Projects</h2>
          </div>
          
          {projects.length === 0 ? (
            <div className="min-h-[200px] flex flex-col items-center justify-center p-8 glass-card rounded-xl">
              <div className="w-16 h-16 bg-gray-200/20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-medium mb-2">No projects yet</h2>
              <p className="text-center text-muted mb-4 max-w-md">
                This client doesn't have any AI projects. Click "Add Project" to create one.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.project_id} className="glass-card rounded-xl p-6 h-full flex flex-col hover-scale">
                  <div className="flex justify-between items-start mb-4">
                    <Link href={`/dashboard-admin/project/${project.project_id}`} className="hover:no-underline">
                      <h3 className="card-header mb-0 text-xl">
                        {project.project_name}
                      </h3>
                    </Link>
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
                  <div className="flex justify-between mt-auto pt-4 border-t border-card-border">
                    <Link 
                      href={`/dashboard-admin/project/${project.project_id}`}
                      className="btn-outline px-3 py-1 text-sm"
                    >
                      Details
                    </Link>
                    <button 
                      onClick={() => setProjectToDelete(project)}
                      className="px-3 py-1 rounded-full border border-error text-error text-sm hover:bg-error hover:text-white transition duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popup modal for adding a project */}
      {showProjectForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="glass-card p-8 rounded-xl w-96 border border-card-border animate-fadeIn">
            <h2 className="card-header text-2xl mb-6">Add New Project</h2>
            <form onSubmit={handleAddProject} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input 
                  value={newProjectName} 
                  onChange={(e) => setNewProjectName(e.target.value)} 
                  placeholder="Enter project name" 
                  className="input-field"
                />
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowProjectForm(false)} 
                  className="btn-ghost px-5 py-2"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-gradient px-5 py-2"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {projectToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="glass-card p-8 rounded-xl w-96 border border-card-border animate-fadeIn">
            <h2 className="card-header text-2xl mb-4">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete the project "{projectToDelete.project_name}"?</p>
            <p className="mb-6 text-sm text-error">This action cannot be undone and will remove all associated data.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelDeleteProject} 
                className="btn-ghost px-5 py-2"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteProject} 
                className="btn-gradient bg-gradient-to-r from-error to-error-light hover:from-error hover:to-error px-5 py-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
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
