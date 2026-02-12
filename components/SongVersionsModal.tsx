import { Version } from "@/types";
import { Clock, LinkIcon, Plus, Star, Trash2, X } from "lucide-react";

// --- 新增：Versions 管理視窗組件 ---
export const SongVersionsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    versions: Version[];
    onUpdate: (versions: Version[]) => void;
}> = ({ isOpen, onClose, versions, onUpdate }) => {
    if (!isOpen) return null;

    const addVersion = () => {
        onUpdate([
            ...versions,
            { version: "New Version", id: "", duration: "0:00", default: false },
        ]);
    };

    const updateVersion = (idx: number, field: keyof Version, value: any) => {
        const updated = [...versions];
        updated[idx] = { ...updated[idx], [field]: value };
        onUpdate(updated);
    };

    const setDefault = (idx: number) => {
        const updated = versions.map((v, i) => ({ ...v, default: i === idx }));
        onUpdate(updated);
    };

    const removeVersion = (idx: number) => {
        onUpdate(versions.filter((_, i) => i !== idx));
    };

    return (
        <div className="fixed inset-0 z-51 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            
            <div className="relative bg-[#2d3748] w-full max-w-3xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg text-primary">
                            <LinkIcon size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-white">Song Versions</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={addVersion}
                            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-black hover:bg-primary/90 rounded-full text-xs font-black transition-all"
                        >
                            <Plus size={16} /> ADD VERSION
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="p-6 max-h-64 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="text-[10px] uppercase tracking-widest text-gray-500 font-black px-4">
                                <th className="pb-2 pl-4 w-12 text-center">Def.</th>
                                <th className="pb-2">Version Name</th>
                                <th className="pb-2">YouTube ID</th>
                                <th className="pb-2 w-28">Duration</th>
                                <th className="pb-2 pr-4 w-12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {versions.map((v, idx) => (
                                <tr key={idx} className="bg-black/20 group transition-all">
                                    <td className="py-3 pl-4 rounded-l-xl text-center">
                                        <button
                                            onClick={() => setDefault(idx)}
                                            className={`transition-colors ${v.default ? "text-yellow-400" : "text-gray-600 hover:text-gray-400"}`}
                                        >
                                            <Star size={18} fill={v.default ? "currentColor" : "none"} />
                                        </button>
                                    </td>
                                    <td className="py-3">
                                        <input
                                            value={v.version}
                                            onChange={(e) => updateVersion(idx, "version", e.target.value)}
                                            disabled={v.version === "original"}
                                            className="bg-transparent border-none p-0 text-sm text-white focus:ring-0 w-full font-bold disabled:opacity-50"
                                            placeholder="Version name"
                                        />
                                    </td>
                                    <td className="py-3">
                                        <input
                                            value={v.id}
                                            onChange={(e) => updateVersion(idx, "id", e.target.value)}
                                            className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-blue-300 font-mono focus:border-primary/50 outline-none w-11/12"
                                            placeholder="Video ID"
                                        />
                                    </td>
                                    <td className="py-3">
                                        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded px-2 py-1 w-24">
                                            <Clock size={12} className="text-gray-500" />
                                            <input
                                                value={v.duration}
                                                onChange={(e) => updateVersion(idx, "duration", e.target.value)}
                                                className="bg-transparent border-none p-0 text-xs text-white focus:ring-0 w-full font-mono"
                                            />
                                        </div>
                                    </td>
                                    <td className="py-3 pr-4 rounded-r-xl text-right">
                                        {v.version !== "original" && (
                                            <button
                                                onClick={() => removeVersion(idx)}
                                                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {versions.length === 0 && (
                        <div className="py-12 text-center text-gray-500 italic border border-dashed border-white/10 rounded-2xl">
                            No versions defined.
                        </div>
                    )}
                </div>
                
                <div className="p-6 bg-white/5 text-[10px] text-gray-500 italic border-t border-white/10">
                    * The "original" version is required and cannot be deleted. All changes are saved to the current song buffer.
                </div>
            </div>
        </div>
    );
};