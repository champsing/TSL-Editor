import { useArtistNames } from "@/hooks/useArtistName";
import { Song, Version } from "@composables/types";
import { Search, X, Plus, ArrowLeft, Layers, Music } from "lucide-react";
import React, { useState } from "react";
import { authHeaders } from "@composables/useAuth";
import { API_BASE_URL } from "@/composables/utils";

// ── VersionsModalContent (inline，複用 EditorTab 的邏輯) ──────────────────────
const inputClass =
    "w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors";

const VersionsEditor: React.FC<{
    versions: Version[];
    onUpdate: (v: Version[]) => void;
}> = ({ versions, onUpdate }) => {
    const update = (idx: number, field: keyof Version, value: any) => {
        const next = [...versions];
        next[idx] = { ...next[idx], [field]: value };
        onUpdate(next);
    };

    const setDefault = (idx: number) =>
        onUpdate(versions.map((v, i) => ({ ...v, default: i === idx })));

    const remove = (idx: number) =>
        onUpdate(versions.filter((_, i) => i !== idx));

    const add = () =>
        onUpdate([
            ...versions,
            {
                version: "New Version",
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
                    className="bg-black/30 border border-white/8 rounded-xl p-4 space-y-3"
                >
                    <div className="flex items-center gap-2">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
                                    Version
                                </p>
                                <input
                                    value={v.version}
                                    onChange={(e) =>
                                        update(idx, "version", e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="original"
                                />
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
                                    className={`${inputClass} font-mono`}
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
                                    className={`${inputClass} font-mono`}
                                    placeholder="3:45"
                                />
                            </div>
                        </div>
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
                            <button
                                onClick={() => remove(idx)}
                                className="text-xs px-2 py-1 rounded-lg border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-all"
                            >
                                Remove
                            </button>
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

// ── Create Song View ──────────────────────────────────────────────────────────
type CreateStep = "info" | "versions";

const CreateSongView: React.FC<{
    onBack: () => void;
    onCreated: () => void;
}> = ({ onBack, onCreated }) => {
    const [step, setStep] = useState<CreateStep>("info");
    const [songId, setSongId] = useState("");
    const [title, setTitle] = useState("");
    const [versions, setVersions] = useState<Version[]>([
        { version: "original", id: "", default: true, duration: "0:00" },
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canProceed =
        songId.trim() !== "" && title.trim() !== "" && !isNaN(Number(songId));

    const handleCreate = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE_URL}/api/songs/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders(),
                },
                body: JSON.stringify({
                    song_id: Number(songId),
                    title: title.trim(),
                    versions,
                }),
            });

            if (res.status === 409 || !res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data?.message ?? `Error ${res.status}`);
                return;
            }

            onCreated();
        } catch (e) {
            setError("Network error, please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Plus size={20} className="text-primary" />
                    New Song
                </h3>
                {/* Step indicator */}
                <div className="ml-auto flex items-center gap-2">
                    {(["info", "versions"] as CreateStep[]).map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                    step === s
                                        ? "bg-primary text-black"
                                        : i < ["info", "versions"].indexOf(step)
                                          ? "bg-primary/30 text-primary"
                                          : "bg-white/10 text-gray-500"
                                }`}
                            >
                                {i + 1}
                            </div>
                            {i < 1 && <div className="w-6 h-px bg-white/15" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {step === "info" ? (
                    <div className="space-y-5">
                        <div>
                            <label className="flex items-center gap-1.5 text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                                <Music size={12} /> Title
                            </label>
                            <input
                                autoFocus
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className={inputClass}
                                placeholder="Song title"
                            />
                        </div>
                        <div>
                            <label className="flex items-center gap-1.5 text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                                <Layers size={12} /> Song ID
                            </label>
                            <input
                                value={songId}
                                onChange={(e) => setSongId(e.target.value)}
                                className={`${inputClass} font-mono`}
                                placeholder="Unique numeric ID"
                                type="number"
                            />
                            <p className="text-xs text-gray-600 mt-1.5">
                                Must be a unique integer not already in the
                                database.
                            </p>
                        </div>
                    </div>
                ) : (
                    <VersionsEditor
                        versions={versions}
                        onUpdate={setVersions}
                    />
                )}

                {error && (
                    <p className="mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 flex justify-between items-center">
                {step === "info" ? (
                    <>
                        <button
                            onClick={onBack}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => setStep("versions")}
                            disabled={!canProceed}
                            className="px-5 py-2 bg-primary text-black font-bold text-sm rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
                        >
                            Next: Versions →
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={() => setStep("info")}
                            className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                        >
                            <ArrowLeft size={14} /> Back
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={isSubmitting || versions.length === 0}
                            className="px-5 py-2 bg-primary text-black font-bold text-sm rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
                        >
                            {isSubmitting ? "Creating…" : "Create Song"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

// ── Main Modal ────────────────────────────────────────────────────────────────
export const SongSelectionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSelect: (song: Song) => void;
    isLoggedIn?: boolean;
}> = ({ isOpen, onClose, onSelect, isLoggedIn = false }) => {
    const { songs, loading, formatArtistNames, refetch } = useArtistNames();
    const [search, setSearch] = React.useState("");
    const [view, setView] = React.useState<"list" | "create">("list");

    if (!isOpen) return null;

    const filteredSongs = songs.filter((s) => {
        const term = search.toLowerCase();
        return (
            s.title.toLowerCase().includes(term) ||
            formatArtistNames(s.artist).toLowerCase().includes(term)
        );
    });

    const handleCreated = () => {
        // 重新抓歌曲列表，然後回到清單
        refetch?.();
        setView("list");
    };

    if (view === "create") {
        return (
            <div className="fixed inset-0 z-51 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#1a202c] border border-white/10 w-full max-w-2xl max-h-[80vh] rounded-2xl flex flex-col shadow-2xl">
                    <CreateSongView
                        onBack={() => setView("list")}
                        onCreated={handleCreated}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-51 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a202c] border border-white/10 w-full max-w-2xl max-h-[80vh] rounded-2xl flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex gap-3 items-center">
                        <Search size={22} className="text-primary" />
                        Select a Song
                    </h3>
                    <div className="flex items-center gap-3">
                        {isLoggedIn && (
                            <button
                                onClick={() => setView("create")}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-lg text-sm font-semibold transition-all"
                            >
                                <Plus size={15} />
                                New Song
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="p-4">
                    <input
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                        placeholder="Search title or artist..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {loading ? (
                        <div className="py-12 text-center text-gray-500">
                            Loading…
                        </div>
                    ) : filteredSongs.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">
                            No songs found.
                        </div>
                    ) : (
                        filteredSongs.map((song) => (
                            <button
                                key={song.song_id}
                                onClick={() => {
                                    onSelect(song);
                                    onClose();
                                }}
                                className="w-full flex items-center gap-4 p-3 rounded-xl bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/15 transition-all text-left group"
                            >
                                {song.art && (
                                    <img
                                        src={song.art}
                                        alt=""
                                        className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                                    />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-white font-semibold text-sm truncate">
                                        {song.title}
                                    </p>
                                    <p className="text-gray-400 text-xs truncate">
                                        {formatArtistNames(song.artist)}
                                    </p>
                                </div>
                                <span className="text-gray-600 text-xs font-mono shrink-0">
                                    #{song.song_id}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
