import React, { useState } from 'react';
import Papa from 'papaparse';
import { FileText, Loader2, ArrowRight } from 'lucide-react';
import { TactileButton } from '../ui/TactileButton';
import { Dropzone } from './Dropzone';
import { toast } from 'sonner';

interface BulkRow {
    [key: string]: string;
}

interface BulkUploaderProps {
    onBatchSubmit: (data: Record<string, any>[]) => Promise<void>;
}

export const BulkUploader: React.FC<BulkUploaderProps> = ({ onBatchSubmit }) => {
    const [preview, setPreview] = useState<BulkRow[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileSelected = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data.length > 0) {
                    setPreview(results.data as BulkRow[]);
                    toast.success(`Extracted ${results.data.length} records from ${file.name}`);
                } else {
                    toast.error("CSV file is empty or invalid header structure.");
                }
            },
            error: (err) => toast.error(`Parsing Error: ${err.message}`)
        });
    };

    const handleSubmit = async () => {
        if (preview.length === 0) return;
        setIsProcessing(true);

        // Map CSV Columns to Backend Schema
        // Expected Columns: Name, DocType, DocNumber
        const requests = preview.map(row => ({
            type: row.DocType || row.type || 'PAN',
            inputs: {
                idNumber: row.DocNumber || row.idNumber,
                name: row.Name || row.name,
                // Add default fields if needed
            }
        })).filter(req => req.inputs.idNumber);

        if (requests.length === 0) {
            toast.error("No valid document numbers found in CSV.");
            setIsProcessing(false);
            return;
        }

        try {
            await onBatchSubmit(requests);
            setPreview([]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <Dropzone onFileSelected={handleFileSelected} />

            {/* Preview Table */}
            {preview.length > 0 && (
                <div className="rounded-[2.5rem] border border-white/60 bg-white/40 overflow-hidden backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl shadow-slate-900/5">
                    <div className="p-8 border-b border-white/60 flex justify-between items-center bg-white/40">
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-1">
                                <FileText className="w-4 h-4 text-emerald-500" /> Forensic Batch Preview
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Ready to process {preview.length} entities</p>
                        </div>
                        <div className="flex gap-3">
                            <TactileButton
                                variant="secondary"
                                size="sm"
                                onClick={() => { setPreview([]); }}
                                disabled={isProcessing}
                            >
                                Discard
                            </TactileButton>
                            <TactileButton
                                variant="primary"
                                size="sm"
                                onClick={handleSubmit}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Inoculating...
                                    </>
                                ) : (
                                    <>
                                        Run Batch Execution <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </TactileButton>
                        </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-slate-100">
                                <tr>
                                    {Object.keys(preview[0]).map(key => (
                                        <th key={key} className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {preview.map((row, i) => (
                                    <tr key={i} className="group hover:bg-white/80 transition-all border-b border-slate-50/50">
                                        {Object.values(row).map((val, j) => (
                                            <td key={j} className="px-8 py-5 text-sm font-bold text-slate-600 tracking-tight group-hover:text-slate-900">{String(val)}</td>
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
