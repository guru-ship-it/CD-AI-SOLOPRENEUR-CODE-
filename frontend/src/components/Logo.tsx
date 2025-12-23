
import { ShieldCheck } from 'lucide-react';

export const Logo = ({ className = "h-10", showText = true }: { className?: string; showText?: boolean }) => (
    <div className={`flex items-center gap-3 ${className}`}>
        <div className="relative w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
            {/* The 4 Google Colors in the Corners */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-[#4285F4]"></div> {/* Blue */}
            <div className="absolute top-0 right-0 w-2 h-2 bg-[#EA4335]"></div> {/* Red */}
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#34A853]"></div> {/* Green */}
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#FBBC05]"></div> {/* Yellow */}

            {/* Inner White Box to make it a frame (optional padding feel) */}
            <div className="absolute inset-1 bg-white rounded-lg flex items-center justify-center">
                <ShieldCheck className="text-[#0F172A] w-6 h-6" />
            </div>
        </div>

        {showText && (
            <div className="flex flex-col justify-center">
                <div className="flex items-baseline leading-none">
                    <span className="font-bold text-xl tracking-tight text-slate-800">
                        Compliance<span className="text-[#4285F4]">Desk</span><span className="text-[#34A853]">.ai</span>
                    </span>
                </div>
            </div>
        )}
    </div>
);
