"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Toast from '../../../components/Toast';
import { getCache, setCache } from '@/lib/cache-utils';
import { FaSync } from 'react-icons/fa';

export default function ClientDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [client, setClient] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newContext, setNewContext] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);

  const fetchClientData = async (bypassCache = false) => {
    try {
      setLoading(true);
      if (!bypassCache) {
        const cachedClient = getCache<any>(`cache_client_${id}`);
        if (cachedClient) {
          setClient(cachedClient.client);
          setProjects(cachedClient.projects);
          setLoading(false);
          return;
        }
      }

      const res = await fetch(`/api/admin/fetch/user?client_id=${id}`);
      const data = await res.json();
      if (data.error) {
        setToast({ message: data.error, type: 'error' });
        setClient(null);
      } else {
        setClient(data.client);
        setProjects(data.projects);
        
        // Save to cache
        setCache(`cache_client_${id}`, data);
      }
    } catch (error) {
      console.error(error);
      setToast({ message: 'Failed to fetch client data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    fetchClientData(true);
  };

  useEffect(() => {
    if (id) fetchClientData();
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
    if (!newProjectName) {
      setToast({ message: 'Project name is required', type: 'error' });
      return;
    }
    try {
      const response = await fetch('/api/admin/projects/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_name: newProjectName, project_owner: client.id, context: newContext })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add project');
      }

      // Ensure the new project has default values if not provided by API
      const newProject = {
        ...data.project,
        total_call: data.project.total_call || 0,
        working: data.project.working !== undefined ? data.project.working : true,
        context: data.project.context || newContext || '',
        creation_timestamp: data.project.creation_timestamp || Date.now()
      };
      
      // Update projects state with new project
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      
      // Update client object to increment project count if available
      const updatedClient = client.project_count !== undefined
        ? { ...client, project_count: (client.project_count || 0) + 1 }
        : client;
      setClient(updatedClient);
      
      // Update cache with new data instead of just invalidating
      setCache(`cache_client_${id}`, {
        client: updatedClient,
        projects: updatedProjects
      });
      
      // Also invalidate the admin dashboard cache to ensure project counts are updated
      localStorage.removeItem('cache_admin_clients');
      
      setToast({ message: data.message, type: 'success' });
      setShowProjectForm(false);
      setNewProjectName('');
      setNewContext('');
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  const handleDeleteProject = async (projectId: number): Promise<void> => {
    try {
      const response = await fetch('/api/admin/projects/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: projectId }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Update local state
      const updatedProjects = projects.filter(project => project.project_id !== projectId);
      setProjects(updatedProjects);
      
      // Update client object to decrement project count if available
      const updatedClient = client.project_count !== undefined
        ? { ...client, project_count: Math.max(0, (client.project_count || 0) - 1) }
        : client;
      setClient(updatedClient);
      
      // Update cache with new data
      setCache(`cache_client_${id}`, {
        client: updatedClient,
        projects: updatedProjects
      });
      
      // Also invalidate the admin dashboard cache to ensure project counts are updated
      localStorage.removeItem('cache_admin_clients');
      
      setToast({ message: 'Project deleted successfully', type: 'success' });
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
        setToast({ message: err.message, type: 'error' });
      } else {
        console.error(err);
        setToast({ message: 'An error occurred while deleting the project', type: 'error' });
      }
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

  const truncateText = (text: string | null | undefined, maxLength: number = 40): string => {
    if (!text) return 'N/A';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* ...existing loading code... */}
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // If no client data, display a message.
  if (!client) {
    return (
      <div className="min-h-screen p-6 bg-background text-foreground">
        <button onClick={() => router.back()} className="mb-4 text-blue-500 hover:underline">&larr; Back</button>
        <p className="text-center text-red-500">Client not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-background text-foreground">
      <button onClick={() => router.back()} className="mb-4 px-2 py-1 rounded-lg bg-gradient-to-r from-blue-700 to-purple-700 hover:underline">&larr; Back</button>
      <div className="mb-8 p-6 bg-table-bg border border-table-border rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Client Details</h2>
        </div>
        {client ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p><span className="font-semibold">Name:</span> {client.name}</p>
              <p><span className="font-semibold">Email:</span> {client.email}</p>
            </div>
            <div>
              <p><span className="font-semibold">Phone:</span> {client.phone || 'N/A'}</p>
              <p>
                <span className="font-semibold">Created:</span> {client.creation_date 
                  ? format(new Date(client.creation_date), 'dd/MM/yyyy')
                  : 'N/A'}
              </p>
            </div>
          </div>
        ) : (
          <p>Client not found.</p>
        )}
      </div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projects</h1>
        <button 
          onClick={() => setShowProjectForm(true)}
          className="bg-gradient-to-r from-blue-700 to-purple-700 hover:underline text-white py-2 px-4 rounded"
        >
          Add Project
        </button>
      </div>
      {projects.length === 0 ? (
        <div className="text-center p-8 bg-table-bg border border-table-border rounded-lg shadow-lg">
          <p className="text-lg text-gray-400">No projects found for this client.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl shadow-2xl border border-table-border">
          <table className="min-w-full bg-table-bg">
            <thead className="bg-gradient-to-r from-blue-900 to-purple-900">
              <tr>
                <th className="py-4 px-6 text-left font-semibold">Project Name</th>
                <th className="py-4 px-6 text-center font-semibold">Context</th>
                <th className="py-4 px-6 text-center font-semibold">Total Calls</th>
                <th className="py-4 px-6 text-center font-semibold">Creation date</th>
                <th className="py-4 px-6 text-center font-semibold">Status</th>
                <th className="py-4 px-6 text-center font-semibold relative">Actions
                <FaSync 
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 text-blue-400 hover:text-blue-600 cursor-pointer"
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
                  className={`cursor-pointer transition-colors duration-150 hover:bg-gray-700 ${index !== projects.length-1 ? 'border-b border-table-border' : ''}`}
                  onClick={() => router.push(`/dashboard-admin/project/${project.project_id}`)}
                >
                  <td className="py-4 px-6 text-left">{project.project_name}</td>
                  <td className="py-4 px-6 text-center" title={project.context || 'N/A'}>
                    {truncateText(project.context)}
                  </td>
                  <td className="py-4 px-6 text-center">{project.total_call}</td>
                  <td className="py-4 px-6 text-center">{format(new Date(project.creation_timestamp), 'dd/MM/yyyy')}</td>
                  <td className="py-4 px-6 text-center">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${project.working ? 'bg-green-500/20 text-green-400 border border-green-500' : 'bg-red-500/20 text-red-400 border border-red-500'}`}>
                      {project.working ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {/* Delete button stops propagation */}
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setProjectToDelete(project);
                      }} 
                      className="bg-red-500 text-white py-1.5 px-4 rounded-full hover:bg-red-600 transition duration-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Popup modal for Add Project */}
      {showProjectForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gradient-to-r from-blue-700 to-purple-700 p-6 rounded-lg w-96">
            <h2 className="text-xl mb-4">Add Project</h2>
            <form onSubmit={handleAddProject} className="text-black flex flex-col gap-4">
              <input 
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project Name"
                className="p-2 border rounded-lg"
              />
              <textarea
                value={newContext}
                onChange={(e) => setNewContext(e.target.value)}
                placeholder="Context (optional)"
                className="p-2 border rounded-lg"
              />
              <div className="flex gap-2 justify-end">
                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">Add</button>
                <button 
                  type="button" 
                  onClick={() => setShowProjectForm(false)}
                  className="bg-gray-300 text-black py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projectToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-red-500 text-xl mb-4">Confirm Deletion</h2>
            <p className='text-black'>Are you sure you want to delete project "{projectToDelete.project_name}"?</p>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={cancelDeleteProject} 
                className="bg-gray-300 text-black py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteProject} 
                className="bg-red-500 text-white py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
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
    </div>
  );
}
