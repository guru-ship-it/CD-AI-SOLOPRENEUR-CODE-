import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { TactileButton } from '../ui/TactileButton';
import { toast } from 'sonner';

interface BulkUploaderProps {
    onBatchSubmit: (data: any[]) => Promise<void>;
}

export const BulkUploader: React.FC<BulkUploaderProps> = ({ onBatchSubmit }) => {
    const [preview, setPreview] = useState<any[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File size exceeds 2MB limit.");
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data.length > 0) {
                    setPreview(results.data.slice(0, 50)); // Limit preview to 50
                    toast.success(`Parsed ${results.data.length} records successfully.`);
                } else {
                    toast.error("CSV file is empty or invalid.");
                }
            },
            error: (err) => toast.error(`Parsing Error: ${err.message}`)
        });
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'text/csv': ['.csv'] },
        multiple: false
    });

    const handleSubmit = async () => {
        if (preview.length === 0) return;
        setIsProcessing(true);
        try {
            await onBatchSubmit(preview);
            setPreview([]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`
                    cursor-pointer border-2 border-dashed rounded-[2rem] p-12 transition-all duration-500 flex flex-col items-center justify-center gap-4
                    ${isDragActive ? 'border-emerald-500 bg-emerald-50/50 scale-[1.02]' : 'border-slate-200 bg-white/40 hover:border-slate-300 hover:bg-white/60'}
                `}
            >
                <input {...getInputProps()} />
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-xl shadow-emerald-200/50">
                    <Upload className="w-8 h-8" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-black text-slate-900 tracking-tight uppercase">Drop drivers.csv here</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Columns: Name, PanNumber, Phone</p>
                </div>
            </div>

            {/* Preview Table */}
            {preview.length > 0 && (
                <div className="rounded-[2rem] border border-white/60 bg-white/40 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-500" /> Batch Preview ({preview.length} Items)
                        </h3>
                        <div className="flex gap-2">
                            <TactileButton
                                variant="ghost"
                                size="sm"
                                onClick={() => setPreview([])}
                                disabled={isProcessing}
                            >
                                Clear
                            </TactileButton>
                            <TactileButton
                                variant="primary"
                                size="sm"
                                onClick={handleSubmit}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin mr-2" />
                                        Processing...
                                    </>
                                ) : 'Start Batch Verification'}
                            </TactileButton>
                        </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md z-10">
                                <tr>
                                    {Object.keys(preview[0]).map(key => (
                                        <th key={key} className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {preview.map((row, i) => (
                                    <tr key={i} className="border-t border-slate-50 hover:bg-white/40 transition-colors">
                                        {Object.values(row).map((val: any, j) => (
                                            <td key={j} className="px-6 py-4 text-xs font-bold text-slate-600 tracking-tight">{val}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
