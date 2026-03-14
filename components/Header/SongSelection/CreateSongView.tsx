import { Version } from "@composables/types";
import { Plus, ArrowLeft, Layers, Music, AlertCircle } from "lucide-react";
import React, { useState } from "react";
import { authHeaders } from "@composables/useAuth";
import { API_BASE_URL } from "@/composables/utils";
import { VersionsEditor } from "./VersionEditor";
import { inputClassSong } from "./SongSelectionModal";

// ── Create Song View ──────────────────────────────────────────────────────────
type CreateStep = "info" | "versions";

export const CreateSongView: React.FC<{
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
    const hasOriginal = versions.some(
        (v) => v.version === "original" && v.id.trim() !== "",
    );

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
                    onClick={() => {
                        if (step === "info") onBack();
                        else setStep("info");
                    }}
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
                                className={inputClassSong}
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
                                className={`${inputClassSong} font-mono`}
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
                        <div className="flex items-center gap-3">
                            {!hasOriginal && (
                                <span className="flex items-center gap-1.5 text-red-400 text-xs">
                                    <AlertCircle size={13} />
                                    An original version with YouTube ID is
                                    required.
                                </span>
                            )}
                            <button
                                onClick={handleCreate}
                                disabled={isSubmitting || !hasOriginal}
                                className="px-5 py-2 bg-primary text-black font-bold text-sm rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
                            >
                                {isSubmitting ? "Creating…" : "Create Song"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
