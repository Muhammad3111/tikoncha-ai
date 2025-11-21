import React from "react";
import { AlertCircle, X } from "lucide-react";

const ErrorBanner = ({ error, onClose }) => {
    if (!error) return null;

    return (
        <div className="bg-red-900/50 border-b border-red-700 px-4 py-3">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-200">{error}</p>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-red-400 hover:text-red-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorBanner;
