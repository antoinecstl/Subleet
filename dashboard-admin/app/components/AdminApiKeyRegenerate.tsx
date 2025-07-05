'use client';

import { useState } from 'react';
import { FaSync, FaCopy, FaEye, FaEyeSlash, FaExclamationTriangle } from 'react-icons/fa';

interface AdminApiKeyRegenerateProps {
  projectId: string;
  onKeyRegenerated?: () => void;
}

export default function AdminApiKeyRegenerate({ projectId, onKeyRegenerated }: AdminApiKeyRegenerateProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegenerateRequest = () => {
    setError(null);
    setShowConfirmation(true);
  };

  const handleConfirmRegenerate = async () => {
    setIsRegenerating(true);
    setError(null);
    setShowConfirmation(false);

    try {
      const response = await fetch('/api/admin/projects/api-key/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      });

      const data = await response.json();

      if (data.success) {
        setNewApiKey(data.api_key);
        setIsRevealed(true);
        
        if (onKeyRegenerated) {
          onKeyRegenerated();
        }

        // Avertir si l'Edge Function n'a pas pu être mise à jour
        if (!data.edge_function_updated && data.edge_function_error) {
          setError(`API key regenerated, but Edge Function update failed: ${data.edge_function_error}`);
        }
      } else {
        setError(data.error || 'Failed to regenerate API key');
      }
    } catch (error) {
      console.error('Error regenerating API key:', error);
      setError('An error occurred while regenerating the API key');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCancelRegenerate = () => {
    setShowConfirmation(false);
    setError(null);
  };

  const copyToClipboard = async () => {
    if (newApiKey) {
      try {
        await navigator.clipboard.writeText(newApiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  const toggleReveal = () => {
    setIsRevealed(!isRevealed);
  };

  const handleClose = () => {
    setNewApiKey(null);
    setIsRevealed(false);
    setError(null);
  };

  // Si une nouvelle clé a été générée, afficher le panneau de clé
  if (newApiKey) {
    return (
      <div className="glass-card rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="w-6 h-6 text-[var(--success)] flex-shrink-0">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="card-header text-lg sm:text-xl font-semibold mb-0">New API Key Generated</h3>
        </div>
        
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 sm:p-4 mb-4">
          <label className="text-sm font-semibold text-[var(--success)] block mb-2">
            New API Key
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-1 font-mono text-xs sm:text-sm break-all min-w-0 p-2 sm:p-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded">
              {isRevealed ? newApiKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
            </div>
            <div className="flex gap-1 sm:gap-2 flex-shrink-0 justify-end sm:justify-start">
              <button
                onClick={toggleReveal}
                className="p-1.5 sm:p-2 rounded-lg bg-[var(--success)]/10 hover:bg-[var(--success)]/20 text-[var(--success)] transition duration-200"
                title={isRevealed ? "Hide API Key" : "Show API Key"}
              >
                {isRevealed ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
              </button>
              {isRevealed && (
                <button
                  onClick={copyToClipboard}
                  className={`p-1.5 sm:p-2 rounded-lg transition duration-200 ${
                    copied 
                      ? 'bg-[var(--info)]/10 text-[var(--info)]' 
                      : 'bg-[var(--success)]/10 hover:bg-[var(--success)]/20 text-[var(--success)]'
                  }`}
                  title={copied ? 'Copied!' : 'Copy API Key'}
                >
                  <FaCopy className="text-sm" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[var(--warning)]/10 border border-[var(--warning)]/30 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <FaExclamationTriangle className="text-[var(--warning)] mt-0.5 flex-shrink-0 text-sm sm:text-base" />
            <div className="text-xs sm:text-sm text-[var(--warning)]">
              <p className="font-semibold mb-1">Important Security Notice:</p>
              <ul className="list-disc list-inside space-y-1 text-muted">
                <li>This API key will only be shown once</li>
                <li>Make sure to copy and store it in a secure location</li>
                <li>The old API key has been invalidated and can no longer be used</li>
                <li>The client must update any applications using the old key</li>
                <li>The Edge Function has been automatically updated with the new key</li>
              </ul>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--error)] mt-0.5 flex-shrink-0">
                <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div className="text-xs sm:text-sm text-[var(--error)]">
                <p className="font-semibold">Warning:</p>
                <p className="text-muted break-words">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="btn-gradient px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Panneau de confirmation
  if (showConfirmation) {
    return (
      <div className="glass-card rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <FaExclamationTriangle className="text-[var(--warning)] text-lg sm:text-xl flex-shrink-0" />
          <h3 className="card-header text-lg sm:text-xl font-semibold mb-0">Confirm API Key Regeneration</h3>
        </div>
        
        <div className="text-muted mb-6">
          <p className="mb-3 text-sm sm:text-base">
            <strong>Are you sure you want to regenerate this project&apos;s API key?</strong>
          </p>
          <p className="mb-2 text-sm sm:text-base font-semibold text-[var(--warning)]">
            This action will (Admin Override):
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-sm sm:text-base">
            <li>Generate a completely new API key for this project</li>
            <li>Invalidate the current API key immediately</li>
            <li>Update the project&apos;s Edge Function automatically</li>
            <li>Require the client to update any applications using the old key</li>
            <li>Be performed with admin privileges (no ownership check)</li>
          </ul>
          <p className="mt-3 font-semibold text-[var(--error)] text-sm sm:text-base">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={handleCancelRegenerate}
            className="btn-ghost px-3 py-2 sm:px-4 sm:py-2 border border-[var(--card-border)] text-sm sm:text-base order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmRegenerate}
            disabled={isRegenerating}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-[var(--error)] text-white rounded-lg hover:bg-[var(--error)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2"
          >
            {isRegenerating ? (
              <>
                <FaSync className="animate-spin text-sm" />
                Regenerating...
              </>
            ) : (
              'Regenerate API Key (Admin)'
            )}
          </button>
        </div>
      </div>
    );
  }

  // Bouton principal pour démarrer la régénération
  return (
    <div className="glass-card rounded-xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="card-header text-lg sm:text-xl font-semibold mb-2">
            Admin API Key Management
          </h3>
          <p className="text-xs sm:text-sm text-muted">
            As an admin, you can regenerate any project&apos;s API key without ownership verification.
          </p>
        </div>
        <button
          onClick={handleRegenerateRequest}
          disabled={isRegenerating}
          className="btn-gradient px-3 py-2 sm:px-4 sm:py-2 flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRegenerating ? (
            <>
              <FaSync className="animate-spin text-sm" />
              <span className="hidden sm:inline">Regenerating...</span>
              <span className="sm:hidden">Regenerating...</span>
            </>
          ) : (
            <>
              <FaSync className="text-sm" />
              <span className="hidden sm:inline">Regenerate API Key</span>
              <span className="sm:hidden">Regenerate Key</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--error)] mt-0.5 flex-shrink-0">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-xs sm:text-sm text-[var(--error)] break-words">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
