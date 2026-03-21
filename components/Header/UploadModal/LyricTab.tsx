import { LyricData, Song, UploadStatus } from "@composables/types";
import { authHeaders } from "@composables/useAuth";
import { API_BASE_URL } from "@composables/utils";
import { CheckCircle2, Upload } from "lucide-react";
import React, { useState } from "react";
import { RawJsonCollapse } from "./RawJsonCollapse";
import { StatusBadge } from "./UploadModal";

// ── Lyrics Tab ────────────────────────────────────────────────────────────────
export const LyricTab: React.FC<{
    songData: Song;
    lyrics: LyricData;
    /** App 層目前正在編輯的版本，上傳時直接使用 */
    activeLyricVersion: string;
    /** 從 R2 抓來的遠端歌詞，用於判斷是否有差異 */
    remoteLyrics: LyricData | null;
    onSuccess: () => void;
    onAuthError: () => void;
    onSaveSnapshot: () => void;
}> = ({
    songData,
    lyrics,
    activeLyricVersion,
    remoteLyrics,
    onSuccess,
    onAuthError,
    onSaveSnapshot,
}) => {
    const [status, setStatus] = useState<UploadStatus>("idle");
    const [errorMsg, setErrorMsg] = useState<string>();

    // 和遠端歌詞比較決定按鈕是否可用
    const hasChanges =
        remoteLyrics !== null &&
        JSON.stringify(lyrics) !== JSON.stringify(remoteLyrics);

    const handleUpload = async () => {
        const confirmed = window.confirm(
            `確定要上傳歌詞嗎？\n歌曲：${songData.title}\n版本：${activeLyricVersion}`,
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
                    version: activeLyricVersion,
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
            {/* 當前版本標示 */}
            <div className="flex items-center gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                    Uploading version:
                </p>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-primary/20 border border-primary/40 text-primary">
                    {activeLyricVersion}
                </span>
                <p className="text-[10px] text-gray-600 ml-1">
                    （在 Song Versions 中點擊鉛筆可切換版本）
                </p>
            </div>

            {/* 差異狀態提示 */}
            {remoteLyrics === null ? (
                <p className="text-sm text-gray-500 py-2">載入遠端歌詞中…</p>
            ) : !hasChanges ? (
                <p className="text-sm text-green-400 py-2 flex items-center gap-2">
                    <CheckCircle2 size={14} /> 與遠端歌詞無差異
                </p>
            ) : (
                <p className="text-sm text-amber-400 py-2">
                    本地 committed 歌詞與遠端「{activeLyricVersion}
                    」版本不同，可上傳更新。
                </p>
            )}

            {/* JSON preview */}
            <RawJsonCollapse label="Lyrics JSON Preview" data={lyrics} />

            {/* Footer row */}
            <div className="flex items-center justify-between pt-2">
                <StatusBadge status={status} error={errorMsg} />
                <button
                    onClick={handleUpload}
                    disabled={!hasChanges || status === "loading"}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/15 hover:bg-primary/25 border border-primary/40 text-primary rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Upload size={13} /> Upload Lyrics
                </button>
            </div>
        </div>
    );
};
