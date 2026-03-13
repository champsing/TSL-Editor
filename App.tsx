import { useEffect, useRef, useState } from "react";
import { PreviewModal } from "./components/Lyrics/PreviewModal";
import { JsonModal } from "./components/Header/JsonModal"; // 新增 Modal 組件 (如下)
import { DiffModal } from "./components/Lyrics/DiffModal"; // 匯入新的 DiffModal 組件
import { EditorHeader } from "./components/Header/EditorHeader";
import { EditorSidebar } from "./components/Lyrics/EditorSidebar";
import { useLyricEditor } from "./hooks/useLyricEditor";
import { LyricData, Song, Version } from "./composables/types";
import { Music, FileText } from "lucide-react"; // 導入圖標
import { LyricsEditorTab } from "./components/Lyrics/LyricsEditorTab";
import { SongMetaEditorTab } from "./components/Meta/EditorTab";
import { SongSelectionModal } from "./components/Header/SongSelectionModal";
import { API_BASE_URL } from "./composables/utils";
import { useAuth } from "@composables/useAuth";



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
        activeLineIndices,
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
        handleFileUpload,
        setVideoId,
        loadLyricsByPath,
    } = useLyricEditor();

    const { user } = useAuth();

    // 新增用於控制 Diff Modal 開啟/關閉的 state
    const [diffModalOpen, setDiffModalOpen] = useState(false);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [activeTab, setActiveTab] = useState<"lyrics" | "meta">("meta");

    const [isSongModalOpen, setIsSongModalOpen] = useState(false); // 控制 Modal

    useEffect(() => {
        const loadLatestSong = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/songs/list`);
                const songs: Song[] = await res.json();
                if (!songs.length) return;

                // 取 updated_at 最新的一首
                const latest = songs.reduce((a, b) =>
                    a.updated_at > b.updated_at ? a : b,
                );
                await handleSongSelect(latest);
            } catch (e) {
                console.error("Failed to load latest song on startup:", e);
            }
        };

        loadLatestSong();
    }, []); // 只在 mount 時執行一次

    // 假設這是從伺服器取得或初始化歌曲資料
    const [songData, setSongData] = useState<Song>({} as Song);

    // 🚨 處理歌曲選取的核心邏輯
    const handleSongSelect = async (selectedSong: Song) => {
        // 🚨 增加防呆：確保選中的歌曲物件存在
        if (!selectedSong) {
            console.error("No song selected");
            return;
        }

        const response = await fetch(
            `${API_BASE_URL}/songs/${selectedSong.song_id}`,
        );
        const fullSongData = await response.json();

        // 1. 更新歌曲元數據
        setSongData(fullSongData);

        // 🚨 2. 安全地取得版本列表，若無則預設為空陣列
        const versions = fullSongData.versions || [];

        // 3. 取得預設版本：
        // 先找 default 為 true 的，找不到再找 version 為 "original" 的，最後取第一個
        const defaultVersion: Version =
            versions.find((v: Version) => v.default === true) ||
            versions.find((v: Version) => v.version === "original") ||
            versions[0];

        if (defaultVersion) {
            // 更新影片 ID
            setVideoId(defaultVersion.id);
            setTempVideoId(defaultVersion.id);

            // 從 GitHub 抓取歌詞（確保 folder 存在）
            if (fullSongData.folder) {
                await loadLyricsByPath(
                    selectedSong.song_id,
                    fullSongData.folder,
                    defaultVersion.version,
                );
            } else {
                console.warn(
                    "Song folder is missing, cannot fetch lyrics from GitHub.",
                );
            }
        } else {
            console.warn("This song has no versions available.");
        }
    };

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
                onOpenSongSelect={() => setIsSongModalOpen(true)}
                onViewJson={() => setJsonModalOpen(true)}
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
                        hasUncommittedChanges={hasUncommittedChanges}
                        commitLyrics={commitLyrics}
                        discardChanges={discardChanges}
                        onViewDiff={() => setDiffModalOpen(true)}
                        onPlayPause={handlePlayPause}
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
                    tempVideoId={tempVideoId}
                    setTempVideoId={setTempVideoId}
                    onVideoLoad={handleVideoLoad}
                />
            </div>

            {/* JSON Modal */}
            {jsonModalOpen && (
                <JsonModal
                    committedJson={JSON.stringify(lyrics, null, 4)}
                    uncommittedJson={JSON.stringify(stagedLyrics, null, 4)}
                    onClose={() => setJsonModalOpen(false)}
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
                    lyrics={lyrics}
                    onFileUpload={handleFileUpload}
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

            {/* 歌曲選擇 Modal */}
            <SongSelectionModal
                isOpen={isSongModalOpen}
                onClose={() => setIsSongModalOpen(false)}
                onSelect={handleSongSelect}
                isLoggedIn={!!user}
            />
        </div>
    );
}

export default App;
