import React, { useEffect, useState } from "react";
import { LyricLine, LyricPhrase } from "@composables/types";
import { PhraseEditor } from "./PhraseEditor";
import { PhraseReorderBar } from "./PhraseReorderBar";
import {
    Clock,
    Plus,
    Trash2,
    MoveRight,
    Mic2,
    Pencil,
    Rows3,
    ArrowRightLeft,
} from "lucide-react";

interface LineEditorProps {
    index: number;
    line: LyricLine;
    isCurrent: boolean;
    isEditing: boolean;
    onEditStart: () => void;
    onUpdate: (index: number, newLine: LyricLine) => void;
    onDelete: (index: number) => void;
    onStampTime: (index: number, bg: boolean) => void;
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
    const [reorderMode, setReorderMode] = useState(false);

    // Close reorder mode when editing ends
    useEffect(() => {
        if (!isEditing) setReorderMode(false);
    }, [isEditing]);

    const isSpecialType = !!line.type && line.type !== "normal";

    // --- Handlers: Main Text ---
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

    // --- Handlers: Background Voice ---
    const toggleBackgroundVoice = () => {
        if (line.background_voice) {
            if (window.confirm("Remove background voice track?")) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { background_voice, ...rest } = line;
                onUpdate(index, rest);
            }
        } else {
            onUpdate(index, {
                ...line,
                background_voice: {
                    time: line.time,
                    text: [{ phrase: "", duration: 20 }],
                    translation: "",
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
        updatedPhrase: LyricPhrase,
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
            (_, i) => i !== pIndex,
        );
        onUpdate(index, {
            ...line,
            background_voice: { ...line.background_voice, text: newText },
        });
    };

    // --- Handlers: Vocalist toggles ---
    const toggleIsSecondary = () => {
        onUpdate(index, { ...line, is_secondary: !line.is_secondary });
    };

    const toggleIsTogether = () => {
        onUpdate(index, { ...line, is_together: !line.is_together });
    };

    // --- Render: Preview Mode ---
    if (!isEditing) {
        return (
            <div
                className={`mb-2 p-4 rounded-2xl transition-all relative group flex items-start gap-4 ${
                    isCurrent
                        ? "bg-white/20 border-primary border-2 shadow-2xl scale-[1.01] duration-50"
                        : "bg-white/5 border-white/10 border duration-300"
                }`}
            >
                <div className="flex flex-col items-center gap-1 min-w-18 pt-1">
                    <span className="font-mono text-primary font-bold text-lg">
                        {line.time}
                    </span>
                    {line.is_secondary && (
                        <span
                            className="text-xs font-black italic text-orange-400 bg-orange-900/20 px-1 rounded-sm leading-none"
                            title="Secondary Vocalist Line"
                        >
                            Secondary
                        </span>
                    )}
                    {line.is_together && (
                        <span
                            className="text-xs font-black italic text-blue-400 bg-blue-900/20 px-1 rounded-sm leading-none"
                            title="Together Vocalist Line"
                        >
                            Together
                        </span>
                    )}
                </div>

                <div
                    className="flex-1 space-y-2 cursor-pointer"
                    onClick={onEditStart}
                    title="Click to edit"
                >
                    <div className="flex flex-wrap gap-1">
                        {isSpecialType && (
                            <span className="text-base text-gray-500 uppercase border border-gray-700/10 px-1 rounded">
                                {line.type}
                            </span>
                        )}
                        {!isSpecialType &&
                            (!line.text || line.text.length === 0) && (
                                <span className="text-gray-500 italic text-sm">
                                    Empty line
                                </span>
                            )}
                        {line.text?.map((p, i) => (
                            <div
                                key={i}
                                className="bg-black/30 px-2 py-0.5 rounded border border-gray-700/50 flex flex-col min-w-8"
                            >
                                <span className="text-gray-200 text-sm font-medium">
                                    {!p.phrase || p.phrase === " "
                                        ? "\u00A0"
                                        : p.phrase}
                                </span>
                                <span className="text-xs text-teal-500/70 font-mono text-right leading-none">
                                    {p.duration}
                                </span>
                            </div>
                        ))}
                    </div>
                    {line.translation && (
                        <p className="text-gray-400 text-xs italic mt-1 pt-1 border-t border-white/5">
                            {line.translation}
                        </p>
                    )}
                    {line.background_voice && (
                        <div className="flex flex-col gap-1 pt-2 border-t border-white/5 mt-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-purple-400 font-bold uppercase tracking-wider">
                                    BG
                                </span>
                                <span className="text-sm text-purple-400 font-bold uppercase tracking-wider">
                                    {line.background_voice.time}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {line.background_voice.text.map((p, i) => (
                                    <div
                                        key={i}
                                        className="bg-purple-900/20 px-2 py-0.5 rounded border border-purple-500/20 flex flex-col"
                                    >
                                        <span className="text-purple-200 text-xs">
                                            {p.phrase || "\u00A0"}
                                        </span>
                                        <span className="text-xs text-purple-400/70 font-mono text-right leading-none">
                                            {p.duration}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {line.background_voice.translation && (
                                <span className="text-gray-400 text-xs italic mt-1 pt-1 border-t border-white/5">
                                    {line.background_voice.translation}
                                </span>
                            )}
                        </div>
                    )}
                </div>

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

    // --- Render: Editing Mode ---
    return (
        <div
            className={`mb-4 p-4 rounded-lg border transition-all duration-300 bg-white/10 ${
                isCurrent
                    ? "is-current border-primary shadow-[0_0_15px_rgba(167,139,250,0.3)] transform scale-[1.01]"
                    : "border-gray-700 hover:border-gray-500"
            }`}
        >
            {/* 1. Toolbar Header */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
                {/* Time Control */}
                <div className="bg-black/40 rounded p-1 flex items-center gap-2 border border-gray-600">
                    <button
                        onClick={() => onStampTime(index, false)}
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
                        title="Main lyrics start time (MM:SS.ss)"
                    />
                    <button
                        onClick={() => onSeek(line.time)}
                        className="p-1.5 hover:bg-white/20 rounded text-gray-400 transition-colors"
                        title="Seek player to this time"
                    >
                        <MoveRight size={16} />
                    </button>
                </div>

                {/* Type Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 uppercase font-bold">
                        Type:
                    </span>
                    <select
                        value={line.type || "normal"}
                        onChange={(e) =>
                            onUpdate(index, {
                                ...line,
                                text:
                                    e.target.value === "normal"
                                        ? line.text
                                        : undefined,
                                translation:
                                    e.target.value === "normal"
                                        ? line.translation
                                        : undefined,
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

                <div className="flex flex-row gap-2 items-center">
                    {/* ── Reorder Mode Toggle ── */}
                    {!isSpecialType && (
                        <button
                            onClick={() => setReorderMode((v) => !v)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${
                                reorderMode
                                    ? "bg-sky-900/40 text-sky-300 border border-sky-500/50 shadow-[0_0_8px_rgba(56,189,248,0.2)]"
                                    : "bg-gray-700 text-gray-400 hover:bg-gray-600 border border-transparent"
                            }`}
                            title={
                                reorderMode
                                    ? "Exit phrase reorder mode"
                                    : "Enter phrase reorder mode"
                            }
                        >
                            <ArrowRightLeft size={13} />
                            {reorderMode ? "Done" : "Reorder"}
                        </button>
                    )}

                    {/* Secondary Vocalist */}
                    {!isSpecialType && (
                        <button
                            onClick={toggleIsSecondary}
                            disabled={line.is_together}
                            className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold transition-colors mr-2 ${
                                line.is_secondary
                                    ? "bg-orange-900/40 text-orange-300 border border-orange-500/50"
                                    : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                            } ${line.is_together ? "cursor-not-allowed opacity-50" : ""}`}
                            title={
                                line.is_together
                                    ? "Not adjustable when set to Together"
                                    : line.is_secondary
                                      ? "Set as Primary Vocalist"
                                      : "Set as Secondary Vocalist"
                            }
                        >
                            <span className="text-sm font-black italic">
                                {line.is_secondary ? "2" : "1"}
                            </span>
                            {line.is_secondary ? "Secondary" : "Primary"}
                        </button>
                    )}

                    {/* Together */}
                    <button
                        onClick={toggleIsTogether}
                        className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold transition-colors mr-2 ${
                            line.is_together
                                ? "bg-blue-900/40 text-blue-300 border border-blue-500/50"
                                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                        }`}
                        title={
                            line.is_together
                                ? "Set as Primary/Secondary"
                                : "Set as Together"
                        }
                    >
                        <span className="text-sm font-black italic">1/2</span>
                        Together
                    </button>

                    {/* Delete Line */}
                    <button
                        onClick={() => onDelete(index)}
                        className="p-1.5 text-red-400 hover:bg-red-900/40 rounded transition-colors"
                        title="Delete Line"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {reorderMode && (
                <span className="text-[10px] uppercase tracking-wider text-teal-400 font-bold">
                    Drag or click a chip then use ← → to reorder
                </span>
            )}

            {/* 2. Main Lyrics Area */}
            {isSpecialType && (
                <div className="text-gray-500 italic text-center py-2 border border-dashed border-gray-700 rounded bg-black/20 mb-3">
                    {line.type?.toUpperCase()} MARKER
                </div>
            )}

            {!isSpecialType && (
                <div
                    className={`p-3 rounded-lg border transition-colors duration-200 ${
                        reorderMode
                            ? "bg-sky-950/30 border-sky-700/40"
                            : "bg-black/20 border-gray-700/50"
                    }`}
                >
                    {reorderMode ? (
                        <>
                            <p className="text-[10px] uppercase tracking-wider text-sky-400 font-bold mb-3">
                                Main
                            </p>
                            <div className="mb-2">
                                <PhraseReorderBar
                                    phrases={line.text ?? []}
                                    variant="main"
                                    onChange={(newPhrases) =>
                                        onUpdate(index, {
                                            ...line,
                                            text: newPhrases,
                                        })
                                    }
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {line.text?.map((phrase, pIndex) => (
                                <PhraseEditor
                                    key={pIndex}
                                    phrase={phrase}
                                    onChange={(updatedPhrase) =>
                                        handlePhraseChange(
                                            pIndex,
                                            updatedPhrase,
                                        )
                                    }
                                    onDelete={() => deletePhrase(pIndex)}
                                />
                            ))}
                            <button
                                onClick={addPhrase}
                                className="flex items-center justify-center h-16 w-16 border border-dashed border-gray-500/50 rounded-md text-gray-500/50 hover:text-primary hover:border-primary hover:bg-white/5 transition-all"
                                title="Add Phrase"
                            >
                                <Plus size={24} />
                            </button>
                        </div>
                    )}

                    {/* Translation */}
                    <div className="mt-4 flex items-center gap-3 bg-black/20 p-2 rounded border border-white/5">
                        <span className="text-xs text-primary font-bold px-2">
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
                            className="w-full bg-transparent outline-none text-gray-200 placeholder-gray-500"
                            placeholder="Main Translation..."
                        />
                    </div>
                </div>
            )}

            {/* Add BG Voice */}
            {!line.background_voice && (
                <button
                    onClick={toggleBackgroundVoice}
                    className="flex items-center gap-2 px-3 py-1 mt-4 rounded text-xs font-bold transition-colors bg-gray-700 text-gray-400 hover:bg-gray-600"
                    title="Add BG Voice Track"
                >
                    <Mic2 size={14} />
                    Add BG Voice
                </button>
            )}

            {/* 3. Background Voice Editor */}
            {line.background_voice && (
                <div className="bg-purple-900/10 p-3 rounded-lg border border-purple-800/50 mt-4">
                    <div className="flex items-center gap-2 justify-start mb-2">
                        <div className="flex items-center gap-2 px-3 py-1 rounded text-xs font-bold bg-purple-900/40 text-purple-300 border border-purple-500/50">
                            <Mic2 size={14} />
                            BG Voice
                        </div>
                        <div className="bg-black/30 rounded p-1 flex items-center gap-2 border border-purple-600/50">
                            <button
                                onClick={() => onStampTime(index, true)}
                                className="p-1.5 hover:bg-purple-500/50 rounded text-purple-300 transition-colors"
                                title="Stamp BG time"
                            >
                                <Clock size={16} />
                            </button>
                            <input
                                type="text"
                                value={line.background_voice.time}
                                onChange={(e) =>
                                    updateBgVoiceTime(e.target.value)
                                }
                                className="bg-transparent w-20 text-center font-mono text-white outline-none text-sm focus:text-purple-400"
                                title="BG Voice start time (MM:SS.ss)"
                            />
                            <button
                                onClick={() =>
                                    onSeek(line.background_voice!.time)
                                }
                                className="p-1.5 hover:bg-white/20 rounded text-gray-400 transition-colors"
                                title="Seek player to this time"
                            >
                                <MoveRight size={16} />
                            </button>
                            <button
                                onClick={toggleBackgroundVoice}
                                className="p-1.5 text-red-400/50 hover:text-red-400"
                                title="Remove BG Voice"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {reorderMode ? (
                        <>
                            <p className="text-[10px] uppercase tracking-wider text-purple-400 font-bold mb-3">
                                BG
                            </p>
                            <div className="mb-2">
                                <PhraseReorderBar
                                    phrases={line.background_voice.text}
                                    variant="bg"
                                    onChange={(newPhrases) =>
                                        onUpdate(index, {
                                            ...line,
                                            background_voice: {
                                                ...line.background_voice!,
                                                text: newPhrases,
                                            },
                                        })
                                    }
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {line.background_voice?.text.map(
                                (phrase, pIndex) => (
                                    <PhraseEditor
                                        key={pIndex}
                                        phrase={phrase}
                                        onChange={(updatedPhrase) =>
                                            handleBgPhraseChange(
                                                pIndex,
                                                updatedPhrase,
                                            )
                                        }
                                        onDelete={() => deleteBgPhrase(pIndex)}
                                    />
                                ),
                            )}
                            <button
                                onClick={addBgPhrase}
                                className="flex items-center justify-center h-16 w-16 border border-dashed border-purple-500/50 rounded-md text-purple-500/50 hover:text-purple-300 hover:border-purple-400 hover:bg-purple-500/10 transition-all"
                                title="Add Background Phrase"
                            >
                                <Plus size={24} />
                            </button>
                        </div>
                    )}

                    {/* BG Translation */}
                    <div className="mt-4 flex items-center gap-3 bg-black/20 p-2 rounded border border-white/5">
                        <span className="text-xs text-purple-400 font-bold px-2">
                            TL
                        </span>
                        <input
                            type="text"
                            value={line.background_voice.translation || ""}
                            onChange={(e) =>
                                onUpdate(index, {
                                    ...line,
                                    background_voice: {
                                        ...line.background_voice!,
                                        translation: e.target.value,
                                    },
                                })
                            }
                            className="w-full bg-transparent outline-none text-gray-300 placeholder-gray-600"
                            placeholder="Background Translation..."
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
