
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TIMEOUT_MS = 15 * 60 * 1000; // 15 Minutes

export const useSessionTimeout = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const [lastActivity, setLastActivity] = useState(Date.now());

    const handleLogout = useCallback(() => {
        if (user) {
            console.warn('[SECURITY] Session timed out due to inactivity.');
            logout();
            navigate('/');
        }
    }, [logout, navigate, user]);

    useEffect(() => {
        if (!user) return; // Only track if logged in

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        // Reset timer on any user activity
        const resetTimer = () => {
            setLastActivity(Date.now());
        };

        // Add listeners
        events.forEach(event => window.addEventListener(event, resetTimer));

        // Check interval
        const intervalId = setInterval(() => {
            const now = Date.now();
            if (now - lastActivity > TIMEOUT_MS) {
                handleLogout();
            }
        }, 10000); // Check every 10 seconds

        return () => {
            events.forEach(event => window.removeEventListener(event, resetTimer));
            clearInterval(intervalId);
        };
    }, [lastActivity, handleLogout, user]);
};
