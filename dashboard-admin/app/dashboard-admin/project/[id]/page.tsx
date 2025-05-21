"use client"

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Toast from '../../../components/Toast';
import { getCache, setCache } from '@/lib/cache-utils';
import { FaTrash, FaUpload, FaFileAlt, FaSync, FaCopy } from 'react-icons/fa';

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
  
  // States for assistant
  const [assistantInfo, setAssistantInfo] = useState<any>(null);
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [editedInstructions, setEditedInstructions] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isModelChangeOpen, setIsModelChangeOpen] = useState(false);
  
  // States for Vector Store
  const [vectorFiles, setVectorFiles] = useState<VectorFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [vectorStoreId, setVectorStoreId] = useState<string | null>(null);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const [isEditingContext, setIsEditingContext] = useState(false);
  const [editedContext, setEditedContext] = useState('');

  useEffect(() => {
    const fetchProjectData = async (bypassCache = false) => {
      try {
        setLoading(true);
        if (!bypassCache) {
          const cachedData = getCache<any>(`cache_admin_project_${id}`);
          if (cachedData) {
            setProject(cachedData.project);
            setClientInfo(cachedData.clientInfo);
            setAssistantInfo(cachedData.assistant);
            setEditedInstructions(cachedData.assistant?.instructions || '');
            setEditedContext(cachedData.project?.context || '');
            setVectorStoreId(cachedData.vectorStoreId || null);
            setAssistantId(cachedData.assistantId || null);
            setLoading(false);
            return;
          }
        }
        
        const res = await fetch(`/api/admin/fetch/project?project_id=${id}`);
        const data = await res.json();
        
        if (data.error) {
          throw new Error(data.error);
        } else {
          setProject(data.project);
          setClientInfo(data.clientInfo);
          setAssistantInfo(data.assistant || null);
          setEditedInstructions(data.assistant?.instructions || '');
          setEditedContext(data.project?.context || '');
          setVectorStoreId(data.vectorStoreId || null);
          setAssistantId(data.assistantId || null);
          
          // Cache the result
          setCache(`cache_admin_project_${id}`, {
            project: data.project,
            clientInfo: data.clientInfo,
            assistant: data.assistant,
            vectorStoreId: data.vectorStoreId,
            assistantId: data.assistantId
          });
        }
      } catch (error) {
        console.error('Error fetching project data:', error);
        setToast({ 
          message: error instanceof Error ? error.message : 'Failed to load project data', 
          type: 'error' 
        });
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
        clientInfo,
        assistant: assistantInfo,
        vectorStoreId,
        assistantId
      });
      // Also invalidate the client cache since project status changed
      localStorage.removeItem(`cache_client_${project.project_owner}`);
      
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const startEditingInstructions = () => {
    setEditedInstructions(assistantInfo?.instructions || '');
    setIsEditingInstructions(true);
  };

  const cancelEditingInstructions = () => {
    setIsEditingInstructions(false);
    setEditedInstructions(assistantInfo?.instructions || '');
  };

  const saveInstructionsChanges = async () => {
    if (!assistantId || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/assistants/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          project_id: project.project_id, 
          instructions: editedInstructions 
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update assistant instructions');
      }
      
      setAssistantInfo({
        ...assistantInfo,
        instructions: data.assistant.instructions
      });
      setToast({ message: 'Assistant instructions updated successfully', type: 'success' });
      setIsEditingInstructions(false);
      
      // Update cache
      const cachedData = getCache<any>(`cache_admin_project_${id}`);
      if (cachedData) {
        setCache(`cache_admin_project_${id}`, {
          ...cachedData,
          assistant: {
            ...cachedData.assistant,
            instructions: data.assistant.instructions
          }
        });
      }
      
      // Also invalidate the client cache since instructions changed
      localStorage.removeItem(`cache_client_${project.project_owner}`);
      localStorage.removeItem(`cache_project_${id}`);
      
    } catch (err: any) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const updateModel = async () => {
    if (!assistantId || isUpdating || !selectedModel) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/assistants/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          project_id: project.project_id, 
          model: selectedModel 
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update assistant model');
      }
      
      setAssistantInfo({
        ...assistantInfo,
        model: data.assistant.model
      });
      setToast({ message: 'Assistant model updated successfully', type: 'success' });
      setIsModelChangeOpen(false);
      
      // Update cache
      const cachedData = getCache<any>(`cache_admin_project_${id}`);
      if (cachedData) {
        setCache(`cache_admin_project_${id}`, {
          ...cachedData,
          assistant: {
            ...cachedData.assistant,
            model: data.assistant.model
          }
        });
      }
      
      // Also invalidate the client cache since model changed
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess(true);
        setToast({ message: 'ID copied to clipboard', type: 'success' });
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
        setToast({ message: 'Copy failed', type: 'error' });
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="min-h-screen p-6">
        <button 
          onClick={() => router.back()} 
          className="btn-gradient px-6 py-2 mb-6"
        >
          &larr; Back
        </button>
        <div className="alert alert-error">Project not found</div>
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
          onClick={() => router.push(`/dashboard-admin/client/${project.project_owner}`)} 
          className="mb-6 px-6 py-2 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-[var(--button-hover-from)] hover:to-[var(--button-hover-to)] text-white shadow-lg hover:shadow-primary/20 transition duration-300 flex items-center gap-2 transform hover:translate-x-1"
        >
          &larr; <span>Back to Client</span>
        </button>
        
        {/* Project Details Card */}
        <div className="mb-8 p-8 glass-card rounded-xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold mb-0">{project.project_name}</h1>
            <div className="flex items-center gap-3">
              <div className={`status-badge ${project.working ? 'status-active' : 'status-inactive'}`}>
                State : {project.working ? 'Active' : 'Inactive'}
              </div>
              <button 
                onClick={toggleProjectStatus}
                disabled={isUpdating}
                className={`${project.working ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-primary to-secondary hover:from-[var(--button-hover-from)] hover:to-[var(--button-hover-to)]'} px-4 py-2 rounded-full text-white flex items-center gap-2 transition duration-300`}
              >
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                ) : null}
                {project.working ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
          
          {clientInfo && (
            <div className="p-6 glass-card rounded-xl mb-6">
              <h3 className="card-header">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-semibold text-muted block mb-1">Client Name</span>
                    <span>{clientInfo.name}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-muted block mb-1">Client Email</span>
                    <span>{clientInfo.email}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {clientInfo.phone && (
                    <div>
                      <span className="text-sm font-semibold text-muted block mb-1">Phone</span>
                      <span>{clientInfo.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Project details section */}
          <div className="p-6 glass-card rounded-xl mb-6">
            <h3 className="card-header">Project Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold text-muted block mb-1">Project ID</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono bg-card-bg px-2 py-1 rounded">{project.project_id}</span>
                    <button 
                      onClick={() => copyToClipboard(project.project_id)}
                      className={`p-1.5 rounded-full hover:bg-card-hover-border transition-colors ${copySuccess ? 'text-success' : 'text-muted'}`}
                    >
                      <FaCopy size={14} />
                    </button>
                  </div>
                </div>
                {project.creation_timestamp && (
                  <div>
                    <span className="text-sm font-semibold text-muted block mb-1">Creation Date</span>
                    <span>{new Date(project.creation_timestamp).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {assistantInfo?.model && (
                  <div>
                    <span className="text-sm font-semibold text-muted block mb-1">AI Model</span>
                    <div className="flex items-center gap-3">
                      <span>{assistantInfo.model}</span>
                      <button 
                        onClick={() => setIsModelChangeOpen(true)}
                        className="text-xs px-2 py-1 btn-outline rounded-full"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-sm font-semibold text-muted block mb-1">Status</span>
                  <span className={`status-badge ${project.working ? 'status-active' : 'status-inactive'}`}>
                    {project.working ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Instructions section */}
          <div className="p-6 glass-card rounded-xl mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="card-header mb-0">
                Assistant Instructions
              </h3>
              {!isEditingInstructions ? (
                <button 
                  onClick={startEditingInstructions}
                  className="btn-outline px-4 py-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 inline" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit
                </button>
              ) : (
                <div className="space-x-2">
                  <button 
                    onClick={saveInstructionsChanges}
                    disabled={isUpdating}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-4 py-2 rounded-full text-white text-sm transition duration-300 inline-flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {isUpdating ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={cancelEditingInstructions}
                    className="btn-ghost px-4 py-2 border border-card-border"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 inline" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            {isEditingInstructions ? (
              <div className="space-y-2">
                <textarea 
                  value={editedInstructions}
                  onChange={(e) => setEditedInstructions(e.target.value)}
                  className="input-field min-h-[250px] resize-vertical"
                  placeholder="Enter instructions for the AI assistant..."
                />
                <p className="text-xs text-muted italic">
                  These instructions guide the AI in its interactions with users. Be precise and detailed for better results.
                </p>
              </div>
            ) : (
              <div>
                <div className="p-5 rounded-xl bg-card-bg border border-card-border min-h-[200px] max-h-[400px] overflow-auto">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{assistantInfo?.instructions || 'No instructions provided for this assistant.'}</p>
                </div>
                <p className="text-xs text-muted mt-3 italic">
                  These instructions guide the AI in its interactions with users.
                </p>
              </div>
            )}
          </div>
          
          {/* Important IDs section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Vector Store ID */}
            {vectorStoreId && (
              <div className="p-6 glass-card rounded-xl h-full">
                <h3 className="card-header">
                  Vector Store ID
                </h3>
                <div className="flex items-center gap-2 bg-card-bg px-4 py-3 rounded-lg border border-card-border max-w-full overflow-hidden">
                  <code className="text-sm text-primary overflow-hidden text-ellipsis whitespace-nowrap flex-grow">
                    {vectorStoreId}
                  </code>
                  <button 
                    className={`p-2 rounded-full hover:bg-card-hover-border transition-colors ${copySuccess ? 'text-success' : 'text-muted'}`}
                    onClick={() => copyToClipboard(vectorStoreId)}
                    title="Copy ID"
                  >
                    <FaCopy size={16} />
                  </button>
                </div>
                <p className="text-xs text-muted mt-3">
                  This identifier is needed to integrate RAG functionality into your chatbot.
                </p>
              </div>
            )}
            
            {/* Assistant ID */}
            {assistantId && (
              <div className="p-6 glass-card rounded-xl h-full">
                <h3 className="card-header">
                  Assistant ID
                </h3>
                <div className="flex items-center gap-2 bg-card-bg px-4 py-3 rounded-lg border border-card-border max-w-full overflow-hidden">
                  <code className="text-sm text-primary overflow-hidden text-ellipsis whitespace-nowrap flex-grow">
                    {assistantId}
                  </code>
                  <button 
                    className={`p-2 rounded-full hover:bg-card-hover-border transition-colors ${copySuccess ? 'text-success' : 'text-muted'}`}
                    onClick={() => copyToClipboard(assistantId)}
                    title="Copy ID"
                  >
                    <FaCopy size={16} />
                  </button>
                </div>
                <p className="text-xs text-muted mt-3">
                  Use this identifier to connect your application to the AI chat service.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Vector Store Files Section */}
        <div className="p-8 glass-card rounded-xl mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="card-header text-xl mb-0">
              Reference Documents
            </h2>
            <button 
              onClick={fetchVectorFiles}
              className="p-2 rounded-full hover:bg-card-hover-border transition duration-300"
              disabled={loadingFiles}
              title="Refresh list"
            >
              <FaSync className={`text-primary ${loadingFiles ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="mb-6 p-5 rounded-xl bg-card-bg border border-card-border">
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-3">
              <div className="flex-grow w-full">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold file:cursor-pointer
                    file:bg-gradient-to-r file:from-primary file:to-secondary file:text-white
                    hover:file:from-[var(--button-hover-from)] hover:file:to-[var(--button-hover-to)]
                    cursor-pointer"
                  accept=".txt,.md,.pdf,.csv,.json,.html,.htm"
                  ref={fileInputRef}
                />
              </div>
              <button
                onClick={handleFileUpload}
                disabled={!selectedFile || isUploading}
                className="btn-gradient px-5 py-2 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <FaUpload />
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            <p className="text-xs text-muted">Supported formats: .txt, .md, .pdf, .csv, .json, .html</p>
            <p className="text-xs text-muted mt-1">These documents feed your AI assistant's knowledge base.</p>
          </div>

          {loadingFiles ? (
            <div className="flex justify-center items-center p-8">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : vectorFiles.length > 0 ? (
            <div className="overflow-hidden rounded-xl bg-card-bg border border-card-border">
              <table className="table-modern min-w-full">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th className="text-center">Size</th>
                    <th className="text-center">Date</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vectorFiles.map((file, index) => (
                    <tr 
                      key={file.id} 
                      className={index !== vectorFiles.length-1 ? 'border-b border-card-border' : ''}
                    >
                      <td>
                        <div className="flex items-center gap-2">
                          <FaFileAlt className="text-primary" />
                          {file.filename}
                        </div>
                      </td>
                      <td className="text-center">{formatFileSize(file.size)}</td>
                      <td className="text-center">
                        {new Date(file.created_at).toLocaleDateString()}
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-2 rounded-full hover:bg-red-500/20 text-error transition"
                          title="Delete"
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
            <div className="text-center p-8 rounded-xl bg-card-bg border border-card-border">
              <p className="text-muted">No files have been added to the knowledge base yet.</p>
              <p className="text-sm text-muted mt-2">Upload documents to enhance your assistant's capabilities.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for changing AI model */}
      {isModelChangeOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="glass-card p-8 rounded-xl w-96 border border-card-border animate-fadeIn">
            <h2 className="card-header text-2xl mb-6">Change AI Model</h2>
            <div className="mb-6">
              <label className="form-label mb-2">Select Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="input-field"
              >
                <option value="">Select a model...</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
              <p className="text-xs text-muted mt-2">
                Different models have different capabilities and pricing. Choose the one that best fits your needs.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModelChangeOpen(false)}
                className="btn-ghost px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={updateModel}
                disabled={!selectedModel || isUpdating}
                className="btn-gradient px-4 py-2"
              >
                {isUpdating ? 'Updating...' : 'Update Model'}
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
