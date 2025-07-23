"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Toast from '../../../components/Toast';
import ApiKeyRegenerate from '../../../components/ApiKeyRegenerate';
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
}

interface AssistantInfo {
  id: string;
  model: string;
  instructions: string;
  name?: string;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [editedInstructions, setEditedInstructions] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  
  // States for assistant
  const [assistantInfo, setAssistantInfo] = useState<AssistantInfo | null>(null);
  
  // States for edge function
  const [edgeFunctionUrl, setEdgeFunctionUrl] = useState<string | null>(null);
  const [urlVisible, setUrlVisible] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  
  // States for project URL editing
  const [editedProjectUrl, setEditedProjectUrl] = useState('');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [isUpdatingUrl, setIsUpdatingUrl] = useState(false);
  
  // States for Vector Store
  const [vectorFiles, setVectorFiles] = useState<VectorFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fetchVectorFiles = useCallback(async () => {
    try {
      setLoadingFiles(true);
      const response = await fetch(`/api/public/vector-store/files?project_id=${id}`);
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
        
        const response = await fetch(`/api/public/fetch/project?project_id=${id}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        
        setProject(data.project);
        setAssistantInfo(data.assistant || null);
        setEditedInstructions(data.assistant?.instructions || '');
        setEditedProjectUrl(data.project?.project_url || '');
        
        // Construire l'URL de la fonction edge
        if (data.edgeFunctionSlug) {
          const url = `${process.env.NEXT_PUBLIC_SUPABASE_FUNCTION_URL}${data.edgeFunctionSlug}`;
          setEdgeFunctionUrl(url);
        }
        
      } catch (error) {
        console.error('Error fetching project:', error);
        setToast({ message: error instanceof Error ? error.message : 'Failed to fetch project data', type: 'error' });
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
      return () => clearTimeout(timer);
    }  }, [toast]);

  const handleSaveInstructions = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch('/api/public/assistants/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: id, instructions: editedInstructions })
      });
        if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      if (assistantInfo) {
        setAssistantInfo({ ...assistantInfo, instructions: editedInstructions });
      }
      setIsEditing(false);
      setToast({ message: 'Instructions updated successfully', type: 'success' });
      
    } catch (error) {
      console.error('Error updating instructions:', error);
      setToast({ message: error instanceof Error ? error.message : 'Failed to update instructions', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedInstructions(assistantInfo?.instructions || '');
    setIsEditing(false);
  };

  const handleSaveProjectUrl = async () => {
    if (isUpdatingUrl) return;
    
    // Validate URL format - allow "*" for development mode
    if (editedProjectUrl.trim() && editedProjectUrl.trim() !== "*") {
      try {
        new URL(editedProjectUrl.trim());
      } catch {
        setToast({ message: 'Please enter a valid URL (e.g., https://example.com) or "*" for development mode', type: 'error' });
        return;
      }
    }
    
    // If empty, default to development mode
    const urlToSave = editedProjectUrl.trim() || "*";
    
    setIsUpdatingUrl(true);
    try {
      const response = await fetch('/api/public/projects/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          project_id: id, 
          project_url: urlToSave
        })
      });
        if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const data = await response.json();
      if (project) {
        setProject({ ...project, project_url: urlToSave });
      }
      setIsEditingUrl(false);
      setToast({ message: data.message || 'Project mode updated successfully', type: 'success' });
      
    } catch (error) {
      console.error('Error updating project URL:', error);
      setToast({ message: error instanceof Error ? error.message : 'Failed to update project mode', type: 'error' });
    } finally {
      setIsUpdatingUrl(false);
    }
  };

  const handleCancelUrlEdit = () => {
    setEditedProjectUrl(project?.project_url || '');
    setIsEditingUrl(false);
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
      
      const response = await fetch('/api/public/vector-store/upload', {
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
      const response = await fetch(`/api/public/vector-store/delete?project_id=${id}&file_id=${fileId}`, {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
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
          onClick={() => router.back()} 
          className="mb-4 sm:mb-6 px-4 py-2 sm:px-6 sm:py-2 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-[var(--button-hover-from)] hover:to-[var(--button-hover-to)] text-white shadow-lg hover:shadow-primary/20 transition duration-300 flex items-center gap-2 transform hover:translate-x-1 text-sm sm:text-base"
        >
          &larr; <span>Back</span>
        </button>
        
        {/* Project Details Card */}
        <div className="mb-4 sm:mb-8 p-3 sm:p-8 glass-card rounded-xl">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold card-header m-0 break-words">
              {project.project_name}
            </h1>
            <div className="flex flex-col sm:flex-row gap-2 self-start sm:self-auto">
              <div className={`status-badge ${project.working ? 'status-active' : 'status-inactive'}`}>
                {project.working ? 'Active' : 'Inactive'}
              </div>
              <div className={`status-badge ${project.project_url === "*" ? 'status-development' : 'status-production'}`}>
                {project.project_url === "*" ? 'Development' : 'Production'}
              </div>
            </div>
          </div>
          
          {/* Project info section */}
          <div className="p-3 sm:p-6 glass-card rounded-xl mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4">
              <h3 className="card-header text-lg sm:text-xl mb-0">Project Details</h3>
              {isEditingUrl && (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button 
                    onClick={handleSaveProjectUrl}
                    disabled={isUpdatingUrl}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-3 py-2 sm:px-4 sm:py-2 rounded-full text-white text-sm transition duration-300 inline-flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {isUpdatingUrl ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={handleCancelUrlEdit}
                    className="btn-ghost px-3 py-2 sm:px-4 sm:py-2 border border-card-border text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 inline" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {project.creation_timestamp && (
                <div>
                  <span className="text-sm font-semibold text-muted block mb-1">Creation Date</span>
                  <span className="text-sm sm:text-base">{format(new Date(project.creation_timestamp), 'MM/dd/yyyy')}</span>
                </div>
              )}
              <div>
                <div 
                  className={`cursor-pointer p-2 rounded-lg transition-colors ${!isEditingUrl ? 'hover:bg-card-hover border border-transparent hover:border-card-border' : ''}`}
                  onClick={() => !isEditingUrl && setIsEditingUrl(true)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted block mb-1">Environment Mode</span>
                    {!isEditingUrl && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    )}
                  </div>
                  {isEditingUrl ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-card-border hover:bg-card-hover transition-colors">
                          <input
                            type="radio"
                            name="mode"
                            value="*"
                            checked={editedProjectUrl === "*"}
                            onChange={(e) => setEditedProjectUrl(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">Development</div>
                            <div className="text-xs text-muted">Accepts requests from any origin (*)</div>
                          </div>
                          <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-600">DEV</span>
                        </label>
                        <label className="flex items-start gap-2 cursor-pointer p-3 rounded-lg border border-card-border hover:bg-card-hover transition-colors">
                          <input
                            type="radio"
                            name="mode"
                            value="custom"
                            checked={editedProjectUrl !== "*"}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditedProjectUrl(project?.project_url === "*" ? "" : project?.project_url || "");
                              }
                            }}
                            className="text-primary focus:ring-primary mt-0.5"
                          />
                          <div className="flex-1 space-y-2">
                            <div>
                              <div className="font-medium text-sm">Production</div>
                              <div className="text-xs text-muted">Specify your domain for CORS security</div>
                            </div>
                            {editedProjectUrl !== "*" && (
                              <input
                                type="url"
                                value={editedProjectUrl}
                                onChange={(e) => setEditedProjectUrl(e.target.value)}
                                className="input-field w-full text-sm"
                                placeholder="https://yourdomain.com"
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                          </div>
                          <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-600">PROD</span>
                        </label>
                      </div>
                      <p className="text-xs text-muted bg-blue-50 dark:bg-blue-900/20 p-2 rounded border-l-4 border-blue-500">
                        💡 <strong>Development Mode:</strong> Perfect for testing. Your API accepts requests from any domain.<br/>
                        🔒 <strong>Production Mode:</strong> Secure your API by only allowing requests from your specified domain.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {project.project_url === "*" ? (
                          <>
                            <span className="px-3 py-1 rounded-full text-sm bg-yellow-500/20 text-yellow-600 font-medium">Development</span>
                            <span className="text-sm text-muted">Accepts requests from all origins (*)</span>
                          </>
                        ) : (
                          <>
                            <span className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-600 font-medium">Production</span>
                            <span className="text-sm text-muted">URL :</span>
                            <a 
                              href={project.project_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-primary underline hover:text-primary-light break-all transition-colors text-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {project.project_url}
                            </a>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted">
                        {project.project_url === "*" 
                          ? "Your API accepts requests from any domain. Click to switch to production mode."
                          : "Your API only accepts requests from the specified domain for enhanced security."
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Instructions section */}
          <div className="p-3 sm:p-6 glass-card rounded-xl">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4">
              <h3 className="card-header mb-0 text-lg sm:text-xl">
                Assistant Instructions
              </h3>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
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
                    onClick={handleSaveInstructions}
                    disabled={isUpdating}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-3 py-2 sm:px-4 sm:py-2 rounded-full text-white text-sm transition duration-300 inline-flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {isUpdating ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="btn-ghost px-3 py-2 sm:px-4 sm:py-2 border border-card-border text-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 inline" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Cancel
                  </button>
                </div>
              )}
            </div>
            
            {isEditing ? (
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
        </div>
        
        {/* Credentials Section */}
        <div className="mb-4 sm:mb-8 p-3 sm:p-8 glass-card rounded-xl">
          <h2 className="card-header mb-4 sm:mb-6 text-lg sm:text-xl">
            Credentials
          </h2>
          
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
            <div>
              <label className="text-sm font-semibold text-muted block mb-2">
                API Key
              </label>
              <div className="p-3 rounded-lg bg-card-bg border border-card-border font-mono text-xs sm:text-sm overflow-hidden">
                <span className="block truncate">••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••</span>
              </div>
              <div className="mt-4">
                <ApiKeyRegenerate 
                  projectId={id as string}
                  onKeyRegenerated={() => {
                    setToast({ message: 'API key regenerated successfully', type: 'success' });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Vector Store Files Section */}
        <div className="mb-4 sm:mb-8 p-3 sm:p-8 glass-card rounded-xl">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="card-header mb-0 text-lg sm:text-xl">
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
                className="btn-gradient px-4 py-2 sm:px-5 sm:py-2 flex items-center gap-2 justify-center text-sm sm:text-base"
              >
                <FaUpload className="text-xs sm:text-sm" />
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            <p className="text-xs text-muted">Supported formats: .txt, .md, .pdf, .csv, .json, .html</p>
            <p className="text-xs text-muted mt-1">These documents feed your AI assistant&aposs knowledge base.</p>
          </div>

          {loadingFiles ? (
            <div className="flex justify-center items-center p-6 sm:p-8">
              <div className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : vectorFiles.length > 0 ? (
            <div className="overflow-hidden rounded-xl bg-card-bg border border-card-border">
              {/* Mobile-first responsive table */}
              <div className="hidden sm:block">
                <table className="table-modern min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left">File Name</th>
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

              {/* Mobile card layout */}
              <div className="sm:hidden space-y-3 p-3">
                {vectorFiles.map((file) => (
                  <div key={file.id} className="bg-white/50 rounded-lg p-3 border border-card-border">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <FaFileAlt className="text-primary flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm break-all">{file.filename}</p>
                          <div className="flex flex-col gap-1 mt-1 text-xs text-muted">
                            <span>{formatFileSize(file.size)}</span>
                            <span>{new Date(file.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-2 rounded-full hover:bg-red-500/20 text-error transition flex-shrink-0"
                        title="Delete"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center p-6 sm:p-8 rounded-xl bg-card-bg border border-card-border">
              <p className="text-muted text-sm sm:text-base">No files have been added to the knowledge base yet.</p>
              <p className="text-xs sm:text-sm text-muted mt-2">
                Upload documents to enhance your assistant&apos;s capabilities.
              </p>
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
