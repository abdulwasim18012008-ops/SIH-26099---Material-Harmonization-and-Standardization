import React from 'react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const bgStyles = {
    success: 'bg-[#4a7c59] text-white',
    info: 'bg-[#705c30] text-white',
    warning: 'bg-[#f8e0a8] text-[#554020] border border-[#dcc48e]',
    error: 'bg-[#b83230] text-white',
  };

  const iconName = {
    success: 'check_circle',
    info: 'info',
    warning: 'warning',
    error: 'error',
  }[toast.type];

  return (
    <div className="fixed bottom-14 right-6 z-50 animate-bounce-short">
      <div
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg font-sans text-xs font-semibold ${
          bgStyles[toast.type]
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">{iconName}</span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
};
