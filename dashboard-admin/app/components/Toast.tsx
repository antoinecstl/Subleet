"use client";

import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, visible, onClose }) => {
  return (
    <div 
      className={`
        fixed bottom-4 right-4 z-50 
        p-4 rounded-lg shadow-lg 
        ${type === 'success' ? 'bg-green-500' : 'bg-red-500'} 
        text-white flex items-center justify-between
        transform transition-all duration-300 ease-in-out
        ${visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
      `}
    >
      <span className="mr-4">{message}</span>
      <button 
        onClick={onClose}
        className="text-white hover:text-gray-200 focus:outline-none"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;