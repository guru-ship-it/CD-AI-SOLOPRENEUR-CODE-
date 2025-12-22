import React, { useState, useEffect } from 'react';
import { recordConsent } from '../../utils/securityUtils';

export const CookieConsent: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'GRANTED');
        recordConsent('anonymous_browser', 'GRANTED'); // Log to Consent Ledger
        setIsVisible(false);
        // Initialize Analytics here
        console.log('[COOKIES] Analytics Cookies Enabled');
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'DENIED');
        recordConsent('anonymous_browser', 'WITHDRAWN');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 p-4 shadow-2xl z-50 backdrop-blur-md bg-opacity-90">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-300">
                    <strong className="text-white block mb-1">We value your privacy (ePrivacy Directive)</strong>
                    We use strictly necessary cookies to operate. Marketing and analytics cookies are blocked until you accept.
                    <a href="/privacy" className="underline ml-2 text-emerald-400 hover:text-emerald-300">Read Policy</a>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDecline}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-sm font-medium transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-sm font-medium shadow-lg shadow-emerald-900/20 transition-all hover:scale-105"
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
};
