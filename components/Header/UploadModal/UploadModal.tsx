import React, { useState, useEffect } from "react";
import {
    Upload,
    FileJson2,
    ChevronDown,
    CheckCircle2,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { Song, Version, LyricData, UploadStatus } from "@composables/types";
import { API_BASE_URL, TSL_EDITOR_KEYS } from "@composables/utils";
import { authHeaders, useAuth } from "@composables/useAuth";
import { SongMetaEditorModal } from "@/components/Meta/EditorModal";
import { LyricsTab } from "./LyricTab";
import { MetaTab } from "./MetaTab";

// ── Comparable Song fields (excludes computed / volatile fields) ───────────────
export const COMPARABLE_FIELDS: (keyof Song)[] = [
    "title",
    "subtitle",
    "artist",
    "lyricist",
    "lang",
    "available",
    "hidden",
    "is_duet",
    "furigana",
    "folder",
    "art",
    "album",
    "versions",
    "translation",
    "credits",
];

export const StatusBadge: React.FC<{
    status: UploadStatus;
    error?: string;
}> = ({ status, error }) => {
    if (status === "idle") return null;
    if (status === "loading")
        return (
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
                <Loader2 size={13} className="animate-spin" /> Uploading…
            </span>
        );
    if (status === "success")
        return (
            <span className="flex items-center gap-1.5 text-xs text-green-400">
                <CheckCircle2 size={13} /> Uploaded
            </span>
        );
    return (
        <span className="flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle size={13} /> {error ?? "Error"}
        </span>
    );
};

// ── Main Modal ────────────────────────────────────────────────────────────────
type TabKey = "lyrics" | "metadata";

export const UploadModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    songData: Song;
    lyrics: LyricData;
    onRemoteSongDataRefreshed: (song: Song) => void;
}> = ({ isOpen, onClose, songData, lyrics, onRemoteSongDataRefreshed }) => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState<TabKey>("lyrics");
    const [remoteSongData, setRemoteSongData] = useState<Song | null>(null);

    // Fetch remote baseline whenever modal opens
    useEffect(() => {
        if (!isOpen || !songData.song_id) return;
        setRemoteSongData(null);
        fetch(`${API_BASE_URL}/songs/${songData.song_id}`)
            .then((r) => r.json())
            .then(setRemoteSongData)
            .catch(() => {});
    }, [isOpen, songData.song_id]);

    const handleAuthError = () => {
        // Persist current state then reload
        sessionStorage.setItem(
            TSL_EDITOR_KEYS.VIDEO_ID,
            sessionStorage.getItem("sync_editor_video_id") ?? "",
        );
        sessionStorage.setItem(TSL_EDITOR_KEYS.LYRICS, JSON.stringify(lyrics));
        sessionStorage.setItem(
            TSL_EDITOR_KEYS.SONG_DATA,
            JSON.stringify(songData),
        );
        sessionStorage.setItem(
            TSL_EDITOR_KEYS.VARIANT,
            JSON.stringify({
                song_id: songData.song_id,
                song_version:
                    (
                        songData.versions?.find((v) => v.default) ??
                        songData.versions?.[0]
                    )?.version ?? "original",
            }),
        );
        logout();
        window.location.reload();
    };

    const tabs: { key: TabKey; label: string }[] = [
        { key: "lyrics", label: "Lyrics" },
        { key: "metadata", label: "Metadata" },
    ];

    return (
        <SongMetaEditorModal
            isOpen={isOpen}
            onClose={onClose}
            title="Upload JSON"
            icon={<Upload size={20} />}
            accentColor="#A78BFA"
            maxWidthClass="max-w-2xl"
            footer={`Song: ${songData.title ?? "—"}  ·  ID: ${songData.song_id ?? "—"}`}
        >
            {/* Tab bar */}
            <div className="flex gap-1 mb-6 bg-black/30 p-1 rounded-xl border border-white/8">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            activeTab === t.key
                                ? "bg-primary/20 text-primary border border-primary/30"
                                : "text-gray-500 hover:text-gray-300"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {activeTab === "lyrics" ? (
                <LyricsTab
                    songData={songData}
                    lyrics={lyrics}
                    onSuccess={() => {}}
                    onAuthError={handleAuthError}
                />
            ) : (
                <MetaTab
                    songData={songData}
                    remoteSongData={remoteSongData}
                    onSuccess={(refreshed) => {
                        setRemoteSongData(refreshed);
                        onRemoteSongDataRefreshed(refreshed);
                    }}
                    onAuthError={handleAuthError}
                />
            )}
        </SongMetaEditorModal>
    );
};
