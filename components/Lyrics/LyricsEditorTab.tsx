// components/LyricsEditorTab.tsx
import { LyricLine } from "@composables/types";
import { secondsToTime } from "@composables/utils";
import { ArrowUpDown, Pause, Play, Plus, Upload } from "lucide-react";
import React, { useRef, useState } from "react";
import { EditActions } from "./EditActions";
import { LineEditor } from "./LineEditor";
import { LineReorderModal } from "./LineReorderModal";

interface Props {
    isPlaying: boolean;
    playerTime: number;
    stagedLyrics: LyricLine[];
    activeLineIndices: number[];
    editingLineIndex: number | null;
    updateLine: any;
    deleteLine: any;
    handleStamp: any;
    handleSeek: any;
    hasUncommittedChanges: boolean;
    scrollContainerRef: React.RefObject<HTMLDivElement | null>;
    addLine: () => void;
    commitLyrics: () => void;
    discardChanges: () => void;
    onViewDiff: () => void;
    onPlayPause: () => void;
    setPreviewModalOpen: (open: boolean) => void;
    setEditingLineIndex: (index: number | null) => void;
    replaceAllLines?: (lines: LyricLine[]) => void;
    onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const LyricsEditorTab: React.FC<Props> = (props) => {
    const {
        isPlaying,
        playerTime,
        stagedLyrics,
        activeLineIndices,
        editingLineIndex,
        updateLine,
        deleteLine,
        handleStamp,
        handleSeek,
        hasUncommittedChanges,
        scrollContainerRef,
        addLine,
        commitLyrics,
        discardChanges,
        onViewDiff,
        onPlayPause,
        setPreviewModalOpen,
        setEditingLineIndex,
        replaceAllLines,
        onImportJson,
    } = props;

    const [reorderModalOpen, setReorderModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleReorder = (newLines: LyricLine[]) => {
        if (replaceAllLines) {
            // Preferred: parent exposes a bulk replace handler
            replaceAllLines(newLines);
        } else {
            // Fallback: update each index individually
            newLines.forEach((line, i) => {
                updateLine(i, line);
            });
        }
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-[#1a202c] overflow-y-auto">
            {/* Header */}
            <div className="bg-[#2d3748]/80 backdrop-blur-md px-6 py-4 border-b border-gray-700/50 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                {/* Left: Status & Time */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={onPlayPause}
                        className={`
                            group relative flex items-center justify-center w-11 h-11 
                            rounded-xl border transition-all duration-200 active:scale-95
                            ${
                                isPlaying
                                    ? "bg-amber-400/10 border-amber-400/30 text-amber-400 hover:bg-amber-400/20"
                                    : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:text-white"
                            }
                        `}
                    >
                        <div className="absolute inset-0 rounded-xl bg-current opacity-0 group-hover:opacity-5 blur-md transition-opacity" />
                        {isPlaying ? (
                            <Pause
                                size={18}
                                fill="currentColor"
                                strokeWidth={2.5}
                            />
                        ) : (
                            <Play
                                size={18}
                                fill="currentColor"
                                strokeWidth={2.5}
                                className="ml-0.5"
                            />
                        )}
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                            Current Time
                        </span>
                        <div className="text-3xl font-mono text-emerald-400 font-bold tabular-nums leading-none">
                            {secondsToTime(
                                playerTime,
                                isPlaying ? false : true,
                            )}
                        </div>
                    </div>
                    <div className="h-10 w-px bg-gray-700"></div>
                </div>

                {/* Right: Button groups */}
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-800/50 p-1 rounded-lg border border-gray-700">
                        <button
                            onClick={() => setPreviewModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium text-purple-300 hover:bg-purple-500/10 transition-all active:scale-95"
                        >
                            <Play
                                size={16}
                                fill="currentColor"
                                className="opacity-70"
                            />
                            Preview
                        </button>

                        <div className="w-px h-6 bg-gray-700 my-auto"></div>

                        {/* Reorder button */}
                        <button
                            onClick={() => setReorderModalOpen(true)}
                            disabled={stagedLyrics.length === 0}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all active:scale-95
                                ${
                                    stagedLyrics.length > 0
                                        ? "text-sky-400 hover:bg-sky-500/10"
                                        : "text-gray-600 cursor-not-allowed opacity-50"
                                }`}
                            title="Reorder lines"
                        >
                            <ArrowUpDown size={16} />
                            Reorder
                        </button>

                        <div className="w-px h-6 bg-gray-700 my-auto"></div>

                        <button
                            onClick={addLine}
                            disabled={isPlaying}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all active:scale-95
                                ${
                                    !isPlaying
                                        ? "text-emerald-400 hover:bg-emerald-500/10"
                                        : "text-gray-600 cursor-not-allowed opacity-50"
                                }`}
                        >
                            <Plus size={18} />
                            Add Line
                        </button>
                    </div>

                    <div className="w-2"></div>

                    <div className="flex items-center gap-2 border-l border-gray-700 pl-4">
                        <EditActions
                            hasUncommittedChanges={hasUncommittedChanges}
                            commitLyrics={commitLyrics}
                            discardChanges={discardChanges}
                            onViewDiff={onViewDiff}
                        />
                    </div>
                </div>
            </div>

            {/* Content area */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-8 scroll-smooth pb-32 relative custom-scrollbar"
            >
                <div className="max-w-4xl mx-auto space-y-4">
                    {stagedLyrics.length === 0 ? (
                        <div className="flex flex-col items-center justify-center mt-32 text-gray-600 border-2 border-dashed border-gray-800 rounded-2xl py-20">
                            <div className="bg-gray-800/50 p-4 rounded-full mb-4">
                                <Plus size={32} />
                            </div>
                            <p className="text-lg mb-4">
                                No lyrics loaded yet.
                            </p>
                            <p className="text-sm">
                                Select an existing song or click "Add Line" to
                                get started.
                            </p>
                            <p className="text-sm mt-2 mb-2">You can also</p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    className="hidden"
                                    onChange={(e) => {
                                        onImportJson(e);
                                        if (fileInputRef.current)
                                            fileInputRef.current.value = "";
                                    }}
                                />
                                {/* Import */}
                                <label
                                    className="
                                    group cursor-pointer flex items-center gap-2
                                    px-3 py-2 rounded-lg text-sm font-semibold
                                    bg-white/5 hover:bg-white/10
                                    border border-white/10 hover:border-white/20
                                    text-gray-400 hover:text-white
                                    transition-all duration-200
                                "
                                >
                                    <Upload
                                        size={14}
                                        className="transition-transform duration-200 group-hover:scale-110"
                                    />
                                    <span className="uppercase tracking-wide text-xs">
                                        Import JSON File
                                    </span>
                                </label>
                            </button>
                        </div>
                    ) : (
                        stagedLyrics.map((line, index) => (
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
                        ))
                    )}
                    <div className="mt-4 flex flex-row gap-4 items-center">
                        <div className="grow"></div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                            Total Lines
                        </span>
                        <div className="text-xl font-semibold text-gray-300">
                            {stagedLyrics.length}
                        </div>
                        <div className="grow"></div>
                    </div>
                </div>
            </div>

            {/* Reorder Modal */}
            <LineReorderModal
                isOpen={reorderModalOpen}
                onClose={() => setReorderModalOpen(false)}
                lines={stagedLyrics}
                onReorder={handleReorder}
            />
        </div>
    );
};
