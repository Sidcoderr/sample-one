import React from "react";
import { AlertCircle, X } from "lucide-react";

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 shadow-lg text-red-800">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
        <div className="flex-1 text-sm font-medium leading-relaxed">{message}</div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="inline-flex rounded p-1 text-red-500 hover:bg-red-100 hover:text-red-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

