
export const Logo = ({ className = "h-10 w-auto" }: { className?: string }) => (
    <div className={`flex items-center gap-3 ${className}`}>
        <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="nexusGradient" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#10B981" /> {/* Emerald-500 */}
                    <stop offset="100%" stopColor="#2DD4BF" /> {/* Teal-400 */}
                </linearGradient>
            </defs>

            {/* Hexagon Outline (Slate-900 / Dark: White) */}
            <path
                d="M50 5 L93.3 30 V80 L50 105 L6.7 80 V30 Z"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-slate-900 dark:text-gray-100" // Adaptive color
                transform="translate(0 -5)" // Center vertically
            />

            {/* Circuit Checkmark (Emerald-Teal Gradient) */}
            <path
                d="M30 50 L45 65 L70 35"
                stroke="url(#nexusGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Circuit Node dot */}
            <circle cx="70" cy="35" r="4" fill="#2DD4BF" />
        </svg>

        <div className="flex flex-col justify-center">
            <div className="flex items-baseline leading-none">
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                    Compliance
                </span>
                <span className="font-bold text-xl tracking-tight text-emerald-600 ml-0.5">
                    Desk
                </span>
            </div>
            <span className="text-xs font-mono font-medium text-teal-500 tracking-[0.2em] uppercase mt-0.5">
                .ai
            </span>
        </div>
    </div>
);
