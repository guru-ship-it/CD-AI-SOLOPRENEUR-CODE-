import React from 'react';
import { Toaster } from 'sonner';
import { WatermarkOverlay } from '../security/WatermarkOverlay';

export const Shell = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="min-h-screen bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900">
            <Toaster position="top-right" expand={false} richColors closeButton />
            <WatermarkOverlay>
                <main className="relative">
                    {children}
                </main>
            </WatermarkOverlay>
        </div>
    );
};
