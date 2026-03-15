import { Song, UploadStatus } from "@composables/types";
import { authHeaders } from "@composables/useAuth";
import { API_BASE_URL } from "@composables/utils";
import { CheckCircle2, Upload } from "lucide-react";
import React, { useState } from "react";
import { RawJsonCollapse } from "./RawJsonCollapse";
import { COMPARABLE_FIELDS, StatusBadge } from "./UploadModal";

const FIELD_LABELS: Partial<Record<keyof Song, string>> = {
    title: "Title",
    subtitle: "Subtitle",
    artist: "Artist",
    lyricist: "Lyricist",
    lang: "Language",
    available: "Available",
    hidden: "Hidden",
    is_duet: "Duet Mode",
    furigana: "Furigana",
    folder: "Folder",
    art: "Cover Art",
    album: "Album",
    versions: "Versions",
    translation: "Translation",
    credits: "Credits",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function diffSong(remote: Song, local: Song): (keyof Song)[] {
    return COMPARABLE_FIELDS.filter(
        (k) => JSON.stringify(remote[k]) !== JSON.stringify(local[k]),
    );
}

function renderValue(v: any): string {
    if (v === null || v === undefined) return "—";
    if (typeof v === "boolean") return v ? "Yes" : "No";
    if (typeof v === "object") return JSON.stringify(v, null, 2);
    return String(v);
}

// ── Metadata Tab ──────────────────────────────────────────────────────────────
export const MetaTab: React.FC<{
    songData: Song;
    remoteSongData: Song | null;
    onSuccess: (refreshed: Song) => void;
    onAuthError: () => void;
    onSaveSnapshot: () => void;
}> = ({ songData, remoteSongData, onSuccess, onAuthError, onSaveSnapshot }) => {
    const changedFields = remoteSongData
        ? diffSong(remoteSongData, songData)
        : [];
    const [status, setStatus] = useState<UploadStatus>("idle");
    const [errorMsg, setErrorMsg] = useState<string>();

    const handleUpload = async () => {
        const confirmed = window.confirm(
            `確定要上傳歌曲資料嗎？\n歌曲：${songData.title}\n共 ${changedFields.length} 個欄位有變更。`,
        );
        if (!confirmed) return;

        setStatus("loading");
        setErrorMsg(undefined);
        try {
            const body: Record<string, any> = { song_id: songData.song_id };
            changedFields.forEach((f) => {
                body[f] = (songData as any)[f];
            });

            const res = await fetch(`${API_BASE_URL}/songs/update`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders(),
                },
                body: JSON.stringify(body),
            });
            if (res.status === 401) {
                onAuthError();
                return;
            }
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d?.message ?? `Error ${res.status}`);
            }

            // Refresh remote baseline
            const refreshed = await fetch(
                `${API_BASE_URL}/songs/${songData.song_id}`,
            ).then((r) => r.json());
            setStatus("success");
            onSuccess(refreshed);
        } catch (e: any) {
            onSaveSnapshot(); // ← 不管什麼錯先存
            setStatus("error");
            setErrorMsg(e?.message);
        }
    };

    if (!remoteSongData) {
        return (
            <p className="text-sm text-gray-500 py-6 text-center">
                載入遠端資料中…
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {changedFields.length === 0 ? (
                <div className="flex items-center gap-2 text-sm text-green-400 py-4">
                    <CheckCircle2 size={16} /> 與遠端資料無差異
                </div>
            ) : (
                <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                        Changed Fields ({changedFields.length})
                    </p>
                    {changedFields.map((field) => (
                        <div
                            key={field}
                            className="px-3 py-2.5 rounded-xl bg-white/3 border border-white/8"
                        >
                            <p className="text-xs font-bold text-gray-300 mb-1">
                                {FIELD_LABELS[field] ?? field}
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                                <div>
                                    <span className="text-red-400/60 uppercase tracking-wider text-[9px]">
                                        Remote
                                    </span>
                                    <p className="text-red-300/80 mt-0.5 truncate">
                                        {renderValue(
                                            (remoteSongData as any)[field],
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-green-400/60 uppercase tracking-wider text-[9px]">
                                        Local
                                    </span>
                                    <p className="text-green-300/80 mt-0.5 truncate">
                                        {renderValue((songData as any)[field])}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <RawJsonCollapse label="Full Song JSON" data={songData} />

            {/* Footer row */}
            <div className="flex items-center justify-between pt-2">
                <StatusBadge status={status} error={errorMsg} />
                <button
                    onClick={handleUpload}
                    disabled={
                        status === "loading" || changedFields.length === 0
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-primary/15 hover:bg-primary/25 border border-primary/40 text-primary rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Upload size={13} /> Upload Metadata
                </button>
            </div>
        </div>
    );
};
