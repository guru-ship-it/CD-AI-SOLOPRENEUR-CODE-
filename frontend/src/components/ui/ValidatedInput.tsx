
import { useState } from 'react';
import { sanitizeInput } from '../../utils/securityUtils';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    validator?: (value: string) => boolean;
    errorMessage?: string;
}

export const ValidatedInput = ({ label, validator, errorMessage, onChange, onBlur, ...props }: ValidatedInputProps) => {
    const [error, setError] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [isTouched, setIsTouched] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;

        // Immediate validation feedback if touched
        if (isTouched && validator) {
            if (!validator(rawValue)) {
                setError(errorMessage || 'Invalid input');
                setIsValid(false);
            } else {
                setError('');
                setIsValid(true);
            }
        }

        if (onChange) onChange(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsTouched(true);
        const rawValue = e.target.value;

        // 1. Sanitization (CERT-In)
        const sanitizedValue = sanitizeInput(rawValue);

        // If sanitization changed the value, update it (Anti-XSS)
        if (sanitizedValue !== rawValue) {
            console.warn('[SECURITY] Input sanitized to remove potential XSS');
            e.target.value = sanitizedValue;
            if (onChange) onChange(e as any); // Trigger change with clean value
        }

        // 2. Validation
        if (validator) {
            if (!validator(sanitizedValue)) {
                setError(errorMessage || 'Invalid input');
                setIsValid(false);
            } else {
                setError('');
                setIsValid(true);
            }
        }

        if (onBlur) onBlur(e);
    };

    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <input
                    {...props}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none transition-all ${error ? 'border-red-500 focus:ring-red-200' :
                            isValid ? 'border-emerald-500 focus:ring-emerald-200' :
                                'border-gray-300 focus:ring-emerald-500'
                        }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {error && <XCircle className="w-5 h-5 text-red-500" />}
                    {isValid && !error && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                </div>
            </div>
            {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
        </div>
    );
};
