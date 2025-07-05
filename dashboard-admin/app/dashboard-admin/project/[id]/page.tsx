"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import Toast from '../../../components/Toast';
import AdminApiKeyRegenerate from '../../../components/AdminApiKeyRegenerate';
import { FaTrash, FaUpload, FaFileAlt, FaSync, FaCopy, FaEye, FaEyeSlash } from 'react-icons/fa';

interface VectorFile {
  id: string;
  filename: string;
  size: number;
  created_at: string;
  purpose: string;
}

interface Project {
  project_id: number;
  project_name: string;
  working: boolean;
  creation_timestamp?: string;
  project_url?: string;
  project_owner: number;
}

interface ClientInfo {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface AssistantInfo {
  id: string;
  model: string;
  instructions: string;
  name?: string;
}

export default function AdminProjectDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // States for assistant
  const [assistantInfo, setAssistantInfo] = useState<AssistantInfo | null>(null);
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
  
  // States for identifiers
  const [vectorStoreId, setVectorStoreId] = useState<string | null>(null);
  const [assistantId, setAssistantId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  // States for edge function URL
  const [edgeFunctionUrl, setEdgeFunctionUrl] = useState<string | null>(null);
  const [urlVisible, setUrlVisible] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchVectorFiles = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
        const res = await fetch(`/api/admin/fetch/project?project_id=${id}`);
        const data = await res.json();
        
        if (data.error) {
          throw new Error(data.error);
        } else {
          setProject(data.project);
          setClientInfo(data.clientInfo);
          setAssistantInfo(data.assistant || null);
          setEditedInstructions(data.assistant?.instructions || '');
          setVectorStoreId(data.vectorStoreId || null);
          setAssistantId(data.assistantId || null);
          setApiKey(data.apiKey || null);
          
          // Construire l'URL de la fonction edge
          if (data.edgeFunctionSlug) {
            const url = `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}${data.edgeFunctionSlug}`;
            setEdgeFunctionUrl(url);
          }
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
  }, [project, fetchVectorFiles]);

  useEffect(() => {
    if (toast) {
      setToastVisible(true);
      const timer = setTimeout(() => {
        setToastVisible(false);
        setTimeout(() => setToast(null), 500);
      }, 3000);
      return () => clearTimeout(timer);    }  }, [toast]);
  
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
      
      // Also invalidate the client cache since project status changed
      localStorage.removeItem(`cache_client_${project.project_owner}`);
      
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'Failed to update project status', type: 'error' });
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
    if (!assistantId || isUpdating || !project) return;
    
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
      
      if (assistantInfo) {
        setAssistantInfo({
          ...assistantInfo,
          instructions: data.assistant.instructions
        });
      }
      setToast({ message: 'Assistant instructions updated successfully', type: 'success' });
      setIsEditingInstructions(false);
      
      // Also invalidate the client cache since instructions changed
      localStorage.removeItem(`cache_client_${project.project_owner}`);
      localStorage.removeItem(`cache_project_${id}`);
      
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'Failed to update instructions', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };
  const updateModel = async () => {
    if (!assistantId || isUpdating || !selectedModel || !project) return;
    
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
      
      if (assistantInfo) {
        setAssistantInfo({
          ...assistantInfo,
          model: data.assistant.model
        });
      }
      setToast({ message: 'Assistant model updated successfully', type: 'success' });
      setIsModelChangeOpen(false);
      
      // Also invalidate the client cache since model changed
      localStorage.removeItem(`cache_client_${project.project_owner}`);
      localStorage.removeItem(`cache_project_${id}`);
      
    } catch (err: unknown) {
      setToast({ message: err instanceof Error ? err.message : 'Failed to update model', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleUrl = () => {
    setUrlVisible(!urlVisible);
  };

  const handleCopyUrl = async () => {
    if (edgeFunctionUrl) {
      try {
        await navigator.clipboard.writeText(edgeFunctionUrl);
        setUrlCopied(true);
        setToast({ message: 'URL copied to clipboard!', type: 'success' });
        setTimeout(() => setUrlCopied(false), 2000);
      } catch {
        setToast({ message: 'Failed to copy URL', type: 'error' });
      }
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Fonction de callback après régénération de clé API
  const handleApiKeyRegenerated = () => {
    setToast({ message: 'API key regenerated successfully!', type: 'success' });
    
    // Invalider le cache pour forcer le rechargement des données
    localStorage.removeItem(`cache_client_${project?.project_owner}`);
    localStorage.removeItem(`cache_project_${id}`);
    
    // Recharger les données du projet
    setTimeout(() => {
      window.location.reload();
    }, 1500);
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
      <div className="min-h-screen p-3 sm:p-6">
        <button 
          onClick={() => router.back()} 
          className="btn-gradient px-4 py-2 sm:px-6 sm:py-2 mb-4 sm:mb-6 text-sm sm:text-base"
        >
          &larr; Back
        </button>
        <div className="alert alert-error text-sm sm:text-base">Project not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-32 h-32 sm:w-64 sm:h-64 rounded-full bg-primary opacity-5 blur-3xl"></div>
      <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-40 h-40 sm:w-80 sm:h-80 rounded-full bg-secondary opacity-5 blur-3xl"></div>
      
      <div className="relative z-10 content-container">
        <button 
          onClick={() => router.push(`/dashboard-admin/client/${project.project_owner}`)} 
          className="mb-4 sm:mb-6 px-4 py-2 sm:px-6 sm:py-2 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-[var(--button-hover-from)] hover:to-[var(--button-hover-to)] text-white shadow-lg hover:shadow-primary/20 transition duration-300 flex items-center gap-2 transform hover:translate-x-1 text-sm sm:text-base"
        >
          &larr; <span>Back to Client</span>
        </button>
        
        {/* Project Details Card */}
        <div className="mb-4 sm:mb-8 p-3 sm:p-8 glass-card rounded-xl">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold card-header m-0 break-words">{project.project_name}</h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className={`status-badge ${project.working ? 'status-active' : 'status-inactive'} self-start sm:self-auto`}>
                {project.working ? 'Active' : 'Inactive'}
              </div>
              <button 
                onClick={toggleProjectStatus}
                disabled={isUpdating}
                className={`${project.working ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-primary to-secondary hover:from-[var(--button-hover-from)] hover:to-[var(--button-hover-to)]'} px-3 py-2 sm:px-4 sm:py-2 rounded-full text-white flex items-center gap-2 transition duration-300 w-full sm:w-auto justify-center text-sm sm:text-base`}
              >
                {isUpdating ? (
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                ) : null}
                {project.working ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
          
          {clientInfo && (
            <div className="p-3 sm:p-6 glass-card rounded-xl mb-4 sm:mb-6">
              <h3 className="card-header text-lg sm:text-xl">Client Information</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-semibold text-muted block mb-1">Client Name</span>
                    <span className="break-words text-sm sm:text-base">{clientInfo.name}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-muted block mb-1">Client Email</span>
                    <span className="break-all text-sm sm:text-base">{clientInfo.email}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {clientInfo.phone && (
                    <div>
                      <span className="text-sm font-semibold text-muted block mb-1">Phone</span>
                      <span className="break-words text-sm sm:text-base">{clientInfo.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Project details section */}
          <div className="p-3 sm:p-6 glass-card rounded-xl mb-4 sm:mb-6">
            <h3 className="card-header text-lg sm:text-xl">Project Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold text-muted block mb-1">Project ID</span>                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-mono bg-card-bg px-2 py-1 rounded break-all">{project.project_id}</span>
                    <button 
                      onClick={() => copyToClipboard(project.project_id.toString())}
                      className={`p-1.5 rounded-full hover:bg-card-hover-border transition-colors flex-shrink-0 ${copySuccess ? 'text-success' : 'text-muted'}`}
                    >
                      <FaCopy size={14} />
                    </button>
                  </div>
                </div>
                {project.creation_timestamp && (
                  <div>
                    <span className="text-sm font-semibold text-muted block mb-1">Creation Date</span>
                    <span className="text-sm sm:text-base">{format(new Date(project.creation_timestamp), 'MM/dd/yyyy')}</span>
                  </div>
                )}
                <div>
                  <span className="text-sm font-semibold text-muted block mb-1">Project URL</span>
                  {project.project_url ? (
                    <a 
                      href={project.project_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-primary underline hover:text-primary-light break-all transition-colors text-sm sm:text-base"
                    >
                      {project.project_url}
                    </a>
                  ) : (
                    <span className="text-muted text-sm sm:text-base">No URL provided</span>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-semibold text-muted block mb-1">Status</span>
                  <span className={`status-badge ${project.working ? 'status-active' : 'status-inactive'}`}>
                    {project.working ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {assistantInfo?.model && (
                  <div>
                    <span className="text-sm font-semibold text-muted block mb-1">AI Model</span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <span className="break-words text-sm sm:text-base">{assistantInfo.model}</span>
                      <button 
                        onClick={() => setIsModelChangeOpen(true)}
                        className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 btn-outline rounded-full self-start sm:self-auto"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Instructions section */}
          <div className="p-3 sm:p-6 glass-card rounded-xl mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4">
              <h3 className="card-header mb-0 text-lg sm:text-xl">
                Assistant Instructions
              </h3>
              {!isEditingInstructions ? (
                <button 
                  onClick={startEditingInstructions}
                  className="btn-gradient px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base self-start sm:self-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 inline" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Edit
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button 
                    onClick={saveInstructionsChanges}
                    disabled={isUpdating}
                    className="btn-gradient px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base flex items-center justify-center"
                  >
                    {isUpdating ? (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1 sm:mr-2"></div>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 inline" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    Save
                  </button>
                  <button 
                    onClick={cancelEditingInstructions}
                    className="btn-ghost px-3 py-2 sm:px-4 sm:py-2 border border-card-border text-sm sm:text-base"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 inline" viewBox="0 0 20 20" fill="currentColor">
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
                  className="input-field min-h-[200px] sm:min-h-[250px] resize-vertical"
                  placeholder="Enter instructions for the AI assistant..."
                />
              </div>
            ) : (
              <div>
                <div className="p-3 sm:p-5 rounded-xl bg-card-bg border border-card-border min-h-[150px] sm:min-h-[200px] max-h-[300px] sm:max-h-[400px] overflow-auto">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">{assistantInfo?.instructions || 'No instructions provided for this assistant.'}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Important IDs section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Vector Store ID */}
            {vectorStoreId && (
              <div className="p-3 sm:p-6 glass-card rounded-xl h-full">
                <h3 className="card-header text-lg sm:text-xl">
                  Vector Store ID
                </h3>
                <div className="flex items-center gap-2 bg-card-bg px-3 sm:px-4 py-3 rounded-lg border border-card-border max-w-full overflow-hidden">
                  <code className="text-xs sm:text-sm text-primary overflow-hidden text-ellipsis whitespace-nowrap flex-grow font-mono">
                    {vectorStoreId}
                  </code>
                  <button 
                    className={`p-1.5 sm:p-2 rounded-full hover:bg-card-hover-border transition-colors flex-shrink-0 ${copySuccess ? 'text-success' : 'text-muted'}`}
                    onClick={() => copyToClipboard(vectorStoreId)}
                    title="Copy ID"
                  >
                    <FaCopy size={14} />
                  </button>
                </div>
              </div>
            )}
            
            {/* Assistant ID */}
            {assistantId && (
              <div className="p-3 sm:p-6 glass-card rounded-xl h-full">
                <h3 className="card-header text-lg sm:text-xl">
                  Assistant ID
                </h3>
                <div className="flex items-center gap-2 bg-card-bg px-3 sm:px-4 py-3 rounded-lg border border-card-border max-w-full overflow-hidden">
                  <code className="text-xs sm:text-sm text-primary overflow-hidden text-ellipsis whitespace-nowrap flex-grow font-mono">
                    {assistantId}
                  </code>
                  <button 
                    className={`p-1.5 sm:p-2 rounded-full hover:bg-card-hover-border transition-colors flex-shrink-0 ${copySuccess ? 'text-success' : 'text-muted'}`}
                    onClick={() => copyToClipboard(assistantId)}
                    title="Copy ID"
                  >
                    <FaCopy size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Credentials Section */}
          <div className="p-3 sm:p-6 glass-card rounded-xl mb-4 sm:mb-6">
            <h3 className="card-header text-lg sm:text-xl mb-4 sm:mb-6">
              Credentials
            </h3>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Edge Function URL */}
              <div>
                <label className="text-sm font-semibold text-muted block mb-2">
                  Edge Function URL
                </label>
                <div className="p-3 rounded-lg bg-card-bg border border-card-border">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 font-mono text-xs sm:text-sm break-all min-w-0">
                      {edgeFunctionUrl ? (
                        urlVisible ? (
                          edgeFunctionUrl
                        ) : (
                          <div className="overflow-hidden">
                            <span className="block truncate">••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••</span>
                          </div>
                        )
                      ) : (
                        'N/A'
                      )}
                    </div>
                    {edgeFunctionUrl && (
                      <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                        <button
                          onClick={handleToggleUrl}
                          className="p-1.5 sm:p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition duration-200"
                          title={urlVisible ? "Hide URL" : "Show URL"}
                        >
                          {urlVisible ? <FaEyeSlash className="text-xs sm:text-sm" /> : <FaEye className="text-xs sm:text-sm" />}
                        </button>
                        {urlVisible && (
                          <button
                            onClick={handleCopyUrl}
                            className={`p-1.5 sm:p-2 rounded-lg transition duration-200 ${
                              urlCopied 
                                ? 'bg-green-500/10 text-green-500' 
                                : 'bg-primary/10 hover:bg-primary/20 text-primary'
                            }`}
                            title={urlCopied ? 'Copied!' : 'Copy URL'}
                          >
                            <FaCopy className="text-xs sm:text-sm" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* API Key */}
              {apiKey && (
                <div>
                  <label className="text-sm font-semibold text-muted block mb-2">
                    API Key
                  </label>
                  <div className="flex items-center gap-2 bg-card-bg px-3 sm:px-4 py-3 rounded-lg border border-card-border max-w-full overflow-hidden">
                    <code className="text-xs sm:text-sm text-primary overflow-hidden text-ellipsis whitespace-nowrap flex-grow font-mono">
                      {apiKey}
                    </code>
                    <button 
                      className={`p-1.5 sm:p-2 rounded-full hover:bg-card-hover-border transition-colors ${copySuccess ? 'text-success' : 'text-muted'}`}
                      onClick={() => copyToClipboard(apiKey)}
                      title="Copy API Key"
                    >
                      <FaCopy size={14} />
                    </button>
                  </div>
                  <div className="mt-4">
                    <AdminApiKeyRegenerate 
                      projectId={id as string}
                      onKeyRegenerated={handleApiKeyRegenerated}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Vector Store Files Section */}
        <div className="p-3 sm:p-8 glass-card rounded-xl mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="card-header text-lg sm:text-xl mb-0">
              Reference Documents
            </h2>
            <button 
              onClick={fetchVectorFiles}
              className="p-2 rounded-full hover:bg-card-hover-border transition duration-300 self-start sm:self-auto"
              disabled={loadingFiles}
              title="Refresh list"
            >
              <FaSync className={`text-primary ${loadingFiles ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="mb-4 sm:mb-6 p-3 sm:p-5 rounded-xl bg-card-bg border border-card-border">
            <div className="flex flex-col gap-3 sm:gap-4 mb-3">
              <div className="w-full">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-xs sm:text-sm file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-3 sm:file:px-4
                    file:rounded-full file:border-0
                    file:text-xs sm:file:text-sm file:font-semibold file:cursor-pointer
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
                className="btn-gradient px-3 py-2 sm:px-5 sm:py-2 flex items-center gap-2 justify-center text-sm sm:text-base"
              >
                <FaUpload />
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            <p className="text-xs text-muted">Supported formats: .txt, .md, .pdf, .csv, .json, .html</p>
          </div>

          {loadingFiles ? (
            <div className="flex justify-center items-center p-8">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : vectorFiles.length > 0 ? (
            <div className="overflow-hidden rounded-xl bg-card-bg border border-card-border">
              {/* Table view for larger screens */}
              <div className="hidden sm:block">
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
                            <FaFileAlt className="text-primary flex-shrink-0" />
                            <span className="break-all">{file.filename}</span>
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
              
              {/* Card view for mobile */}
              <div className="block sm:hidden">
                <div className="space-y-3 p-4">
                  {vectorFiles.map((file) => (
                    <div key={file.id} className="p-4 bg-card-bg border border-card-border rounded-lg">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <FaFileAlt className="text-primary flex-shrink-0" />
                            <span className="text-sm font-medium break-all">{file.filename}</span>
                          </div>
                          <div className="text-xs text-muted space-y-1">
                            <div>Size: {formatFileSize(file.size)}</div>
                            <div>Date: {new Date(file.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-2 rounded-full hover:bg-red-500/20 text-error transition flex-shrink-0"
                          title="Delete"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-6 sm:p-8 rounded-xl bg-card-bg border border-card-border">
              <p className="text-muted">No files have been added to the knowledge base yet.</p>
              <p className="text-sm text-muted mt-2">Upload documents to enhance your assistant&apos;s capabilities.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for changing AI model */}
      {isModelChangeOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50 p-3 sm:p-4">
          <div className="glass-card p-4 sm:p-8 rounded-xl w-full max-w-md border border-card-border animate-fadeIn">
            <h2 className="card-header text-lg sm:text-2xl mb-4 sm:mb-6">Change AI Model</h2>
            <div className="mb-4 sm:mb-6">
              <label className="form-label mb-2 text-sm sm:text-base">Select Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="input-field text-sm sm:text-base"
              >
                <option value="">Select a model...</option>
                <option value="gpt-4o">GPT-4o</option>
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setIsModelChangeOpen(false)}
                className="btn-ghost px-3 py-2 sm:px-4 sm:py-2 order-2 sm:order-1 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={updateModel}
                disabled={!selectedModel || isUpdating}
                className="btn-gradient px-3 py-2 sm:px-4 sm:py-2 order-1 sm:order-2 text-sm sm:text-base"
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
