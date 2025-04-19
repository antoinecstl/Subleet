"use client"

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Toast from '../../../components/Toast';
import { getCache, setCache } from '@/lib/cache-utils';
import { FaTrash, FaUpload, FaFileAlt, FaSync } from 'react-icons/fa';

interface VectorFile {
  id: string;
  filename: string;
  size: number;
  created_at: string;
  purpose: string;
}

export default function AdminProjectDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditingContext, setIsEditingContext] = useState(false);
  const [editedContext, setEditedContext] = useState('');
  
  // États pour Vector Store
  const [vectorFiles, setVectorFiles] = useState<VectorFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (project) {
      fetchVectorFiles();
    }
  }, [project]);

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

  const fetchVectorFiles = async () => {
    try {
      setLoadingFiles(true);
      const response = await fetch(`/api/admin/vector-store/files?project_id=${id}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setVectorFiles(data.files || []);
    } catch (error) {
      console.error('Failed to fetch vector files:', error);
      setToast({ message: 'Failed to load vector files', type: 'error' });
    } finally {
      setLoadingFiles(false);
    }
  };

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
      const response = await fetch('/api/admin/projects/update', {
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
      
      // Update cache
      setCache(`cache_admin_project_${id}`, {
        project: updatedProject,
        clientInfo
      });
      
      // Also invalidate the client cache since project context changed
      localStorage.removeItem(`cache_client_${project.project_owner}`);
      localStorage.removeItem(`cache_project_${id}`);
      
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setToast({ message: 'Please select a file to upload', type: 'error' });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('project_id', id as string);
      formData.append('file', selectedFile);

      const response = await fetch('/api/admin/vector-store/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      setToast({ message: 'File uploaded successfully', type: 'success' });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      fetchVectorFiles(); // Refresh file list
    } catch (error) {
      console.error('Upload error:', error);
      setToast({ message: 'Failed to upload file', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/admin/vector-store/delete?project_id=${id}&file_id=${fileId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete file');
      }

      setToast({ message: 'File deleted successfully', type: 'success' });
      fetchVectorFiles(); // Refresh file list
    } catch (error) {
      console.error('Delete error:', error);
      setToast({ message: 'Failed to delete file', type: 'error' });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
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
    <div className="min-h-screen p-6 bg-background text-foreground relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-blue-500 opacity-5 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-purple-600 opacity-5 blur-3xl"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <button 
          onClick={() => router.back()} 
          className="mb-6 px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-blue-500/20 transition duration-300 flex items-center gap-2 transform hover:translate-x-1"
        >
          &larr; <span>Back</span>
        </button>
        
        {/* Project Details Card */}
        <div className="mb-8 p-8 glass-card rounded-xl border border-white/10 shadow-xl hover-scale">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">{project.project_name}</h1>
            <button 
              onClick={toggleProjectStatus}
              disabled={isUpdating}
              className={`px-4 py-2 rounded-full shadow-lg transition duration-300 transform hover:scale-105 ${project.working 
                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600' 
                : 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600'} text-white`}
            >
              {isUpdating ? 'Updating...' : project.working ? 'Disable Project' : 'Enable Project'}
            </button>
          </div>
          
          {clientInfo && (
            <div className="mb-8 p-6 glass-card rounded-xl border border-white/10">
              <h3 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p><span className="font-semibold text-white/70">Name:</span> {clientInfo.name}</p>
                  <p><span className="font-semibold text-white/70">Email:</span> {clientInfo.email}</p>
                </div>
                <div className="space-y-2">
                  <p><span className="font-semibold text-white/70">Phone:</span> {clientInfo.phone || 'N/A'}</p>
                  <p><span className="font-semibold text-white/70">Registration:</span> {clientInfo.creation_date ? 
                    format(new Date(clientInfo.creation_date), 'dd/MM/yyyy') : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
          
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

        {/* Vector Store Files Section */}
        <div className="p-8 glass-card rounded-xl border border-white/10 shadow-xl mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
              Vector Store Files
            </h2>
            <button 
              onClick={fetchVectorFiles}
              className="p-2 rounded-full hover:bg-white/10 transition"
              disabled={loadingFiles}
            >
              <FaSync className={`text-blue-400 ${loadingFiles ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-2">
              <div className="flex-grow w-full">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold file:cursor-pointer
                    file:bg-gradient-to-r file:from-blue-600 file:to-purple-600 file:text-white
                    hover:file:from-blue-700 hover:file:to-purple-700
                    text-white/70 cursor-pointer"
                  accept=".txt,.md,.pdf,.csv,.json,.html,.htm"
                  ref={fileInputRef}
                />
              </div>
              <button
                onClick={handleFileUpload}
                disabled={!selectedFile || isUploading}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition transform hover:scale-105 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <FaUpload />
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            <p className="text-xs text-white/50">Supported formats: .txt, .md, .pdf, .csv, .json, .html</p>
          </div>

          {loadingFiles ? (
            <div className="flex justify-center items-center p-8">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : vectorFiles.length > 0 ? (
            <div className="overflow-hidden rounded-xl bg-white/5 border border-white/10">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-blue-800/50 to-purple-800/50">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold">Filename</th>
                    <th className="py-3 px-4 text-center font-semibold">Size</th>
                    <th className="py-3 px-4 text-center font-semibold">Date</th>
                    <th className="py-3 px-4 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vectorFiles.map((file, index) => (
                    <tr 
                      key={file.id} 
                      className={`transition-colors duration-150 hover:bg-white/5 ${index !== vectorFiles.length-1 ? 'border-b border-white/10' : ''}`}
                    >
                      <td className="py-3 px-4 text-left">
                        <div className="flex items-center gap-2">
                          <FaFileAlt className="text-blue-400" />
                          {file.filename}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">{formatFileSize(file.size)}</td>
                      <td className="py-3 px-4 text-center">
                        {new Date(file.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-2 rounded-full hover:bg-red-500/20 text-red-400 transition"
                          title="Delete file"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-8 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/50">No files have been uploaded to the Vector Store yet.</p>
              <p className="text-sm text-white/30 mt-2">Upload files to enable RAG capabilities for this project.</p>
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
