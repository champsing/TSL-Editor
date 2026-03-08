import React, { useState, useCallback } from "react";
import { LyricPhrase } from "../../types";
import { GripVertical, ArrowLeft, ArrowRight, Zap } from "lucide-react";

interface PhraseReorderBarProps {
    phrases: LyricPhrase[];
    /** "main" | "bg" — for visual theming */
    variant?: "main" | "bg";
    onChange: (newPhrases: LyricPhrase[]) => void;
}

export const PhraseReorderBar: React.FC<PhraseReorderBarProps> = ({
    phrases,
    variant = "main",
    onChange,
}) => {
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [selected, setSelected] = useState<number | null>(null);

    // ── keyboard ──────────────────────────────────────────────
    const movePhrase = useCallback(
        (from: number, dir: "left" | "right") => {
            const to = dir === "left" ? from - 1 : from + 1;
            if (to < 0 || to >= phrases.length) return;
            const next = [...phrases];
            [next[from], next[to]] = [next[to], next[from]];
            onChange(next);
            setSelected(to);
        },
        [phrases, onChange],
    );

    React.useEffect(() => {
        if (selected === null) return;
        const handle = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                movePhrase(selected, "left");
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                movePhrase(selected, "right");
            } else if (e.key === "Escape" || e.key === "Enter")
                setSelected(null);
        };
        window.addEventListener("keydown", handle);
        return () => window.removeEventListener("keydown", handle);
    }, [selected, movePhrase]);

    // ── drag ─────────────────────────────────────────────────
    const onDragStart = (e: React.DragEvent, idx: number) => {
        setDragIndex(idx);
        e.dataTransfer.effectAllowed = "move";
    };
    const onDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        if (idx !== dragOverIndex) setDragOverIndex(idx);
    };
    const onDrop = (e: React.DragEvent, dropIdx: number) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === dropIdx) {
            resetDrag();
            return;
        }
        const next = [...phrases];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(dropIdx, 0, moved);
        onChange(next);
        resetDrag();
    };
    const resetDrag = () => {
        setDragIndex(null);
        setDragOverIndex(null);
    };

    // ── theme ─────────────────────────────────────────────────
    const isMain = variant === "main";
    const ringActive = isMain ? "ring-yellow-400" : "ring-purple-400";
    const borderActive = isMain
        ? "border-yellow-400/70 bg-yellow-400/10"
        : "border-purple-400/70 bg-purple-400/10";
    const borderDragOver = isMain
        ? "border-primary bg-primary/10"
        : "border-purple-300 bg-purple-300/10";
    const textAccent = isMain ? "text-teal-400" : "text-purple-400";
    const btnActive = isMain
        ? "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/40"
        : "bg-purple-500/20 text-purple-300 hover:bg-purple-500/40";

    return (
        <div className="flex flex-wrap gap-2 py-1">
            {phrases.map((phrase, idx) => {
                const isSelected = selected === idx;
                const isDragging = dragIndex === idx;
                const isDragOver = dragOverIndex === idx && dragIndex !== idx;

                return (
                    <div
                        key={idx}
                        draggable
                        onDragStart={(e) => onDragStart(e, idx)}
                        onDragOver={(e) => onDragOver(e, idx)}
                        onDrop={(e) => onDrop(e, idx)}
                        onDragEnd={resetDrag}
                        onClick={() => setSelected(isSelected ? null : idx)}
                        className={`
                            relative flex flex-col items-center justify-between
                            min-w-14 px-2 py-1.5 rounded-lg border cursor-grab active:cursor-grabbing
                            select-none transition-all duration-100
                            ${isDragging ? "opacity-30 scale-90" : ""}
                            ${isDragOver ? `${borderDragOver} scale-105 shadow-lg` : ""}
                            ${isSelected && !isDragOver ? `${borderActive} shadow-md ring-2 ${ringActive}/40` : ""}
                            ${
                                !isDragging && !isDragOver && !isSelected
                                    ? isMain
                                        ? "border-gray-600 bg-gray-700/50 hover:border-gray-400"
                                        : "border-purple-800/50 bg-purple-900/20 hover:border-purple-500"
                                    : ""
                            }
                        `}
                        title="Click to select • drag to reorder"
                    >
                        {/* Grip icon top-left */}
                        <GripVertical
                            size={10}
                            className="absolute top-1 left-1 text-gray-600 opacity-60"
                        />

                        {/* Kiai indicator */}
                        {phrase.kiai && (
                            <Zap
                                size={9}
                                className="absolute top-1 right-1 text-yellow-400"
                                fill="currentColor"
                            />
                        )}

                        {/* Phrase text */}
                        <span
                            className={`text-sm font-medium mt-2 leading-tight text-center break-all max-w-20 ${isMain ? "text-gray-100" : "text-purple-200"}`}
                        >
                            {phrase.phrase || (
                                <span className="text-gray-500 italic text-xs">
                                    —
                                </span>
                            )}
                        </span>

                        {/* Duration */}
                        <span
                            className={`text-[10px] font-mono mt-1 leading-none ${textAccent}`}
                        >
                            {phrase.duration}
                        </span>

                        {/* Arrow buttons when selected */}
                        {isSelected && (
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-0.5 z-20">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        movePhrase(idx, "left");
                                    }}
                                    disabled={idx === 0}
                                    className={`p-0.5 rounded text-xs transition-colors disabled:opacity-20 disabled:cursor-not-allowed ${btnActive}`}
                                    title="Move left (←)"
                                >
                                    <ArrowLeft size={11} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        movePhrase(idx, "right");
                                    }}
                                    disabled={idx === phrases.length - 1}
                                    className={`p-0.5 rounded text-xs transition-colors disabled:opacity-20 disabled:cursor-not-allowed ${btnActive}`}
                                    title="Move right (→)"
                                >
                                    <ArrowRight size={11} />
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
