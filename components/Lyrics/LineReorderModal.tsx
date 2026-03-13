import React, { useState, useRef, useCallback, useEffect } from "react";
import { LyricLine } from "../../composables/types";
import {
    X,
    GripVertical,
    ArrowUp,
    ArrowDown,
    TriangleAlert,
} from "lucide-react";

interface LineReorderModalProps {
    isOpen: boolean;
    onClose: () => void;
    lines: LyricLine[];
    onReorder: (newLines: LyricLine[]) => void;
}

interface LineItemData {
    originalIndex: number;
    line: LyricLine;
}

// Helper: convert time string "MM:SS.ss" → seconds
const timeToSeconds = (t: string): number => {
    if (!t) return 0;
    const [ms, cs] = t.split(".");
    const [m, s] = (ms || "0:0").split(":").map(Number);
    return (m || 0) * 60 + (s || 0) + (cs ? parseFloat(`0.${cs}`) : 0);
};

// Helper: seconds → "MM:SS.ss"
const secondsToTimeStr = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    const ss = s.toFixed(2).padStart(5, "0");
    return `${String(m).padStart(2, "0")}:${ss}`;
};

// Fix times: if a line's time < previous line's time, set it to prev_time - 3s (min 0)
const fixTimes = (items: LineItemData[]): LineItemData[] => {
    return items.map((item, i) => {
        if (i === 0) return item;
        const prevSec = timeToSeconds(items[i - 1].line.time);
        const curSec = timeToSeconds(item.line.time);
        if (curSec < prevSec) {
            const newSec = Math.max(0, prevSec - 3);
            return {
                ...item,
                line: { ...item.line, time: secondsToTimeStr(newSec) },
            };
        }
        return item;
    });
};

// Get display text for a line
const getLineText = (line: LyricLine): string => {
    if (line.type && line.type !== "normal")
        return `[${line.type.toUpperCase()}]`;
    return line.text?.map((p) => p.phrase).join(" ") || "(empty)";
};

export const LineReorderModal: React.FC<LineReorderModalProps> = ({
    isOpen,
    onClose,
    lines,
    onReorder,
}) => {
    const [items, setItems] = useState<LineItemData[]>([]);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [kbSelected, setKbSelected] = useState<number | null>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const dragNode = useRef<HTMLDivElement | null>(null);

    // Init items when opened
    useEffect(() => {
        if (isOpen) {
            setItems(lines.map((line, i) => ({ originalIndex: i, line })));
            setKbSelected(null);
            setDragIndex(null);
            setDragOverIndex(null);
        }
    }, [isOpen, lines]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;
        const handle = (e: KeyboardEvent) => {
            if (kbSelected === null) {
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                    e.preventDefault();
                    setKbSelected(e.key === "ArrowDown" ? 0 : items.length - 1);
                }
                return;
            }

            if (e.key === "Escape") {
                setKbSelected(null);
            } else if (e.key === "ArrowDown" && !e.shiftKey) {
                e.preventDefault();
                setKbSelected((i) => Math.min((i ?? 0) + 1, items.length - 1));
            } else if (e.key === "ArrowUp" && !e.shiftKey) {
                e.preventDefault();
                setKbSelected((i) => Math.max((i ?? 0) - 1, 0));
            } else if (e.key === "ArrowDown" && e.shiftKey) {
                e.preventDefault();
                moveItem(kbSelected, "down");
            } else if (e.key === "ArrowUp" && e.shiftKey) {
                e.preventDefault();
                moveItem(kbSelected, "up");
            }
        };
        window.addEventListener("keydown", handle);
        return () => window.removeEventListener("keydown", handle);
    }, [isOpen, kbSelected, items]);

    const moveItem = useCallback(
        (fromIdx: number, dir: "up" | "down") => {
            const toIdx = dir === "up" ? fromIdx - 1 : fromIdx + 1;
            if (toIdx < 0 || toIdx >= items.length) return;
            const next = [...items];
            [next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
            setItems(next);
            setKbSelected(toIdx);
        },
        [items],
    );

    // Drag handlers
    const handleDragStart = (e: React.DragEvent, idx: number) => {
        setDragIndex(idx);
        e.dataTransfer.effectAllowed = "move";
        dragNode.current = e.currentTarget as HTMLDivElement;
    };

    const handleDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (idx !== dragOverIndex) setDragOverIndex(idx);
    };

    const handleDrop = (e: React.DragEvent, dropIdx: number) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === dropIdx) {
            setDragIndex(null);
            setDragOverIndex(null);
            return;
        }
        const next = [...items];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(dropIdx, 0, moved);
        setItems(next);
        setDragIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDragIndex(null);
        setDragOverIndex(null);
    };

    const handleApply = () => {
        const fixed = fixTimes(items);
        onReorder(fixed.map((it) => it.line));
        onClose();
    };

    // Check time conflicts (where order differs from time order)
    const timeConflicts = items.reduce<boolean[]>((acc, item, i) => {
        if (i === 0) {
            acc.push(false);
            return acc;
        }
        const prev = timeToSeconds(items[i - 1].line.time);
        const cur = timeToSeconds(item.line.time);
        acc.push(cur < prev);
        return acc;
    }, []);

    const hasConflicts = timeConflicts.some(Boolean);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(6px)",
            }}
        >
            <div
                className="relative flex flex-col bg-[#1a202c] border border-gray-700 rounded-2xl shadow-2xl"
                style={{ width: "min(720px, 95vw)", maxHeight: "85vh" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">
                            Reorder Lines
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Drag rows or select +{" "}
                            <kbd className="bg-gray-700 px-1 rounded text-gray-300">
                                Shift ↑↓
                            </kbd>{" "}
                            to move. Time conflicts are auto-fixed on Apply.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Conflict warning */}
                {hasConflicts && (
                    <div className="mx-6 mt-3 flex items-center gap-2 bg-amber-900/20 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-amber-300">
                        <TriangleAlert size={14} className="shrink-0" />
                        <span>
                            Lines marked{" "}
                            <span className="text-amber-400 font-bold">⚠</span>{" "}
                            have time conflicts — applying will auto-set them to
                            3s before the previous line.
                        </span>
                    </div>
                )}

                {/* List */}
                <div
                    ref={listRef}
                    className="flex-1 overflow-y-auto px-6 py-4 space-y-1.5 custom-scrollbar"
                >
                    {items.map((item, idx) => {
                        const isSelected = kbSelected === idx;
                        const isDragging = dragIndex === idx;
                        const isDragOver =
                            dragOverIndex === idx && dragIndex !== idx;
                        const hasConflict = timeConflicts[idx];

                        return (
                            <div
                                key={`${item.originalIndex}-${idx}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDrop={(e) => handleDrop(e, idx)}
                                onDragEnd={handleDragEnd}
                                onClick={() =>
                                    setKbSelected(isSelected ? null : idx)
                                }
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-grab active:cursor-grabbing
                                    transition-all duration-150 select-none
                                    ${isDragging ? "opacity-40 scale-95 border-gray-500 bg-white/5" : ""}
                                    ${isDragOver ? "border-primary bg-primary/10 scale-[1.01] shadow-lg shadow-primary/20" : ""}
                                    ${isSelected && !isDragOver ? "border-yellow-400/70 bg-yellow-400/10 shadow-md shadow-yellow-400/10" : ""}
                                    ${!isDragging && !isDragOver && !isSelected ? "border-gray-700/60 bg-white/3 hover:border-gray-500 hover:bg-white/5" : ""}
                                `}
                            >
                                {/* Grip */}
                                <GripVertical
                                    size={16}
                                    className="text-gray-600 shrink-0"
                                />

                                {/* Row number */}
                                <span className="text-xs text-gray-500 w-6 text-right tabular-nums shrink-0">
                                    {idx + 1}
                                </span>

                                {/* Time */}
                                <span
                                    className={`font-mono text-sm font-bold w-20 shrink-0 ${hasConflict ? "text-amber-400" : "text-primary"}`}
                                >
                                    {hasConflict && (
                                        <span className="mr-1">⚠</span>
                                    )}
                                    {item.line.time}
                                </span>

                                {/* Type badge (if special) */}
                                {item.line.type &&
                                    item.line.type !== "normal" && (
                                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-gray-700 text-gray-400 font-bold shrink-0">
                                            {item.line.type}
                                        </span>
                                    )}

                                {/* Vocalist badges */}
                                {item.line.is_secondary && (
                                    <span className="text-[10px] italic font-black px-1 py-0.5 rounded bg-orange-900/30 text-orange-400 border border-orange-500/30 shrink-0">
                                        2nd
                                    </span>
                                )}
                                {item.line.is_together && (
                                    <span className="text-[10px] italic font-black px-1 py-0.5 rounded bg-blue-900/30 text-blue-400 border border-blue-500/30 shrink-0">
                                        1/2
                                    </span>
                                )}

                                {/* Lyrics text */}
                                <span className="flex-1 text-sm text-gray-200 truncate">
                                    {getLineText(item.line)}
                                </span>

                                {/* BG badge */}
                                {item.line.background_voice && (
                                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-400 border border-purple-500/30 shrink-0">
                                        BG
                                    </span>
                                )}

                                {/* Keyboard move buttons (visible when selected) */}
                                {isSelected && (
                                    <div className="flex gap-1 shrink-0">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveItem(idx, "up");
                                            }}
                                            disabled={idx === 0}
                                            className="p-1 rounded bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/40 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                            title="Move up (Shift+↑)"
                                        >
                                            <ArrowUp size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                moveItem(idx, "down");
                                            }}
                                            disabled={idx === items.length - 1}
                                            className="p-1 rounded bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/40 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                                            title="Move down (Shift+↓)"
                                        >
                                            <ArrowDown size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700 gap-3">
                    <span className="text-xs text-gray-500">
                        {items.length} lines •{" "}
                        {hasConflicts
                            ? `${timeConflicts.filter(Boolean).length} time conflict(s) will be fixed`
                            : "No conflicts"}
                    </span>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 border border-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-5 py-2 rounded-lg text-sm font-bold bg-primary text-black hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-primary/20"
                        >
                            Apply Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
