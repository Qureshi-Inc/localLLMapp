'use client';

import { useEffect, useCallback, useRef } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const AUTO_DISMISS_DELAY = 4000;

export default function Notification({ message, type, onClose }: NotificationProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClose = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onClose();
    }, AUTO_DISMISS_DELAY);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [onClose]);

  const bgClass = type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800';

  return (
    <div
      className={`fixed top-4 right-4 ${bgClass} rounded-lg p-4 shadow-md flex items-center justify-between z-50 animate-in`}
      role="alert"
      aria-live="polite"
    >
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={handleClose}
        className={`ml-4 flex-shrink-0 ${
          type === 'success' ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
        } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 rounded`}
        aria-label="Close notification"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
