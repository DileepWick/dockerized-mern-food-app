// src/components/ui/toast.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context for toast management
const ToastContext = createContext();

// Toast types
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Remove a toast after it expires
  const removeToast = (id) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  };

  // Add a new toast
  const addToast = (message, type = TOAST_TYPES.INFO, duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = {
      id,
      message,
      type,
      duration,
    };
    
    setToasts((currentToasts) => [...currentToasts, newToast]);
    
    // Set timeout to remove the toast
    if (duration !== Infinity) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  // Toast utility functions
  const toast = {
    success: (message, duration) => addToast(message, TOAST_TYPES.SUCCESS, duration),
    error: (message, duration) => addToast(message, TOAST_TYPES.ERROR, duration),
    info: (message, duration) => addToast(message, TOAST_TYPES.INFO, duration),
    warning: (message, duration) => addToast(message, TOAST_TYPES.WARNING, duration),
    custom: addToast,
    remove: removeToast,
  };

  return (
    <ToastContext.Provider value={{ toasts, toast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

// CSS for the toast animations
const toastStyles = `
  .toast-enter {
    opacity: 0;
    transform: translateY(-10px);
  }
  
  .toast-enter-active {
    opacity: 1;
    transform: translateY(0);
    transition: opacity 300ms, transform 300ms;
  }
  
  .toast-exit {
    opacity: 1;
  }
  
  .toast-exit-active {
    opacity: 0;
    transition: opacity 300ms;
  }
`;

// Toast item component
function ToastItem({ toast }) {
  const getTypeStyles = () => {
    switch (toast.type) {
      case TOAST_TYPES.SUCCESS:
        return 'bg-green-50 border-green-200 text-green-800';
      case TOAST_TYPES.ERROR:
        return 'bg-red-50 border-red-200 text-red-800';
      case TOAST_TYPES.WARNING:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case TOAST_TYPES.INFO:
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div
      className={`rounded-md border p-4 shadow-md ${getTypeStyles()} toast-enter toast-enter-active`}
      style={{
        opacity: 1,
        transition: 'opacity 300ms, transform 300ms'
      }}
      role="alert"
    >
      <div className="flex justify-between">
        <div className="flex-1">{toast.message}</div>
        <button
          onClick={() => {
            const context = useContext(ToastContext);
            context.toast.remove(toast.id);
          }}
          className="ml-4 text-gray-500 hover:text-gray-800"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Container for all toasts
function ToastContainer() {
  const { toasts } = useContext(ToastContext);

  return (
    <>
      <style>{toastStyles}</style>
      <div className="fixed top-4 right-4 z-50 w-72 space-y-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </div>
    </>
  );
}

// Helper function to use outside of components
export const toast = {
  success: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
};

// This sets up the global toast object to use the context when available
export function Toaster() {
  const contextToast = useContext(ToastContext)?.toast;
  
  useEffect(() => {
    if (contextToast) {
      toast.success = contextToast.success;
      toast.error = contextToast.error;
      toast.info = contextToast.info;
      toast.warning = contextToast.warning;
    }
  }, [contextToast]);
  
  return null;
}