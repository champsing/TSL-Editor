import React, { useEffect, useRef } from "react";
import { LineEditor } from "./components/LineEditor";
import { PreviewModal } from "./components/PreviewModal";
import { JsonModal } from "./components/JsonModal"; // 新增 Modal 組件 (如下)
import { DiffModal } from "./components/DiffModal"; // 匯入新的 DiffModal 組件
import { EditorHeader } from "./components/EditorHeader";
import { EditorSidebar } from "./components/EditorSidebar";
import { useLyricEditor } from "./hooks/useLyricEditor";
import { Plus, Play } from "lucide-react";
import { secondsToTime } from "./utils";

// --- Main App Component ---
function App() {
    const {
        // State
        videoId,
        tempVideoId,
        setTempVideoId,
        stagedLyrics,
        lyrics,
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

    // 自動滾動到當前行 (使用 committed lyrics 的索引)
    useEffect(() => {
        if (previewModalOpen || diffModalOpen) return; // 避免 Modal 開啟時滾動

        if (currentLineIndex !== -1 && scrollContainerRef.current) {
            const currentLine =
                document.getElementsByClassName("is-current")[0];

            currentLine?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [currentLineIndex, previewModalOpen, diffModalOpen]); // 監聽 diffModalOpen 狀態

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

            {/* Main Content (主要內容) */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel: Editor (左側面板：編輯器) */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#2d3748]">
                    {/* Editor Toolbar (編輯器工具列) */}
                    <div className="bg-panel px-6 py-3 border-b border-gray-700 flex items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <div className="text-3xl font-mono text-primary font-bold tabular-nums">
                                {/* 顯示當前時間 */}
                                {isPlaying
                                    ? secondsToTime(playerTime, 0)
                                    : secondsToTime(playerTime, 1)}
                            </div>
                            <div className="h-8 w-px bg-gray-600 mx-2"></div>
                            <div className="text-sm text-gray-400">
                                {stagedLyrics.length} lines total
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {/* Preview Button */}
                            <button
                                onClick={() => setPreviewModalOpen(true)}
                                className="cursor-pointer bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded flex items-center gap-2 transition shadow-lg shadow-purple-900/20"
                            >
                                <Play size={18} />
                                Preview
                            </button>
                            {/* Add Line Button */}
                            <button
                                onClick={addLine}
                                className={`cursor-pointer bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 transition ${
                                    !isPlaying
                                        ? "shadow-lg shadow-green-900/20"
                                        : "opacity-50 cursor-not-allowed shadow-none"
                                }`}
                                disabled={isPlaying}
                            >
                                <Plus size={18} />
                                Add Line at{" "}
                                {isPlaying
                                    ? "--:--.--"
                                    : secondsToTime(playerTime, 1)}
                            </button>
                        </div>
                    </div>

                    {/* Scrollable List (可滾動清單) */}
                    <div
                        ref={scrollContainerRef}
                        className="flex-1 overflow-y-auto p-6 scroll-smooth pb-32"
                    >
                        <div className="max-w-4xl mx-auto">
                            {stagedLyrics.length === 0 && (
                                <div className="text-center text-gray-500 mt-20">
                                    No lyrics loaded. Import a file or add a
                                    line.
                                </div>
                            )}
                            {/* 清單使用 stagedLyrics 進行渲染 */}
                            {stagedLyrics.map((line, index) => (
                                <LineEditor
                                    key={index}
                                    index={index}
                                    line={line}
                                    isCurrent={index === currentLineIndex}
                                    isEditing={index === editingLineIndex}
                                    onEditStart={() =>
                                        setEditingLineIndex(index)
                                    }
                                    onUpdate={updateLine}
                                    onDelete={deleteLine}
                                    onStampTime={handleStamp}
                                    onSeek={handleSeek}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Fixed Player - 拆分到 EditorSidebar */}
                <EditorSidebar
                    videoId={videoId}
                    playerRef={playerRef}
                    onTimeUpdate={setPlayerTime}
                    onIsPlayingChange={setIsPlaying}
                    onFileUpload={handleFileUpload}
                    onViewJson={() => setJsonModalOpen(true)}
                    onCopyJson={copyJson}
                />
            </div>

            {/* JSON Modal */}
            {jsonModalOpen && (
                <JsonModal
                    jsonContent={JSON.stringify(lyrics, null, 4)}
                    onClose={() => setJsonModalOpen(false)}
                    onCopy={copyJson}
                />
            )}

            {/* Preview Modal */}
            {previewModalOpen && (
                <PreviewModal
                    lyrics={lyrics}
                    currentTime={playerTime}
                    onClose={() => setPreviewModalOpen(false)}
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
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
