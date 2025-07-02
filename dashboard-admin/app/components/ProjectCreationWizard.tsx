'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ApiKeyDisplay from './ApiKeyDisplay';

interface ProjectCreationResult {
  success: boolean;
  project: {
    project_id: string;
    project_name: string;
  };
  api_key: string;
  message: string;
}

export default function ProjectCreationWizard() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'created' | 'api-key'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeyViewed, setApiKeyViewed] = useState(false);
  const [projectData, setProjectData] = useState({
    name: '',
    url: '',
  });
  const [createdProject, setCreatedProject] = useState<ProjectCreationResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/public/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (data.success) {
        setCreatedProject(data);
        setStep('created');
      } else {
        setError(data.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      setError('An error occurred while creating the project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueToApiKey = () => {
    setStep('api-key');
  };

  const handleFinish = () => {
    if (apiKeyViewed) {
      router.push('/dashboard');
    }
  };

  const handleApiKeyViewed = () => {
    setApiKeyViewed(true);
  };

  if (step === 'form') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Create New Project</h1>
            <p className="text-gray-600 mt-2">
              Fill in the details below to create your new project and generate its API key.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                id="name"
                type="text"
                value={projectData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setProjectData(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter project name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                Project URL
              </label>
              <input
                id="url"
                type="text"
                value={projectData.url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setProjectData(prev => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://your-project-url.com or if local, use *"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-red-600 mt-0.5">
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9 12l-9-9m0 0l-9-9m9 9l-9 9m9-9l9-9" />
                    </svg>
                  </div>
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !projectData.name || !projectData.url}
              className="w-full btn-gradient px-4 py-2 text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Project...
                </>
              ) : (
                'Create Project'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'created') {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 text-green-600">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-green-800">Project Created Successfully</h2>
          </div>
          <p className="text-green-700 mb-6">
            Your project &quot;{createdProject?.project.project_name}&quot; has been created.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <p className="text-blue-800">
              Next step: Reveal and save your API key. This is a one-time operation for security reasons.
            </p>
          </div>
          
          <button 
            onClick={handleContinueToApiKey} 
            className="w-full bg-red-700 hover:bg-red-900 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
          >
            Continue to API Key Setup
          </button>
        </div>
      </div>
    );
  }

  if (step === 'api-key' && createdProject) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <ApiKeyDisplay
          projectId={createdProject.project.project_id}
          onApiKeyViewed={handleApiKeyViewed}
        />
        
        {!apiKeyViewed && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-amber-600 mt-0.5">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-amber-800">Action Required</p>
                <p className="text-amber-700 text-sm mt-1">
                    You must first reveal and copy your API key before you can continue. This key will only be shown once.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center">
          <button 
            onClick={handleFinish}
            disabled={!apiKeyViewed}
            className={`px-6 py-2 border rounded-md font-medium transition-colors duration-200 ${
              apiKeyViewed 
                ? 'border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer' 
                : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
            }`}
          >
            {apiKeyViewed ? 'Go to Dashboard' : 'Please reveal your API key first'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
