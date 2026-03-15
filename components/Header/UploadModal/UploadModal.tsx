import { SongMetaEditorModal } from "@/components/Meta/EditorModal";
import { LyricData, Song, Version } from "@composables/types";
import { authHeaders, useAuth } from "@composables/useAuth";
import { API_BASE_URL } from "@composables/utils";
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    FileJson2,
    Loader2,
    Upload,
} from "lucide-react";
import React, { useEffect, useState } from "react";

// ── sessionStorage keys ───────────────────────────────────────────────────────
export const TSL_EDITOR_KEYS = {
    VIDEO_ID: "tsl_editor_video_id",
    LYRICS: "tsl_editor_lyrics",
    SONG_DATA: "tsl_editor_song_data",
    VARIANT: "tsl_editor_song_variant",
} as const;

// ── Comparable Song fields ────────────────────────────────────────────────────
const COMPARABLE_FIELDS: (keyof Song)[] = [
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

// ── Status badge ──────────────────────────────────────────────────────────────
type UploadStatus = "idle" | "loading" | "success" | "error";

const StatusBadge: React.FC<{ status: UploadStatus; error?: string }> = ({
    status,
    error,
}) => {
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

// ── Raw JSON collapsible ──────────────────────────────────────────────────────
const RawJsonCollapse: React.FC<{ label: string; data: any }> = ({
    label,
    data,
}) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="mt-3 border border-white/8 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white/3 hover:bg-white/6 transition-colors"
            >
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                    {label}
                </span>
                <ChevronDown
                    size={13}
                    className={`text-gray-600 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
                />
            </button>
            {open && (
                <pre className="px-4 py-3 text-[11px] font-mono text-gray-400 bg-black/30 overflow-x-auto leading-relaxed whitespace-pre-wrap">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
};

// ── Lyrics Tab ────────────────────────────────────────────────────────────────
const LyricsTab: React.FC<{
    songData: Song;
    lyrics: LyricData;
    onSuccess: () => void;
    onAuthError: () => void;
}> = ({ songData, lyrics, onSuccess, onAuthError }) => {
    const versions: Version[] = songData.versions ?? [];
    const defaultIdx = Math.max(
        0,
        versions.findIndex((v) => v.default),
    );
    const [selectedIdx, setSelectedIdx] = useState(defaultIdx);
    const [status, setStatus] = useState<UploadStatus>("idle");
    const [errorMsg, setErrorMsg] = useState<string>();

    const handleUpload = async () => {
        const version = versions[selectedIdx];
        if (!version) return;
        if (
            !window.confirm(
                `確定要上傳歌詞嗎？\n歌曲：${songData.title}\n版本：${version.version}`,
            )
        )
            return;

        setStatus("loading");
        setErrorMsg(undefined);
        try {
            const res = await fetch(`${API_BASE_URL}/api/songs/lyrics/update`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders(),
                },
                body: JSON.stringify({
                    song_id: songData.song_id,
                    folder: songData.folder,
                    version: version.version,
                    lyrics,
                }),
            });
            if (res.status === 401) {
                onAuthError();
                return;
            }
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                throw new Error(d?.message ?? `Error ${res.status}`);
            }
            setStatus("success");
            onSuccess();
        } catch (e: any) {
            setStatus("error");
            setErrorMsg(e?.message);
        }
    };

    return (
        <div className="space-y-5">
            <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-2">
                    Version
                </p>
                <div className="flex flex-wrap gap-2">
                    {versions.map((v, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedIdx(i)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                selectedIdx === i
                                    ? "bg-primary/20 border-primary/50 text-primary"
                                    : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                            }`}
                        >
                            {v.version}
                        </button>
                    ))}
                </div>
            </div>
            <RawJsonCollapse label="Lyrics JSON Preview" data={lyrics} />
            <div className="flex items-center justify-between pt-2">
                <StatusBadge status={status} error={errorMsg} />
                <button
                    onClick={handleUpload}
                    disabled={status === "loading" || versions.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/15 hover:bg-primary/25 border border-primary/40 text-primary rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Upload size={13} /> Upload Lyrics
                </button>
            </div>
        </div>
    );
};

// ── Metadata Tab ──────────────────────────────────────────────────────────────
const MetadataTab: React.FC<{
    songData: Song;
    remoteSongData: Song | null;
    onSuccess: (refreshed: Song) => void;
    onAuthError: () => void;
}> = ({ songData, remoteSongData, onSuccess, onAuthError }) => {
    const changedFields = remoteSongData
        ? diffSong(remoteSongData, songData)
        : [];
    const [status, setStatus] = useState<UploadStatus>("idle");
    const [errorMsg, setErrorMsg] = useState<string>();

    const handleUpload = async () => {
        if (
            !window.confirm(
                `確定要上傳歌曲資料嗎？\n歌曲：${songData.title}\n共 ${changedFields.length} 個欄位有變更。`,
            )
        )
            return;

        setStatus("loading");
        setErrorMsg(undefined);
        try {
            const body: Record<string, any> = { song_id: songData.song_id };
            changedFields.forEach((f) => {
                body[f] = (songData as any)[f];
            });

            const res = await fetch(`${API_BASE_URL}/api/songs/update`, {
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
            const refreshed = await fetch(
                `${API_BASE_URL}/songs/${songData.song_id}`,
            ).then((r) => r.json());
            setStatus("success");
            onSuccess(refreshed);
        } catch (e: any) {
            setStatus("error");
            setErrorMsg(e?.message);
        }
    };

    if (!remoteSongData)
        return (
            <p className="text-sm text-gray-500 py-6 text-center">
                載入遠端資料中…
            </p>
        );

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

// ── Main Modal ────────────────────────────────────────────────────────────────
type TabKey = "lyrics" | "metadata" | "viewjson";

export const UploadModal: React.FC<{
    isOpen: boolean;
    songData: Song;
    lyrics: LyricData;
    onClose: () => void;
    onRemoteSongDataRefreshed: (song: Song) => void;
    onSwitchToJson: () => void;
}> = ({
    isOpen,
    songData,
    lyrics,
    onClose,
    onRemoteSongDataRefreshed,
    onSwitchToJson,
}) => {
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState<TabKey>("lyrics");
    const [remoteSongData, setRemoteSongData] = useState<Song | null>(null);

    useEffect(() => {
        if (!isOpen || !songData.song_id) return;
        setRemoteSongData(null);
        fetch(`${API_BASE_URL}/songs/${songData.song_id}`)
            .then((r) => r.json())
            .then(setRemoteSongData)
            .catch(() => {});
    }, [isOpen, songData.song_id]);

    const handleAuthError = () => {
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
            footer={`Song: ${songData.title ?? "—"}  ·  ID: ${songData.song_id ?? "—"}`}
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
                <LyricsTab
                    songData={songData}
                    lyrics={lyrics}
                    onSuccess={() => {}}
                    onAuthError={handleAuthError}
                />
            )}
            {activeTab === "metadata" && (
                <MetadataTab
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
