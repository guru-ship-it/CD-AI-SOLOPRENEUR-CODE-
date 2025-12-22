import React, { useEffect, useState } from 'react';

export const WatermarkOverlay: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ip, setIp] = useState<string>('127.0.0.1');
    const userEmail = "admin@compliancedesk.ai"; // Mocking for demo
    const timestamp = new Date().toLocaleString();

    useEffect(() => {
        // Simulate fetching IP for demo purposes
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => setIp(data.ip))
            .catch(() => setIp('192.168.1.1'));
    }, []);

    const watermarkText = `${userEmail} - ${ip} - ${timestamp}`;

    return (
        <div className="relative min-h-screen">
            {/* Watermark Base Layer */}
            <div
                className="glass-watermark overflow-hidden flex flex-wrap content-start justify-center"
                aria-hidden="true"
            >
                {Array.from({ length: 100 }).map((_, i) => (
                    <div
                        key={i}
                        className="p-8 text-sm font-mono whitespace-nowrap transform -rotate-12"
                        style={{ minWidth: '300px' }}
                    >
                        {watermarkText}
                    </div>
                ))}
            </div>

            {/* App Content */}
            <div className="relative z-0">
                {children}
            </div>
        </div>
    );
};
