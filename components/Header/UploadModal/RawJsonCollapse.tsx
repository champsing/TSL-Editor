import { ChevronDown } from "lucide-react";
import { useState } from "react";

// ── Raw JSON collapsible ──────────────────────────────────────────────────────
export const RawJsonCollapse: React.FC<{ label: string; data: any }> = ({
    label,
    data,
}) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="mt-3 border border-white/8 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white/3 hover:bg-white/6 transition-colors"
            >
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                    {label}
                </span>
                <ChevronDown
                    size={13}
                    className={`text-gray-600 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
                />
            </button>
            {open && (
                <pre className="px-4 py-3 text-[11px] font-mono text-gray-400 bg-black/30 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};
