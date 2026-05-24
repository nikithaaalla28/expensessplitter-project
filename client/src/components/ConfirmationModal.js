import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, isLoading = false, isDangerous = false, confirmLabel = 'Confirm' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-[1.5rem] bg-white p-6 shadow-2xl">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-600 disabled:opacity-50"
        >
          <FiX className="h-5 w-5" />
        </button>

        <div className="mb-4 flex items-start gap-4">
          <div className={`rounded-full p-3 ${isDangerous ? 'bg-rose-100' : 'bg-amber-100'}`}>
            <FiAlertTriangle className={`h-6 w-6 ${isDangerous ? 'text-rose-600' : 'text-amber-600'}`} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition ${
              isDangerous
                ? 'bg-rose-500 hover:bg-rose-600 disabled:bg-rose-400'
                : 'bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700'
            } disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
