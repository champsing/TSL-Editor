import React, { useState } from "react";
import { LyricLine, LyricPhrase } from "../types";
import { PhraseEditor } from "./PhraseEditor";
import {
    Clock,
    Plus,
    Trash2,
    MoveRight,
    Mic2,
    XCircle,
    GripVertical,
    Pencil, // 新增鉛筆 icon
} from "lucide-react";

interface LineEditorProps {
    index: number;
    line: LyricLine;
    isCurrent: boolean;
    isEditing: boolean; // 新增：是否處於編輯狀態
    onEditStart: () => void; // 新增：切換到編輯狀態的回調
    onUpdate: (index: number, newLine: LyricLine) => void;
    onDelete: (index: number) => void;
    onStampTime: (index: number) => void;
    onSeek: (timeStr: string) => void;
}

export const LineEditor: React.FC<LineEditorProps> = ({
    index,
    line,
    isCurrent,
    isEditing,
    onEditStart,
    onUpdate,
    onDelete,
    onStampTime,
    onSeek,
}) => {
    // --- Drag and Drop State ---
    const [dragState, setDragState] = useState<{
        type: "main" | "bg";
        index: number;
    } | null>(null);

    // --- Main Text Handlers ---
    const handlePhraseChange = (pIndex: number, updatedPhrase: LyricPhrase) => {
        if (!line.text) return;
        const newText = [...line.text];
        newText[pIndex] = updatedPhrase;
        onUpdate(index, { ...line, text: newText });
    };

    const addPhrase = () => {
        const newPhrase: LyricPhrase = { phrase: "", duration: 20 };
        const newText = line.text ? [...line.text, newPhrase] : [newPhrase];
        onUpdate(index, { ...line, text: newText });
    };

    const deletePhrase = (pIndex: number) => {
        if (!line.text) return;
        const newText = line.text.filter((_, i) => i !== pIndex);
        onUpdate(index, { ...line, text: newText });
    };

    // --- Background Voice Handlers ---
    const toggleBackgroundVoice = () => {
        if (line.background_voice) {
            if (window.confirm("Remove background voice track?")) {
                const { background_voice, ...rest } = line;
                onUpdate(index, rest);
            }
        } else {
            onUpdate(index, {
                ...line,
                background_voice: {
                    time: line.time,
                    text: [{ phrase: "", duration: 20 }],
                },
            });
        }
    };

    const updateBgVoiceTime = (newTime: string) => {
        if (!line.background_voice) return;
        onUpdate(index, {
            ...line,
            background_voice: { ...line.background_voice, time: newTime },
        });
    };

    const handleBgPhraseChange = (
        pIndex: number,
        updatedPhrase: LyricPhrase
    ) => {
        if (!line.background_voice) return;
        const newText = [...line.background_voice.text];
        newText[pIndex] = updatedPhrase;
        onUpdate(index, {
            ...line,
            background_voice: { ...line.background_voice, text: newText },
        });
    };

    const addBgPhrase = () => {
        if (!line.background_voice) return;
        const newPhrase: LyricPhrase = { phrase: "", duration: 20 };
        const newText = [...line.background_voice.text, newPhrase];
        onUpdate(index, {
            ...line,
            background_voice: { ...line.background_voice, text: newText },
        });
    };

    const deleteBgPhrase = (pIndex: number) => {
        if (!line.background_voice) return;
        const newText = line.background_voice.text.filter(
            (_, i) => i !== pIndex
        );
        onUpdate(index, {
            ...line,
            background_voice: { ...line.background_voice, text: newText },
        });
    };

    // --- Drag and Drop Logic ---

    const handleDragStart = (
        e: React.DragEvent,
        type: "main" | "bg",
        idx: number
    ) => {
        setDragState({ type, index: idx });
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (
        e: React.DragEvent,
        targetType: "main" | "bg",
        targetIndex: number
    ) => {
        e.preventDefault();

        if (!dragState) return;
        if (dragState.type !== targetType) return;
        if (dragState.index === targetIndex) {
            setDragState(null);
            return;
        }

        const listKey = targetType === "main" ? "text" : "background_voice";

        let currentList: LyricPhrase[] = [];
        if (targetType === "main") {
            currentList = [...(line.text || [])];
        } else {
            currentList = [...(line.background_voice?.text || [])];
        }

        const itemToMove = currentList[dragState.index];
        currentList.splice(dragState.index, 1);
        currentList.splice(targetIndex, 0, itemToMove);

        if (targetType === "main") {
            onUpdate(index, { ...line, text: currentList });
        } else {
            onUpdate(index, {
                ...line,
                background_voice: {
                    ...line.background_voice!,
                    text: currentList,
                },
            });
        }

        setDragState(null);
    };

    const isSpecialType = !!line.type && line.type !== "normal";

    // --- 預覽模式 (非編輯狀態) ---
    if (!isEditing) {
        return (
            <div
                className={`mb-2 p-3 rounded-lg border transition-all duration-300 relative group flex items-start gap-4 ${
                    isCurrent
                        ? "bg-dark/80 border-primary shadow-[0_0_10px_rgba(74,194,215,0.2)]"
                        : "bg-panel border-gray-700 hover:border-gray-600"
                }`}
            >
                {/* Time Stamp */}
                <div className="flex flex-col items-center gap-1 min-w-18 pt-1">
                    <span className="font-mono text-primary font-bold text-lg">
                        {line.time}
                    </span>
                </div>

                {/* Content Preview */}
                <div
                    className="flex-1 space-y-2 cursor-pointer"
                    onClick={onEditStart}
                    title="Click to edit"
                >
                    {/* Main Text */}
                    <div className="flex flex-wrap gap-1">
                        {!isSpecialType &&
                            (!line.text || line.text.length === 0) && (
                                <span className="text-gray-500 italic text-sm">
                                    Empty line
                                </span>
                            )}
                        {isSpecialType && (
                            <span className="text-base text-gray-500 uppercase border border-gray-700 px-1 rounded">
                                {line.type}
                            </span>
                        )}
                        {line.text?.map((p, i) => (
                            <div
                                key={i}
                                className="bg-black/30 px-2 py-0.5 rounded border border-gray-700/50 flex flex-col min-w-8"
                            >
                                <span className="text-gray-200 text-sm font-medium">
                                    {p.phrase || "\u00A0"}
                                </span>
                                <span className="text-[10px] text-teal-500/70 font-mono text-right leading-none">
                                    {p.duration}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* BG Voice Preview */}
                    {line.background_voice && (
                        <div className="flex items-center gap-2 pt-1 border-t border-white/5 mt-1">
                            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                                BG
                            </span>
                            <div className="flex flex-wrap gap-1">
                                {line.background_voice.text.map((p, i) => (
                                    <div
                                        key={i}
                                        className="bg-purple-900/20 px-2 py-0.5 rounded border border-purple-500/20 flex flex-col"
                                    >
                                        <span className="text-purple-200 text-xs">
                                            {p.phrase || "\u00A0"}
                                        </span>
                                        <span className="text-[9px] text-purple-400/70 font-mono text-right leading-none">
                                            {p.duration}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Edit Button (Pencil Icon) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEditStart();
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-gray-700 text-white rounded hover:bg-primary hover:text-black transition-all opacity-0 group-hover:opacity-100 shadow-lg z-10"
                    title="Edit Line"
                >
                    <Pencil size={16} />
                </button>
            </div>
        );
    }

    // --- 編輯模式 (完整介面) ---
    return (
        <div
            className={`mb-4 p-4 rounded-lg border transition-all duration-300 ${
                isCurrent
                    ? "is-current bg-dark/80 border-primary shadow-[0_0_15px_rgba(74,194,215,0.3)] transform scale-[1.01]"
                    : "bg-panel border-gray-700 hover:border-gray-500"
            }`}
        >
            {/* Toolbar Header */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
                <div className="bg-black/30 rounded p-1 flex items-center gap-2 border border-gray-600">
                    <button
                        onClick={() => onStampTime(index)}
                        className="p-1.5 hover:bg-primary hover:text-black rounded text-primary transition-colors"
                        title="Stamp current player time"
                    >
                        <Clock size={16} />
                    </button>
                    <input
                        type="text"
                        value={line.time}
                        onChange={(e) =>
                            onUpdate(index, { ...line, time: e.target.value })
                        }
                        className="bg-transparent w-20 text-center font-mono text-lg text-white outline-none focus:text-primary"
                    />
                    <button
                        onClick={() => onSeek(line.time)}
                        className="p-1.5 hover:bg-white/20 rounded text-gray-400 transition-colors"
                        title="Seek player to this time"
                    >
                        <MoveRight size={16} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 uppercase font-bold">
                        Type:
                    </span>
                    <select
                        value={line.type || "normal"}
                        onChange={(e) =>
                            onUpdate(index, {
                                ...line,
                                type:
                                    e.target.value === "normal"
                                        ? undefined
                                        : (e.target.value as any),
                            })
                        }
                        className="bg-black/30 border border-gray-600 rounded px-2 py-1 text-sm outline-none focus:border-primary"
                    >
                        <option value="normal">Lyrics</option>
                        <option value="prelude">Prelude</option>
                        <option value="interlude">Interlude</option>
                        <option value="end">End</option>
                    </select>
                </div>

                <div className="grow"></div>

                {/* Toggle Background Voice Button */}
                <button
                    onClick={toggleBackgroundVoice}
                    className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold transition-colors mr-2 ${
                        line.background_voice
                            ? "bg-purple-900/40 text-purple-300 border border-purple-500/50"
                            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                    }`}
                >
                    <Mic2 size={14} />
                    {line.background_voice ? "Has BG Voice" : "Add BG Voice"}
                </button>

                <button
                    onClick={() => onDelete(index)}
                    className="text-red-400 hover:bg-red-400/10 p-2 rounded transition-colors"
                    title="Delete Line"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Main Lyric Content */}
            {!isSpecialType && (
                <div className="space-y-3">
                    {/* Phrases Flow */}
                    <div className="flex flex-wrap gap-2 items-start">
                        {line.text?.map((phrase, pIndex) => (
                            <div
                                key={pIndex}
                                className={`flex items-center gap-0.5 transition-opacity ${
                                    dragState?.type === "main" &&
                                    dragState?.index === pIndex
                                        ? "opacity-40"
                                        : "opacity-100"
                                }`}
                                draggable
                                onDragStart={(e) =>
                                    handleDragStart(e, "main", pIndex)
                                }
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, "main", pIndex)}
                            >
                                {/* Drag Handle */}
                                <div className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 -mt-4">
                                    <GripVertical size={14} />
                                </div>

                                <PhraseEditor
                                    phrase={phrase}
                                    onChange={(up) =>
                                        handlePhraseChange(pIndex, up)
                                    }
                                    onDelete={() => deletePhrase(pIndex)}
                                />
                            </div>
                        ))}
                        <button
                            onClick={addPhrase}
                            className="h-[82px] w-10 flex items-center justify-center border border-dashed border-gray-500 rounded-md text-gray-500 hover:text-primary hover:border-primary hover:bg-primary/10 transition-all"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {/* Translation */}
                    <div className="flex items-center gap-3 bg-black/20 p-2 rounded border border-white/5">
                        <span className="text-xs text-green-400 font-bold px-2">
                            TL
                        </span>
                        <input
                            type="text"
                            value={line.translation || ""}
                            onChange={(e) =>
                                onUpdate(index, {
                                    ...line,
                                    translation: e.target.value,
                                })
                            }
                            className="w-full bg-transparent outline-none text-gray-300 placeholder-gray-600"
                            placeholder="Translation..."
                        />
                    </div>
                </div>
            )}

            {/* Marker Content */}
            {isSpecialType && (
                <div className="text-gray-500 italic text-center py-2 border border-dashed border-gray-700 rounded bg-black/20 mb-3">
                    {line.type?.toUpperCase()} MARKER
                </div>
            )}

            {/* Background Voice Section */}
            {line.background_voice && (
                <div className="mt-4 p-3 bg-purple-900/10 border border-purple-500/20 rounded-lg relative">
                    <div className="absolute top-0 left-0 bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-br">
                        BACKGROUND VOICE
                    </div>

                    <div className="flex items-start gap-4 mt-4">
                        {/* BG Voice Time Control */}
                        <div className="flex flex-col gap-1 pt-2">
                            <div className="flex items-center bg-black/40 rounded border border-purple-500/30 overflow-hidden">
                                <input
                                    type="text"
                                    value={line.background_voice.time}
                                    onChange={(e) =>
                                        updateBgVoiceTime(e.target.value)
                                    }
                                    className="w-20 bg-transparent text-xs text-center p-1 outline-none font-mono text-purple-200"
                                />
                            </div>
                            <div className="flex justify-between">
                                <button
                                    onClick={() =>
                                        onSeek(line.background_voice!.time)
                                    }
                                    className="text-gray-500 hover:text-purple-300"
                                    title="Seek to BG time"
                                >
                                    <MoveRight size={15} />
                                </button>
                                <button
                                    onClick={toggleBackgroundVoice}
                                    className="text-red-400/50 hover:text-red-400"
                                    title="Remove BG Voice"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>

                        {/* BG Phrases */}
                        <div className="flex flex-wrap gap-2 items-start flex-1">
                            {line.background_voice.text.map(
                                (phrase, pIndex) => (
                                    <div
                                        key={`bg-${pIndex}`}
                                        className={`flex items-center gap-0.5 transition-opacity ${
                                            dragState?.type === "bg" &&
                                            dragState?.index === pIndex
                                                ? "opacity-40"
                                                : "opacity-100"
                                        }`}
                                        draggable
                                        onDragStart={(e) =>
                                            handleDragStart(e, "bg", pIndex)
                                        }
                                        onDragOver={handleDragOver}
                                        onDrop={(e) =>
                                            handleDrop(e, "bg", pIndex)
                                        }
                                    >
                                        {/* Drag Handle */}
                                        <div className="cursor-grab active:cursor-grabbing text-purple-500/40 hover:text-purple-400 -mt-4">
                                            <GripVertical size={14} />
                                        </div>

                                        <PhraseEditor
                                            phrase={phrase}
                                            onChange={(up) =>
                                                handleBgPhraseChange(pIndex, up)
                                            }
                                            onDelete={() =>
                                                deleteBgPhrase(pIndex)
                                            }
                                        />
                                    </div>
                                )
                            )}
                            <button
                                onClick={addBgPhrase}
                                className="h-[82px] w-8 flex items-center justify-center border border-dashed border-purple-500/30 rounded-md text-purple-500/50 hover:text-purple-300 hover:border-purple-400 hover:bg-purple-500/10 transition-all"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
