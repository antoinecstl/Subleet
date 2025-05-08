"use client"

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
  onClose: () => void;
}

export default function Toast({ message, type, visible, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  return (
    <div
      className={`fixed bottom-6 right-6 max-w-md transition-all duration-300 transform z-50
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
    >
      <div 
        className={`rounded-lg shadow-lg p-4 flex items-center glass-card
          ${type === 'success' 
            ? 'bg-success/10 border-success/30' 
            : 'bg-error/10 border-error/30'}`}
      >
        <div 
          className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center
            ${type === 'success' 
              ? 'bg-success/20 text-success' 
              : 'bg-error/20 text-error'}`}
        >
          {type === 'success' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3 flex-grow">
          <p className={`text-sm ${type === 'success' ? 'text-success-light' : 'text-error-light'}`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`ml-4 flex-shrink-0 text-sm hover:bg-card-hover-border rounded-full p-1 transition-colors
            ${type === 'success' ? 'text-success-light hover:text-success' : 'text-error-light hover:text-error'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}