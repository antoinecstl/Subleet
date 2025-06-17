"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '@/app/components/Toast';
import { useSubscription } from '@/lib/subscription-context';

export default function CreateProject() {
  const router = useRouter();
  const { hasClassicPlan, isLoading: isCheckingPlan } = useSubscription();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [projectData, setProjectData] = useState({
    name: '',
    url: '',
  });

  // Check if user already has projects and if they have Classic plan
  useEffect(() => {
    const checkUserProjectsAndPlan = async () => {
      try {
        // First check if user has Classic plan
        if (!isCheckingPlan && !hasClassicPlan) {
          router.push('/pricing');
          return;
        }

        // If has Classic plan, check if user already has projects
        if (!isCheckingPlan && hasClassicPlan) {
          const response = await fetch('/api/public/fetch/dashboard');
          if (response.ok) {
            const data = await response.json();
            if (data.projects && data.projects.length > 0) {
              // User already has projects, redirect to dashboard
              setToast({
                message: 'You already have a project. Classic plan allows only one project.',
                type: 'error',
              });
              setTimeout(() => router.push('/dashboard'), 2000);
              return;
            }
          }
        }
      } catch (error) {
        console.error('Error checking user projects:', error);
      }
    };

    checkUserProjectsAndPlan();
  }, [hasClassicPlan, isCheckingPlan, router]);
  
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProjectData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/public/projects/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.needsSubscription) {
          // L'utilisateur a besoin d'un abonnement
          router.push('/pricing');
          return;
        }
        
        if (response.status === 403 && data.maxProjectsReached) {
          // L'utilisateur a atteint le nombre maximum de projets
          setToast({
            message: 'You have already reached the maximum allowed projects',
            type: 'error',
          });
          setTimeout(() => router.push('/dashboard'), 3000);
          return;
        }
        
        throw new Error(data.error || 'Project creation failed');
      }
      setToast({
        message: 'Project created successfully! All resources have been configured automatically.',
        type: 'success',
      });

    // Show creation details in console for the developer
    if (data.vector_store_id) {
        console.log('Vector store created:', data.vector_store_id);
    }
    if (data.assistant_id) {
        console.log('AI assistant created:', data.assistant_id);
    }
    if (data.edge_function) {
        console.log('Edge Function deployed:', data.edge_function);
    }
    if (data.api_key) {
        console.log('API key generated for the project');
    }

      // Redirection vers la page du projet nouvellement créé
      setTimeout(() => {
        if (data.project && data.project.project_id) {
          router.push(`/dashboard/project/${data.project.project_id}`);
        } else {
          router.push('/dashboard');
        }
      }, 3000); // Temps plus long pour laisser l'utilisateur voir le message de succès
      
    } catch (error) {
      console.error('Error creating project:', error);
      setToast({
        message: error instanceof Error ? error.message : 'An error occurred while creating the project',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isCheckingPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-primary opacity-5 blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-secondary opacity-5 blur-3xl"></div>
      
      <div className="relative z-10 content-container max-w-3xl mx-auto">
        <div className="mb-8">
            <button 
                onClick={() => router.back()} 
                className="flex items-center text-primary hover:underline mb-4"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back
            </button>
            <h1 className="text-3xl font-bold mb-2">Create a New Project</h1>
            <p className="text-lg text-muted">
                Set up the basic details of your new AI project.
            </p>
        </div>
          <div className="glass-card rounded-xl p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block mb-2 font-medium">
                Project name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={projectData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md bg-transparent"
                placeholder="My Subleet AI Assistant"
                required
              />
            </div>
            
            <div className="mb-4">
                <label htmlFor="url" className="block mb-2 font-medium">
                    Website URL <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="url"
                    name="url"
                    value={projectData.url}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md bg-transparent"
                    placeholder="https://example.com"
                    required
                />
                <p className="text-sm text-muted mt-1">
                    The URL where the AI assistant will be integrated. For development environment, use <code>*</code>
                </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="btn-gradient px-6 py-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                <span className="flex items-center">
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    Creating project...
                </span>
                ) : 'Create Project'}
              </button>
            </div>
          </form>
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
