import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DropzoneProps {
    onFileSelected: (file: File) => void;
    accept?: string;
    maxSize?: number; // in bytes
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileSelected, accept = ".csv", maxSize = 5 * 1024 * 1024 }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const validateFile = (file: File) => {
        if (!file.name.endsWith(accept)) {
            setError(`Invalid file type. Please upload a ${accept} file.`);
            return false;
        }
        if (file.size > maxSize) {
            setError(`File too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
            return false;
        }
        setError(null);
        return true;
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
            onFileSelected(file);
        }
    }, [onFileSelected, accept, maxSize]);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
            onFileSelected(file);
        }
    };

    return (
        <div className="w-full">
            {!selectedFile ? (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                        "relative group cursor-pointer border-2 border-dashed rounded-[2.5rem] p-12 transition-all duration-500",
                        isDragging
                            ? "border-emerald-500 bg-emerald-500/5 scale-[0.99] shadow-inner"
                            : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                    )}
                >
                    <input
                        type="file"
                        accept={accept}
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />

                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className={cn(
                            "p-5 rounded-3xl transition-all duration-500",
                            isDragging ? "bg-emerald-500 text-white scale-110 shadow-xl shadow-emerald-500/20" : "bg-white text-slate-400 shadow-sm"
                        )}>
                            <Upload className="w-8 h-8" />
                        </div>

                        <div>
                            <p className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">
                                Drag & Drop Batch File
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                Or click to browse your forensic records (.csv)
                            </p>
                        </div>

                        {error && (
                            <p className="mt-2 text-[10px] font-black text-rose-500 uppercase tracking-tight bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">
                                {error}
                            </p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-[2rem] p-6 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-900 tracking-tight leading-none mb-1">
                                {selectedFile.name}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {(selectedFile.size / 1024).toFixed(1)} KB • READY FOR EXTRACTION
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-50 text-emerald-600 p-2 rounded-full">
                            <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <button
                            onClick={() => setSelectedFile(null)}
                            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
