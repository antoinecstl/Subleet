"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Toast from '../../../components/Toast';
import { getCache, setCache } from '@/lib/cache-utils';

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

  useEffect(() => {
    const fetchClientData = async (bypassCache = false) => {
      try {
        if (!bypassCache) {
          const cachedClient = getCache<any>(`cache_client_${id}`);
          if (cachedClient) {
            setClient(cachedClient.client);
            setProjects(cachedClient.projects);
            setLoading(false);
            return;
          }
        }

        const res = await fetch(`/api/fetch-user-details?client_id=${id}`);
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
      } finally {
        setLoading(false);
      }
    };
    
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
      const response = await fetch('/api/add-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_name: newProjectName, project_owner: client.id, context: newContext })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add project');
      }
      setToast({ message: data.message, type: 'success' });
      setProjects(prev => [...prev, data.project]);
      setShowProjectForm(false);
      setNewProjectName('');
      setNewContext('');
      
      // Invalidate cache
      localStorage.removeItem(`cache_client_${id}`);
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    }
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
        <h2 className="text-2xl font-bold mb-4">Client Details</h2>
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
        <div className="overflow-x-auto">
          <table className="min-w-full bg-table-bg border border-table-border shadow-lg rounded-lg">
            <thead className="bg-table-bg">
              <tr>
                <th className="py-3 px-4 border-b border-table-border text-left">Project Name</th>
                <th className="py-3 px-4 border-b border-table-border text-center">Context</th>
                <th className="py-3 px-4 border-b border-table-border text-center">Total Calls</th>
                <th className="py-3 px-4 border-b border-table-border text-center">Creation date</th>
                <th className="py-3 px-4 border-b border-table-border text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(project => (
                <tr 
                  key={project.project_id} 
                  className="cursor-pointer hover:bg-gray-700"
                  onClick={() => router.push(`/dashboard-admin/project/${project.project_id}`)}
                >
                  <td className="py-3 px-4 border-b border-table-border text-left">{project.project_name}</td>
                  <td className="py-3 px-4 border-b border-table-border text-center">{project.context || 'N/A'}</td>
                  <td className="py-3 px-4 border-b border-table-border text-center">{project.total_call}</td>
                  <td className="py-3 px-4 border-b border-table-border text-center">{format(new Date(project.creation_timestamp), 'dd/MM/yyyy')}</td>
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
