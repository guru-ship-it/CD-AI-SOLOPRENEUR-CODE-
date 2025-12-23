import React from 'react';
import { CreditCard, Fingerprint, Car, Scale, Building2, Plane, ShieldCheck, User, Scan } from 'lucide-react';

export interface VerificationType {
    id: string;
    label: string;
    desc: string;
    icon: React.ReactNode;
    bg: string;
    border: string;
    shadow: string;
    fields: string[];
    backendType?: string; // Optional if different from id
}

export const VERIFICATION_TYPES: VerificationType[] = [
    {
        id: 'pan',
        label: 'PAN Card',
        desc: 'Finance & Tax Identity',
        icon: <CreditCard className="w-6 h-6 text-[#4285F4]" />, 
    bg: 'bg-blue-50',
        border: 'hover:border-blue-200',
        shadow: 'hover:shadow-blue-100',
        fields: ['idNumber'],
        backendType: 'PAN'
    },
    {
        id: 'aadhaar',
        label: 'Aadhaar XML',
        desc: 'Biometric Residency',
        icon: <Fingerprint className="w-6 h-6 text-[#EA4335]" />, 
    bg: 'bg-red-50',
        border: 'hover:border-red-200',
        shadow: 'hover:shadow-red-100',
        fields: ['idNumber'],
        backendType: 'DIGILOCKER'
    },
    {
        id: 'dl',
        label: 'Driving License',
        desc: 'Transport & Logistics',
        icon: <Car className="w-6 h-6 text-[#FBBC05]" />, 
    bg: 'bg-yellow-50',
        border: 'hover:border-yellow-200',
        shadow: 'hover:shadow-yellow-100',
        fields: ['idNumber', 'dob'],
        backendType: 'DRIVING_LICENSE'
    },
    {
        id: 'court',
        label: 'Court Record',
        desc: 'Criminal Background',
        icon: <Scale className="w-6 h-6 text-[#34A853]" />, 
    bg: 'bg-green-50',
        border: 'hover:border-green-200',
        shadow: 'hover:shadow-green-100',
        fields: ['name', 'fatherName', 'address'],
        backendType: 'CRIME_CHECK'
    },
    {
        id: 'gst',
        label: 'GST Verification',
        desc: 'Business Validity',
        icon: <Building2 className="w-6 h-6 text-purple-600" />, 
    bg: 'bg-purple-50',
        border: 'hover:border-purple-200',
        shadow: 'hover:shadow-purple-100',
        fields: ['gstNumber'],
        backendType: 'GST'
    },
    {
        id: 'passport',
        label: 'Passport',
        desc: 'Global Identity',
        icon: <Plane className="w-6 h-6 text-cyan-600" />, 
    bg: 'bg-cyan-50',
        border: 'hover:border-cyan-200',
        shadow: 'hover:shadow-cyan-100',
        fields: ['idNumber'],
        backendType: 'PASSPORT'
    },
    {
        id: 'DIGILOCKER',
        label: 'DigiLocker Connect',
        desc: 'Cloud Document Access',
        icon: <ShieldCheck className="w-6 h-6 text-blue-600" />, 
    bg: 'bg-blue-50',
        border: 'hover:border-blue-200',
        shadow: 'hover:shadow-blue-100',
        fields: ['accessToken']
    },
    {
        id: 'SINGAPORE',
        label: 'Singapore NRIC',
        desc: 'South East Asia ID',
        icon: <User className="w-6 h-6 text-slate-600" />, 
    bg: 'bg-slate-50',
        border: 'hover:border-slate-200',
        shadow: 'hover:shadow-slate-100',
        fields: ['idNumber']
    },
    {
        id: 'VISION',
        label: 'Identity OCR',
        desc: 'AI Document Scanning',
        icon: <Scan className="w-6 h-6 text-orange-600" />, 
    bg: 'bg-orange-50',
        border: 'hover:border-orange-200',
        shadow: 'hover:shadow-orange-100',
        fields: ['imageBase64']
    }
];
