

export const Logo = ({ className = "h-8 w-auto" }: { className?: string }) => (
    <div className={`flex items-center gap-2 ${className}`}>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* The Shield Background: Deep Forest Green for Stability */}
            <path d="M20 38C20 38 5 30.5 5 15V8L20 2L35 8V15C35 30.5 20 38 20 38Z" fill="#064E3B" stroke="#10B981" strokeWidth="2" />

            {/* The Checkmark: Emerald Gradient for "Confidence" & Success */}
            <path d="M13 18L18 23L27 14" stroke="#34D399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* The "AI" Circuit Node (The "Tech" aspect) */}
            <circle cx="20" cy="8" r="1.5" fill="#34D399" />
        </svg>
        <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white leading-none">
                Compliance<span className="text-emerald-600">Desk</span>
            </span>
            <span className="text-[10px] font-medium text-emerald-600 tracking-widest uppercase">
                .ai
            </span>
        </div>
    </div>
);
