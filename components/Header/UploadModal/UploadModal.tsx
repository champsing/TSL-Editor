import { SongMetaEditorModal } from "@/components/Meta/EditorModal";
import { LyricData, Song } from "@composables/types";
import { useAuth } from "@composables/useAuth";
import { API_BASE_URL } from "@composables/utils";
import {
    AlertCircle,
    CheckCircle2,
    FileJson2,
    Loader2,
    Upload,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { LyricTab } from "./LyricTab";
import { MetaTab } from "./MetaTab";

// ── sessionStorage keys ───────────────────────────────────────────────────────
export const TSL_EDITOR_KEYS = {
    VIDEO_ID: "tsl_editor_video_id",
    LYRICS: "tsl_editor_lyrics",
    SONG_DATA: "tsl_editor_song_data",
    VARIANT: "tsl_editor_song_variant",
} as const;

// ── Comparable Song fields ────────────────────────────────────────────────────
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

// ── Status badge ──────────────────────────────────────────────────────────────
type UploadStatus = "idle" | "loading" | "success" | "error";

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

// ── 抓遠端歌詞 ────────────────────────────────────────────────────────────────
async function fetchRemoteLyrics(
    songId: number,
    folder: string,
    version: string,
): Promise<LyricData | null> {
    try {
        const url = `https://lyric.timesl.online/${songId}_${folder}/${version}.json`;
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

// ── Main Modal ────────────────────────────────────────────────────────────────
type TabKey = "lyrics" | "metadata";

export const UploadModal: React.FC<{
    isOpen: boolean;
    songData: Song;
    lyrics: LyricData;
    /** App 層目前正在編輯的版本名稱，用於遠端比對 */
    activeLyricVersion: string;
    hasUncommittedChanges: boolean;
    onClose: () => void;
    onRemoteSongDataRefreshed: (song: Song) => void;
    onSwitchToJson: () => void;
}> = ({
    isOpen,
    songData,
    lyrics,
    activeLyricVersion,
    hasUncommittedChanges,
    onClose,
    onRemoteSongDataRefreshed,
    onSwitchToJson,
}) => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState<TabKey>("lyrics");
    const [remoteSongData, setRemoteSongData] = useState<Song | null>(null);
    const [remoteLyrics, setRemoteLyrics] = useState<LyricData | null>(null);

    // 抓遠端歌曲 metadata
    useEffect(() => {
        if (!isOpen || !songData.song_id) return;
        setRemoteSongData(null);
        fetch(`${API_BASE_URL}/songs/${songData.song_id}`)
            .then((r) => r.json())
            .then(setRemoteSongData)
            .catch(() => {});
    }, [isOpen, songData.song_id]);

    // 抓遠端歌詞：以 activeLyricVersion 為準
    useEffect(() => {
        if (!isOpen || !songData.song_id || !songData.folder) return;
        setRemoteLyrics(null);
        fetchRemoteLyrics(
            songData.song_id,
            songData.folder,
            activeLyricVersion,
        ).then(setRemoteLyrics);
    }, [isOpen, songData.song_id, songData.folder, activeLyricVersion]);

    const saveSnapshot = () => {
        sessionStorage.setItem(
            TSL_EDITOR_KEYS.VIDEO_ID,
            sessionStorage.getItem(TSL_EDITOR_KEYS.VIDEO_ID) ?? "",
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
                song_version: activeLyricVersion,
            }),
        );
    };

    const handleAuthError = () => {
        saveSnapshot();
        logout();
        window.location.reload();
    };

    const tabs: { key: TabKey; label: string }[] = [
        { key: "metadata", label: "Metadata" },
        { key: "lyrics", label: "Lyrics" },
    ];

    return (
        <SongMetaEditorModal
            isOpen={isOpen}
            onClose={onClose}
            title="Upload JSON"
            actions={
                <button
                    onClick={onSwitchToJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all"
                >
                    <FileJson2 size={13} />
                    View Lyric Data
                </button>
            }
            icon={<Upload size={20} />}
            accentColor="#A78BFA"
            maxWidthClass="max-w-2xl"
            footer={`Song: ${songData.title ?? "—"}  ·  ID: ${songData.song_id ?? "—"}  ·  Version: ${activeLyricVersion}`}
        >
            {/* Tab bar */}
            <div className="flex gap-1 mb-5 bg-black/30 p-1 rounded-4xl border border-white/8">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`flex-1 py-2 rounded-4xl text-xs font-bold uppercase tracking-wider transition-all ${
                            activeTab === t.key
                                ? "bg-primary/20 text-primary border border-primary/30"
                                : "text-gray-500 hover:text-gray-300"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {activeTab === "lyrics" && (
                <LyricTab
                    songData={songData}
                    lyrics={lyrics}
                    activeLyricVersion={activeLyricVersion}
                    remoteLyrics={remoteLyrics}
                    onSuccess={() => {}}
                    onAuthError={handleAuthError}
                    onSaveSnapshot={saveSnapshot}
                />
            )}
            {activeTab === "metadata" && (
                <MetaTab
                    songData={songData}
                    remoteSongData={remoteSongData}
                    onSuccess={(refreshed) => {
                        setRemoteSongData(refreshed);
                        onRemoteSongDataRefreshed(refreshed);
                    }}
                    onAuthError={handleAuthError}
                    onSaveSnapshot={saveSnapshot}
                />
            )}
        </SongMetaEditorModal>
    );
};
