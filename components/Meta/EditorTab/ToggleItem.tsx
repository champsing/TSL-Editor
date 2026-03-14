// ─────────────────────────────────────────────────────────────────────────────
// Shared sub-components (previously in SongMetaEditorTab)
// ─────────────────────────────────────────────────────────────────────────────

export const ToggleItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
    color: string;
}> = ({ icon, label, checked, onChange, color }) => (
    <label
        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${checked ? "bg-white/5" : "hover:bg-white/5"}`}
    >
        <div
            className={`flex items-center gap-3 ${checked ? color : "text-gray-400"}`}
        >
            {icon}
            <span className="text-sm font-bold">{label}</span>
        </div>
        <div
            onClick={() => onChange(!checked)}
            className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${checked ? "bg-primary" : "bg-gray-700"}`}
        >
            <div
                className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${checked ? "left-6" : "left-1"}`}
            />
        </div>
    </label>
);
