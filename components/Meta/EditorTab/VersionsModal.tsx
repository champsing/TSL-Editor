import { Version } from "@/composables/types";
import { Clock, Star, Trash2 } from "lucide-react";

// ── 4. Versions ───────────────────────────────────────────────────────────────
export const VersionsModal: React.FC<{
    versions: Version[];
    onUpdate: (versions: Version[]) => void;
}> = ({ versions, onUpdate }) => {
    const updateVersion = (idx: number, field: keyof Version, value: any) => {
        const updated = [...versions];
        updated[idx] = { ...updated[idx], [field]: value };
        onUpdate(updated);
    };

    const setDefault = (idx: number) => {
        onUpdate(versions.map((v, i) => ({ ...v, default: i === idx })));
    };

    const removeVersion = (idx: number) => {
        onUpdate(versions.filter((_, i) => i !== idx));
    };

    if (versions.length === 0) {
        return (
            <div className="py-12 text-center text-gray-500 italic border border-dashed border-white/10 rounded-2xl">
                No versions defined.
            </div>
        );
    }

    return (
        <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
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
                                <Star
                                    size={18}
                                    fill={v.default ? "currentColor" : "none"}
                                />
                            </button>
                        </td>
                        <td className="py-3">
                            <input
                                value={v.version}
                                onChange={(e) =>
                                    updateVersion(
                                        idx,
                                        "version",
                                        e.target.value,
                                    )
                                }
                                disabled={v.version === "original"}
                                className="bg-transparent border-none p-0 text-sm text-white focus:ring-0 w-full font-bold disabled:opacity-50"
                                placeholder="Version name"
                            />
                        </td>
                        <td className="py-3">
                            <input
                                value={v.id}
                                onChange={(e) =>
                                    updateVersion(idx, "id", e.target.value)
                                }
                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-blue-300 font-mono focus:border-primary/50 outline-none w-11/12"
                                placeholder="Video ID"
                            />
                        </td>
                        <td className="py-3">
                            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded px-2 py-1 w-24">
                                <Clock size={12} className="text-gray-500" />
                                <input
                                    value={v.duration}
                                    onChange={(e) =>
                                        updateVersion(
                                            idx,
                                            "duration",
                                            e.target.value,
                                        )
                                    }
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
    );
};
