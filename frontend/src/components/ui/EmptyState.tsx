import React from 'react';
import { FileSearch } from 'lucide-react';

export const EmptyState = ({ onAction }: { onAction: () => void }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-dashed border-slate-300 rounded-2xl">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <FileSearch className="w-8 h-8 text-[#4285F4]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No verifications yet</h3>
            <p className="text-slate-500 max-w-sm mb-6">
                You haven't verified any documents yet. Start your first check to see the magic happen.
            </p>
            <button
                onClick={onAction}
                className="px-6 py-2 bg-[#4285F4] hover:bg-[#3367d6] text-white font-medium rounded-lg shadow-sm transition-all"
            >
                Start New Verification
            </button>
        </div>
    );
};
