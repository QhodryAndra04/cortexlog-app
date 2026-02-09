'use client';

export default function ConfirmationDialog({ isOpen, title, message, onConfirm, onCancel, isDanger = false }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 max-w-sm">
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-300 mb-6">{message}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded hover:bg-slate-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded transition ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700 text-white border border-red-500'
                : 'bg-green-600 hover:bg-green-700 text-white border border-green-500'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
