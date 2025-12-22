
import { initializeApp } from 'firebase/app';
// import { getAnalytics } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_MOCK_API_KEY",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock-project.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock-project",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock-project.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize App Check
// CERT-In: Using reCAPTCHA Enterprise for Bot Protection
if (typeof window !== 'undefined') {
    // Use a debug token for localhost, preventing real reCAPTCHA calls during dev
    // In production, this would use the real site key
    /* eslint-disable @typescript-eslint/no-explicit-any */
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.DEV;

    try {
        initializeAppCheck(app, {
            provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6Le_MOCK_SITE_KEY'),
            isTokenAutoRefreshEnabled: true
        });
        console.log('[SECURITY] Firebase App Check initialized with reCAPTCHA Enterprise');
    } catch (e) {
        console.warn('[SECURITY] App Check initialization skipped (Context: Dev/Mock)');
    }
}

export const db = getFirestore(app);
export const functions = getFunctions(app, 'asia-south1'); // CERT-In: Region Lock

export default app;
