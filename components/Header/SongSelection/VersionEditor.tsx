import { inputClassSong } from "@components/Header/SongSelection/SongSelectionModal";
import { Version } from "@composables/types";
import { Pencil, Plus } from "lucide-react";
import React from "react";
import { FaLock } from "react-icons/fa6";

// ── 暫時鎖死的版本選項，待播放器客戶端大更新後解禁 ────────────────────────────
const VERSION_OPTIONS = ["original", "instrumental", "live"] as const;

export const VersionsEditor: React.FC<{
    versions: Version[];
    onUpdate: (v: Version[]) => void;
    /** 點擊鉛筆後，通知父層切換到該版本進行歌詞編輯 */
    onEditVersion?: (version: Version) => void;
}> = ({ versions, onUpdate, onEditVersion }) => {
    const update = (idx: number, field: keyof Version, value: any) => {
        const next = [...versions];
        next[idx] = { ...next[idx], [field]: value };
        onUpdate(next);
    };

    const setDefault = (idx: number) =>
        onUpdate(versions.map((v, i) => ({ ...v, default: i === idx })));

    const remove = (idx: number) => {
        if (versions[idx].version === "original") return;
        const next = versions.filter((_, i) => i !== idx);
        if (versions[idx].default && next.length > 0) {
            next[0] = { ...next[0], default: true };
        }
        onUpdate(next);
    };

    const add = () =>
        onUpdate([
            ...versions,
            {
                version:
                    VERSION_OPTIONS.find(
                        (o) =>
                            o !== "original" &&
                            !versions.some((v) => v.version === o),
                    ) ?? "instrumental",
                id: "",
                duration: "0:00",
                default: false,
            },
        ]);

    return (
        <div className="space-y-3">
            {versions.map((v, idx) => (
                <div
                    key={idx}
                    className={`border rounded-xl p-4 space-y-3 transition-colors ${
                        v.version === "original"
                            ? "bg-primary/5 border-primary/20"
                            : "bg-black/30 border-white/8"
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                                    Version
                                </p>
                                {v.version === "original" ? (
                                    <div
                                        className={`${inputClassSong} flex items-center gap-2 text-primary/70 cursor-not-allowed select-none`}
                                    >
                                        <FaLock
                                            size={11}
                                            className="shrink-0 opacity-60"
                                        />
                                        <span className="font-mono">
                                            original
                                        </span>
                                    </div>
                                ) : (
                                    // TODO: 播放器客戶端大更新後，將下方 select 換回 input 自由輸入
                                    <select
                                        value={v.version}
                                        onChange={(e) =>
                                            update(
                                                idx,
                                                "version",
                                                e.target.value,
                                            )
                                        }
                                        className={`${inputClassSong} cursor-pointer`}
                                    >
                                        {VERSION_OPTIONS.filter(
                                            (o) => o !== "original",
                                        ).map((o) => (
                                            <option key={o} value={o}>
                                                {o}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                                    YouTube ID
                                </p>
                                <input
                                    value={v.id}
                                    onChange={(e) =>
                                        update(idx, "id", e.target.value)
                                    }
                                    className={`${inputClassSong} font-mono`}
                                    placeholder="dQw4w9WgXcQ"
                                />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                                    Duration
                                </p>
                                <input
                                    value={v.duration}
                                    onChange={(e) =>
                                        update(idx, "duration", e.target.value)
                                    }
                                    className={`${inputClassSong} font-mono`}
                                    placeholder="3:45"
                                />
                            </div>
                        </div>

                        {/* Action buttons column */}
                        <div className="flex flex-col gap-2 pt-4">
                            <button
                                onClick={() => setDefault(idx)}
                                className={`text-xs px-2 py-1 rounded-lg border transition-all ${
                                    v.default
                                        ? "bg-primary/20 border-primary/40 text-primary font-bold"
                                        : "border-white/10 text-gray-500 hover:text-white hover:border-white/20"
                                }`}
                            >
                                {v.default ? "Default" : "Set Default"}
                            </button>

                            {/* 鉛筆：切換到此版本進行歌詞編輯 */}
                            {onEditVersion && (
                                <button
                                    onClick={() => onEditVersion(v)}
                                    className="flex items-center justify-center gap-1 text-xs px-2 py-1 rounded-lg border border-sky-500/30 text-sky-400 hover:bg-sky-500/10 hover:border-sky-400/50 transition-all"
                                    title={`編輯 ${v.version} 版本歌詞`}
                                >
                                    <Pencil size={11} />
                                    Edit
                                </button>
                            )}

                            {v.version !== "original" && (
                                <button
                                    onClick={() => remove(idx)}
                                    className="text-xs px-2 py-1 rounded-lg border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-all"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            <button
                onClick={add}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/15 text-gray-500 hover:text-white hover:border-white/30 transition-all text-sm"
            >
                <Plus size={14} /> Add Version
            </button>
        </div>
    );
};
