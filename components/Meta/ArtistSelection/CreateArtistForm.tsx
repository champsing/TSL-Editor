import { authHeaders } from "@/composables/useAuth";
import { API_BASE_URL } from "@/composables/utils";
import { AlertCircle, Plus } from "lucide-react";
import React, { useState } from "react";
import { inputClassArtist } from "./ArtistSelectModal";

// ── Create Artist inline form ─────────────────────────────────────────────────
export const CreateArtistForm: React.FC<{
    onCreated: (artistId: number, name: string) => void;
    onCancel: () => void;
}> = ({ onCreated, onCancel }) => {
    const [artistId, setArtistId] = useState("");
    const [originalName, setOriginalName] = useState("");
    const [romajiName, setRomajiName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canSubmit =
        artistId.trim() !== "" &&
        !isNaN(Number(artistId)) &&
        originalName.trim() !== "";

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`$${API_BASE_URL}/artists/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders(),
                },
                body: JSON.stringify({
                    artist_id: Number(artistId),
                    original_name: originalName.trim(),
                    romaji_name: romajiName.trim() || undefined,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data?.message ?? `Error ${res.status}`);
                return;
            }
            onCreated(Number(artistId), originalName.trim());
        } catch {
            setError("Network error, please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border-t border-white/10 bg-black/20 p-4 space-y-3">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Plus size={11} /> New Artist
            </p>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <p className="text-[10px] text-gray-500 mb-1">Artist ID</p>
                    <input
                        autoFocus
                        value={artistId}
                        onChange={(e) => setArtistId(e.target.value)}
                        type="number"
                        className={`${inputClassArtist} font-mono`}
                        placeholder="e.g. 123456"
                    />
                </div>
                <div>
                    <p className="text-[10px] text-gray-500 mb-1">
                        Original Name
                    </p>
                    <input
                        value={originalName}
                        onChange={(e) => setOriginalName(e.target.value)}
                        className={inputClassArtist}
                        placeholder="e.g. 米津玄師"
                        onKeyDown={(e) =>
                            e.key === "Enter" && canSubmit && handleSubmit()
                        }
                    />
                </div>
                <div className="col-span-2">
                    <p className="text-[10px] text-gray-500 mb-1">
                        Romaji Name{" "}
                        <span className="text-gray-600">(optional)</span>
                    </p>
                    <input
                        value={romajiName}
                        onChange={(e) => setRomajiName(e.target.value)}
                        className={inputClassArtist}
                        placeholder="e.g. Kenshi Yonezu"
                        onKeyDown={(e) =>
                            e.key === "Enter" && canSubmit && handleSubmit()
                        }
                    />
                </div>
            </div>
            {error && (
                <p className="flex items-center gap-1.5 text-xs text-red-400">
                    <AlertCircle size={12} /> {error}
                </p>
            )}
            <div className="flex justify-between items-center pt-1">
                <button
                    onClick={onCancel}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading || !canSubmit}
                    className="px-4 py-1.5 bg-primary text-black text-xs font-bold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
                >
                    {loading ? "Creating…" : "Create Artist"}
                </button>
            </div>
        </div>
    );
};
