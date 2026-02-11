// components/LyricsEditorTab.tsx
import React from "react";
import { Plus, Play } from "lucide-react";
import { LineEditor } from "./LineEditor";
import { secondsToTime } from "../utils";
import { LyricLine } from "../types";

interface Props {
    isPlaying: boolean;
    playerTime: number;
    stagedLyrics: LyricLine[];
    activeLineIndices: number[];
    editingLineIndex: number | null;
    setEditingLineIndex: (index: number | null) => void;
    addLine: () => void;
    updateLine: any;
    deleteLine: any;
    handleStamp: any;
    handleSeek: any;
    setPreviewModalOpen: (open: boolean) => void;
    scrollContainerRef: React.RefObject<HTMLDivElement>;
}

export const LyricsEditorTab: React.FC<Props> = (props) => {
    const {
        isPlaying,
        playerTime,
        stagedLyrics,
        activeLineIndices,
        editingLineIndex,
        setEditingLineIndex,
        addLine,
        updateLine,
        deleteLine,
        handleStamp,
        handleSeek,
        setPreviewModalOpen,
        scrollContainerRef,
    } = props;

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-[#2d3748]">
            <div className="bg-panel px-6 py-3 border-b border-gray-700 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <div className="text-3xl font-mono text-primary font-bold tabular-nums">
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
                    <button
                        onClick={() => setPreviewModalOpen(true)}
                        className="cursor-pointer bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded flex items-center gap-2 transition shadow-lg shadow-purple-900/20"
                    >
                        <Play size={18} /> Preview
                    </button>
                    <button
                        onClick={addLine}
                        disabled={isPlaying}
                        className={`cursor-pointer bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 transition ${!isPlaying ? "shadow-lg shadow-green-900/20" : "opacity-50 cursor-not-allowed shadow-none"}`}
                    >
                        <Plus size={18} /> Add Line at{" "}
                        {isPlaying ? "--:--.--" : secondsToTime(playerTime, 1)}
                    </button>
                </div>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-6 scroll-smooth pb-32"
            >
                <div className="max-w-4xl mx-auto">
                    {stagedLyrics.length === 0 && (
                        <div className="text-center text-gray-500 mt-20">
                            No lyrics loaded.
                        </div>
                    )}
                    {stagedLyrics.map((line, index) => (
                        <LineEditor
                            key={index}
                            index={index}
                            line={line}
                            isCurrent={activeLineIndices.includes(index)}
                            isEditing={index === editingLineIndex}
                            onEditStart={() => setEditingLineIndex(index)}
                            onUpdate={updateLine}
                            onDelete={deleteLine}
                            onStampTime={handleStamp}
                            onSeek={handleSeek}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
