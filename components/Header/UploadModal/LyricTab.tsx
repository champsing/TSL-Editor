import { LyricData, Song, UploadStatus, Version } from "@composables/types";
import { authHeaders } from "@composables/useAuth";
import { API_BASE_URL } from "@composables/utils";
import { Upload } from "lucide-react";
import React, { useState } from "react";
import { RawJsonCollapse } from "./RawJsonCollapse";
import { StatusBadge } from "./UploadModal";

// ── Lyrics Tab ────────────────────────────────────────────────────────────────
export const LyricTab: React.FC<{
    songData: Song;
    lyrics: LyricData;
    remoteLyrics: LyricData | null; // 新增：從 R2 抓來的遠端歌詞
    onSuccess: () => void;
    onAuthError: () => void;
    onSaveSnapshot: () => void;
}> = ({
    songData,
    lyrics,
    remoteLyrics,
    onSuccess,
    onAuthError,
    onSaveSnapshot,
}) => {
    const versions: Version[] = songData.versions ?? [];
    const defaultIdx = versions.findIndex((v) => v.default) ?? 0;
    const [selectedIdx, setSelectedIdx] = useState(Math.max(0, defaultIdx));
    const [status, setStatus] = useState<UploadStatus>("idle");
    const [errorMsg, setErrorMsg] = useState<string>();

    // 和遠端歌詞比較，而非用 hasUncommittedChanges
    const hasChanges =
        remoteLyrics !== null &&
        JSON.stringify(lyrics) !== JSON.stringify(remoteLyrics);

    const handleUpload = async () => {
        const version = versions[selectedIdx];
        if (!version) return;

        const confirmed = window.confirm(
            `確定要上傳歌詞嗎？\n歌曲：${songData.title}\n版本：${version.version}`,
        );
        if (!confirmed) return;

        setStatus("loading");
        setErrorMsg(undefined);
        try {
            const res = await fetch(`${API_BASE_URL}/lyrics/update`, {
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
            onSaveSnapshot();
            setStatus("error");
            setErrorMsg(e?.message);
        }
    };

    return (
        <div className="space-y-5">
            {/* Version picker */}
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

            {/* 差異狀態提示 */}
            {remoteLyrics === null ? (
                <p className="text-sm text-gray-500 py-2">載入遠端歌詞中…</p>
            ) : !hasChanges ? (
                <p className="text-sm text-green-400 py-2 flex items-center gap-2">
                    ✓ 與遠端歌詞無差異
                </p>
            ) : (
                <p className="text-sm text-amber-400 py-2">
                    本地 committed 歌詞與遠端不同，可上傳更新。
                </p>
            )}

            {/* JSON preview */}
            <RawJsonCollapse label="Lyrics JSON Preview" data={lyrics} />

            {/* Footer row */}
            <div className="flex items-center justify-between pt-2">
                <StatusBadge status={status} error={errorMsg} />
                <button
                    onClick={handleUpload}
                    disabled={
                        !hasChanges ||
                        status === "loading" ||
                        versions.length === 0
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-primary/15 hover:bg-primary/25 border border-primary/40 text-primary rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Upload size={13} /> Upload Lyrics
                </button>
            </div>
        </div>
    );
};
