import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';

const Toast = ({ message, type = 'success', duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-50' : 'bg-rose-50';
  const borderColor = type === 'success' ? 'border-green-200' : 'border-rose-200';
  const icon = type === 'success' ? <FiCheckCircle className="h-5 w-5 text-green-600" /> : <FiAlertCircle className="h-5 w-5 text-rose-600" />;
  const textColor = type === 'success' ? 'text-green-800' : 'text-rose-800';

  return (
    <div className={`fixed top-4 right-4 z-40 flex items-center gap-3 rounded-full border ${borderColor} ${bgColor} px-6 py-4 shadow-lg`}>
      {icon}
      <p className={`text-sm font-medium ${textColor}`}>{message}</p>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-2 text-slate-400 transition hover:text-slate-600"
      >
        <FiX className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
