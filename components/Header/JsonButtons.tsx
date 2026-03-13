import React from "react";
import { FileJson } from "lucide-react";

interface JsonButtonsProps {
    onViewJson: () => void;
}

export const JsonButtons: React.FC<JsonButtonsProps> = ({ onViewJson }) => {
    return (
        <button
            onClick={onViewJson}
            className="
                group relative flex items-center gap-2
                px-3 py-2 rounded-lg
                bg-white/5 hover:bg-primary/10
                border border-white/10 hover:border-primary/40
                text-gray-400 hover:text-primary
                text-sm font-semibold
                transition-all duration-200
                overflow-hidden
            "
        >
            {/* 底部光暈掃過效果 */}
            <span
                className="
                absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
                bg-[radial-gradient(ellipse_at_bottom,rgba(89,191,34,0.08)_0%,transparent_70%)]
                transition-opacity duration-300 pointer-events-none
            "
            />

            <FileJson
                size={15}
                className="transition-transform duration-200 group-hover:scale-110 shrink-0"
            />
            <span className="tracking-wide uppercase text-xs">View JSON</span>
        </button>
    );
};
