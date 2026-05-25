import React, { createContext, useContext, useReducer, useCallback } from 'react';

/**
 * Toast Context — ported from the Z Matrix demo's useToast composable.
 * Provides success / error / warning / info helpers anywhere in the tree.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success('Saved!');
 *   toast.error('Something went wrong', 6000);
 */

let _nextId = 0;

const ToastContext = createContext(null);

const toastReducer = (state, action) => {
  switch (action.type) {
    case 'ADD':
      return [...state, action.payload];
    case 'REMOVE':
      return state.filter(t => t.id !== action.payload);
    default:
      return state;
  }
};

export const ToastProvider = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE', payload: id });
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++_nextId;
    dispatch({ type: 'ADD', payload: { id, message, type, duration } });
    if (duration > 0) {
      setTimeout(() => dispatch({ type: 'REMOVE', payload: id }), duration);
    }
    return id;
  }, []);

  const toast = {
    add: addToast,
    remove: removeToast,
    success: (msg, duration)         => addToast(msg, 'success', duration),
    error:   (msg, duration = 5000)  => addToast(msg, 'error', duration),
    warning: (msg, duration)         => addToast(msg, 'warning', duration),
    info:    (msg, duration)         => addToast(msg, 'info', duration),
  };

  return (
    <ToastContext.Provider value={{ toasts, removeToast, toast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx.toast;
};

// Also export raw toasts + removeToast for the container
export const useToastState = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastState must be used within <ToastProvider>');
  return { toasts: ctx.toasts, removeToast: ctx.removeToast };
};
