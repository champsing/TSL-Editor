import React, { useEffect, useRef } from "react";
import { PreviewModal } from "./components/PreviewModal";
import { JsonModal } from "./components/JsonModal"; // 新增 Modal 組件 (如下)
import { DiffModal } from "./components/DiffModal"; // 匯入新的 DiffModal 組件
import { EditorHeader } from "./components/EditorHeader";
import { EditorSidebar } from "./components/EditorSidebar";
import { useLyricEditor } from "./hooks/useLyricEditor";
import { LyricData, Song } from "./types";
import { Music, FileText } from "lucide-react"; // 導入圖標
import { LyricsEditorTab } from "./components/LyricsEditorTab";
import { SongMetaEditorTab } from "./components/SongMetaEditorTab";

// --- Main App Component ---
function App() {
    const {
        // State
        videoId,
        tempVideoId,
        setTempVideoId,
        stagedLyrics,
        lyrics,
        setStagedLyrics,
        playerTime,
        setPlayerTime,
        isPlaying,
        setIsPlaying,
        jsonModalOpen,
        setJsonModalOpen,
        previewModalOpen,
        setPreviewModalOpen,
        editingLineIndex,
        setEditingLineIndex,
        currentLineIndex,
        activeLineIndices, // 👈 從 Hook 取得 activeLineIndices
        hasUncommittedChanges,
        // Refs
        playerRef,
        // Actions
        handleVideoLoad,
        handleSeek,
        handlePlayPause,
        commitLyrics,
        discardChanges,
        handleStamp,
        updateLine,
        deleteLine,
        addLine,
        copyJson,
        handleFileUpload,
    } = useLyricEditor();

    // 新增用於控制 Diff Modal 開啟/關閉的 state
    const [diffModalOpen, setDiffModalOpen] = React.useState(false);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [activeTab, setActiveTab] = React.useState<"lyrics" | "meta">("meta");

    // 假設這是從伺服器取得或初始化歌曲資料
    const [songData, setSongData] = React.useState<Song>({
        song_id: 1867354081,
        available: true,
        hidden: false,
        folder: "Mrs GREEN APPLE - lulu",
        art: "https://is1-ssl.mzstatic.com/image/thumb/Video221/v4/c6/37/51/c6375129-a4a6-6fca-fd1b-bd02b788b58f/Joba6e2e2f2-78fa-4fc7-b378-6362ebfb8e21-213296121-PreviewImage_Preview_Image_Intermediate_nonvideo_sdr_417683161_2502934387-Time1767836143126.png/900x900bb.webp",
        artist: "96222103300",
        lyricist: "1360524149",
        title: "lulu.",
        subtitle: "",
        album: null,
        versions: [
            { version: "original", link: "4REuyY89tfw", duration: "4:30" },
        ], // 這裡對應一下你 types.ts 的 Version 結構
        is_duet: false,
        furigana: false,
        translation: { available: false, author: "", cite: "" },
        updated_at: "2026-01-30",
        lang: "ja",
        credits: { performance: [], song_writing: [], engineering: [] },
    });

    // 自動滾動到當前行 (使用 committed lyrics 的索引)
    useEffect(() => {
        if (previewModalOpen || diffModalOpen) return;

        if (currentLineIndex !== -1 && scrollContainerRef.current) {
            // 使用 setTimeout 將滾動操作推遲到瀏覽器繪製循環結束後
            const timeoutId = setTimeout(() => {
                const currentLine =
                    document.getElementsByClassName("is-current")[0];

                // 確保找到元素再滾動
                if (currentLine) {
                    currentLine.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            }, 0); // 設置 0 毫秒延遲，讓它在當前執行棧結束後執行

            // 清理函數：在組件卸載或依賴項變化前清除定時器
            return () => clearTimeout(timeoutId);
        }
        // 如果沒有滾動，也可能需要清理之前的定時器
        // 這裡我們只在進入滾動邏輯時設置 timeoutId
        // 也可以 return 一個空的清理函數：
        return () => {};
    }, [currentLineIndex, previewModalOpen, diffModalOpen]);

    return (
        <div className="flex flex-col h-screen bg-secondary">
            {/* Header (標頭) - 拆分到 EditorHeader */}
            <EditorHeader
                tempVideoId={tempVideoId}
                setTempVideoId={setTempVideoId}
                onVideoLoad={handleVideoLoad}
                hasUncommittedChanges={hasUncommittedChanges}
                commitLyrics={commitLyrics}
                discardChanges={discardChanges}
                onViewDiff={() => setDiffModalOpen(true)} // 連接 Diff 按鈕到新的 state
            />

            <div className="flex flex-1 overflow-hidden relative">
                {/* 根據 Tab 切換顯示的組件 */}
                {activeTab === "lyrics" ? (
                    <LyricsEditorTab
                        isPlaying={isPlaying}
                        playerTime={playerTime}
                        stagedLyrics={stagedLyrics}
                        activeLineIndices={activeLineIndices}
                        editingLineIndex={editingLineIndex}
                        setEditingLineIndex={setEditingLineIndex}
                        addLine={addLine}
                        updateLine={updateLine}
                        deleteLine={deleteLine}
                        handleStamp={handleStamp}
                        handleSeek={handleSeek}
                        setPreviewModalOpen={setPreviewModalOpen}
                        scrollContainerRef={scrollContainerRef}
                    />
                ) : (
                    <SongMetaEditorTab
                        songData={songData}
                        setSongData={setSongData}
                    />
                )}

                {/* Right Panel: Fixed Player - 拆分到 EditorSidebar */}
                <EditorSidebar
                    videoId={videoId}
                    playerRef={playerRef}
                    onTimeUpdate={setPlayerTime}
                    onIsPlayingChange={setIsPlaying}
                    onFileUpload={handleFileUpload}
                    onViewJson={() => setJsonModalOpen(true)}
                    lyrics={lyrics}
                />
            </div>

            {/* JSON Modal */}
            {jsonModalOpen && (
                <JsonModal
                    committedJson={JSON.stringify(lyrics, null, 4)}
                    uncommittedJson={JSON.stringify(stagedLyrics, null, 4)}
                    onClose={() => setJsonModalOpen(false)}
                    onCopy={copyJson}
                    onUpdateUncommitted={(newJson) => {
                        try {
                            // 1. 嘗試將 JSON 字串解析為 LyricData 物件
                            const parsedData = JSON.parse(newJson) as LyricData;

                            // 2. 如果解析成功，更新 stagedLyrics 狀態
                            setStagedLyrics(parsedData);
                        } catch (error) {
                            // 3. 如果解析失敗 (例如 JSON 格式錯誤)
                            console.error(
                                "Failed to parse JSON for uncommitted data:",
                                error,
                            );
                        }
                    }}
                />
            )}

            {/* 底部導航切換器 (玻璃質感版本) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 saturate-150 ring-1 ring-white/5">
                <button
                    onClick={() => setActiveTab("meta")}
                    className={`
            flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 group
            ${
                activeTab === "meta"
                    ? "bg-primary text-black font-bold shadow-[0_0_20px_rgba(74,194,215,0.4)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
            }
        `}
                >
                    <Music
                        size={18}
                        className={`transition-transform duration-300 ${activeTab === "meta" ? "scale-110" : "group-hover:scale-110"}`}
                    />
                    <span className="tracking-wide text-sm">Song Info</span>
                </button>

                {/* 分隔線 (選擇性) */}
                <div className="w-px h-4 bg-white/10 mx-1" />

                <button
                    onClick={() => setActiveTab("lyrics")}
                    className={`
            flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 group
            ${
                activeTab === "lyrics"
                    ? "bg-primary text-black font-bold shadow-[0_0_20px_rgba(74,194,215,0.4)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
            }
        `}
                >
                    <FileText
                        size={18}
                        className={`transition-transform duration-300 ${activeTab === "lyrics" ? "scale-110" : "group-hover:scale-110"}`}
                    />
                    <span className="tracking-wide text-sm">Lyrics Editor</span>
                </button>
            </div>

            {/* Preview Modal */}
            {previewModalOpen && (
                <PreviewModal
                    lyrics={stagedLyrics}
                    currentTime={playerTime}
                    onClose={() => setPreviewModalOpen(false)}
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                    onSeek={handleSeek}
                />
            )}

            {/* Diff Modal */}
            {diffModalOpen && (
                <DiffModal
                    // 已提交的 JSON (Committed)
                    committedJson={JSON.stringify(lyrics, null, 4)}
                    // 當前編輯中的 JSON (Uncommitted)
                    uncommittedJson={JSON.stringify(stagedLyrics, null, 4)}
                    onClose={() => setDiffModalOpen(false)}
                />
            )}
        </div>
    );
}

export default App;
