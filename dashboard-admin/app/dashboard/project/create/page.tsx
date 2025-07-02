"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '@/app/components/Toast';
import { useSubscription } from '@/lib/subscription-context';
import ProjectCreationWizard from '@/app/components/ProjectCreationWizard';

export default function CreateProject() {
  const router = useRouter();
  const { hasClassicPlan, isLoading: isCheckingPlan } = useSubscription();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

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
                message: 'You already have a project. The Classic plan allows only one project.',
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

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-primary hover:underline mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back
          </button>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create a New Project
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Create your project and get your secure API key. This key will only be displayed once for security.
            </p>
          </div>
        </div>

        <ProjectCreationWizard />

        <div className="mt-12 text-center">
          <div className="glass-card rounded-xl p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Important Information
            </h3>
            <ul className="text-left text-gray-700 space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <span>Your API key will be automatically generated after project creation.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <span>It will only be displayed once for security reasons.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <span>Make sure to copy and store it in a safe place, if you lose it, contact support to get a new key..</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                <span>During development, you can use "*" as a URL wildcard; remember to replace it with your real production URL before going live.</span>
              </li>
            </ul>
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
