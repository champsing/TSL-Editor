import { Plus } from "lucide-react";
import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// EditorEntryButton — the unified entry tile on the main page
// subtitle 改為 ReactNode，支援彩色徽章式顯示
// ─────────────────────────────────────────────────────────────────────────────
export const EditorEntryButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    subtitle?: React.ReactNode;
    accentClass?: string;
    onClick: () => void;
    preview?: React.ReactNode;
}> = ({
    icon,
    label,
    subtitle,
    accentClass = "bg-primary/15 text-primary group-hover:bg-primary/25",
    onClick,
    preview,
}) => (
    <button
        onClick={onClick}
        className="group w-full flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/8 hover:border-white/20 transition-all duration-200 text-left"
    >
        <div
            className={`p-3 rounded-xl transition-colors duration-200 ${accentClass}`}
        >
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                {label}
            </div>
            {subtitle !== undefined && (
                <div className="text-xs mt-0.5 flex items-center gap-1.5 flex-wrap min-w-0">
                    {subtitle}
                </div>
            )}
        </div>
        {preview && <div className="shrink-0">{preview}</div>}
        <Plus
            size={18}
            className="text-gray-600 group-hover:text-primary transition-colors shrink-0"
        />
    </button>
);
