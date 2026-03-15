import { SongMetaEditorModal } from "@/components/Meta/EditorModal";
import { LyricData, Song, Version } from "@composables/types";
import { authHeaders, useAuth } from "@composables/useAuth";
import { API_BASE_URL } from "@composables/utils";
import {
    AlertCircle,
    AlertTriangle,
    Check,
    CheckCircle2,
    ChevronDown,
    Download,
    FileJson2,
    Loader2,
    Upload,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

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

// ── View JSON Tab（移植自 JsonModal）────────────────────────────────────────────
const ViewJsonTab: React.FC<{
    committedJson: string;
    uncommittedJson: string;
    lyrics: LyricData;
    onUpdateUncommitted: (json: string) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({
    committedJson,
    uncommittedJson,
    lyrics,
    onUpdateUncommitted,
    onFileUpload,
}) => {
    type JsonTab = "committed" | "uncommitted";
    const [activeTab, setActiveTab] = useState<JsonTab>("committed");
    const [editableJson, setEditableJson] = useState(uncommittedJson);
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditableJson(uncommittedJson);
    }, [uncommittedJson]);

    const isEditable = activeTab === "uncommitted";
    const currentContent = isEditable ? editableJson : committedJson;

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(currentContent);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }, [currentContent]);

    const handleDownload = useCallback(() => {
        const blob = new Blob([JSON.stringify(lyrics, null, 4)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "original.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsDownloaded(true);
        setTimeout(() => setIsDownloaded(false), 2000);
    }, [lyrics]);

    const handleApply = () => {
        try {
            if (!window.confirm("您確定要將JSON更動應用於尚未提交的歌詞嗎？"))
                return;
            JSON.parse(editableJson);
            onUpdateUncommitted(editableJson);
        } catch {
            alert(
                "Invalid JSON format. Please fix it before applying changes.",
            );
        }
    };

    const btnBase =
        "group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-all duration-200";

    return (
        <div className="flex flex-col gap-0" style={{ height: "55vh" }}>
            {/* Sub-tab bar */}
            <div className="flex border-b border-white/8 mb-0">
                {(["committed", "uncommitted"] as JsonTab[]).map((t) => (
                    <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-2 ${
                            activeTab === t
                                ? "text-primary border-b-2 border-primary"
                                : "text-gray-500 hover:text-gray-300"
                        }`}
                    >
                        {t === "committed" ? "Committed" : "Uncommitted"}
                        <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                                t === "committed"
                                    ? "text-emerald-300 bg-emerald-900/40 border-emerald-700"
                                    : "text-yellow-300 bg-yellow-900/40 border-yellow-700"
                            }`}
                        >
                            {t === "committed" ? "Read-Only" : "Editable"}
                        </span>
                    </button>
                ))}
            </div>

            {/* Warning */}
            {isEditable && (
                <div className="px-3 py-2.5 bg-red-800/20 border-b border-red-700/40 text-red-300 flex items-center gap-2 text-xs">
                    <AlertTriangle
                        size={13}
                        className="text-red-400 shrink-0"
                    />
                    應用前請確保 JSON 格式正確，否則將可能造成災難性後果。
                </div>
            )}

            {/* Textarea */}
            <textarea
                className={`flex-1 text-green-400 p-3 text-xs resize-none outline-none font-mono leading-relaxed ${
                    isEditable ? "bg-[#251e1e]" : "bg-[#1e1e1e]"
                }`}
                readOnly={!isEditable}
                value={currentContent}
                onChange={
                    isEditable
                        ? (e) => setEditableJson(e.target.value)
                        : undefined
                }
                placeholder="JSON Content"
            />

            {/* Toolbar */}
            <div className="flex items-center justify-between pt-3 border-t border-white/8">
                <div className="flex gap-2">
                    {isEditable && (
                        <label
                            className={`${btnBase} bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-gray-400 hover:text-white cursor-pointer`}
                        >
                            <Upload size={13} />
                            <span className="uppercase tracking-wide text-xs">
                                Import
                            </span>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                className="hidden"
                                onChange={(e) => {
                                    onFileUpload(e);
                                    if (fileInputRef.current)
                                        fileInputRef.current.value = "";
                                }}
                            />
                        </label>
                    )}
                    <button
                        onClick={handleDownload}
                        disabled={isDownloaded}
                        className={`${btnBase} ${
                            isDownloaded
                                ? "bg-green-500/15 border-green-500/30 text-green-400 cursor-not-allowed"
                                : "bg-white/5 hover:bg-primary/10 border-white/10 hover:border-primary/40 text-gray-400 hover:text-primary cursor-pointer"
                        }`}
                    >
                        {isDownloaded ? (
                            <Check size={13} />
                        ) : (
                            <Download
                                size={13}
                                className="group-hover:scale-110 transition-transform"
                            />
                        )}
                        <span className="uppercase tracking-wide text-xs">
                            {isDownloaded ? "Downloaded!" : "Download"}
                        </span>
                    </button>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleCopy}
                        disabled={isCopied}
                        className={`${btnBase} ${
                            isCopied
                                ? "bg-green-500/15 border-green-500/30 text-green-400 cursor-not-allowed"
                                : "bg-white/5 hover:bg-primary/10 border-white/10 hover:border-primary/40 text-gray-400 hover:text-primary cursor-pointer"
                        }`}
                    >
                        {isCopied && <Check size={13} />}
                        <span className="uppercase tracking-wide text-xs">
                            {isCopied ? "Copied!" : "Copy JSON"}
                        </span>
                    </button>
                    {isEditable && (
                        <button
                            onClick={handleApply}
                            className={`${btnBase} bg-red-500/10 hover:bg-red-500/20 border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 cursor-pointer`}
                        >
                            <span className="uppercase tracking-wide text-xs">
                                Apply Changes
                            </span>
                        </button>
                    )}
                </div>
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
    committedJson: string;
    uncommittedJson: string;
    onClose: () => void;
    onRemoteSongDataRefreshed: (song: Song) => void;
    onUpdateUncommitted: (json: string) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSwitchToJson: () => void;
}> = ({
    isOpen,
    songData,
    lyrics,
    committedJson,
    uncommittedJson,
    onClose,
    onRemoteSongDataRefreshed,
    onUpdateUncommitted,
    onFileUpload,
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
        { key: "lyrics", label: "Lyrics" },
        { key: "metadata", label: "Metadata" },
        { key: "viewjson", label: "View JSON" },
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
                    View JSON
                </button>
            }
            icon={<Upload size={20} />}
            accentColor="#A78BFA"
            maxWidthClass="max-w-2xl"
            footer={`Song: ${songData.title ?? "—"}  ·  ID: ${songData.song_id ?? "—"}`}
        >
            {/* Tab bar */}
            <div className="flex gap-1 mb-5 bg-black/30 p-1 rounded-xl border border-white/8">
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
            {activeTab === "viewjson" && (
                <ViewJsonTab
                    committedJson={committedJson}
                    uncommittedJson={uncommittedJson}
                    lyrics={lyrics}
                    onUpdateUncommitted={onUpdateUncommitted}
                    onFileUpload={onFileUpload}
                />
            )}
        </SongMetaEditorModal>
    );
};
