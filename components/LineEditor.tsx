import React, { useState } from "react";
import { LyricLine, LyricPhrase } from "../types";
import { PhraseEditor } from "./PhraseEditor";
import {
    Clock,
    Plus,
    Trash2,
    MoveRight,
    Mic2,
    GripVertical,
    Pencil,
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
    // --- State: Drag and Drop ---
    const [dragState, setDragState] = useState<{
        type: "main" | "bg";
        index: number;
    } | null>(null);

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
                // 使用解構賦值移除屬性
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
                    translation: "", // 初始化翻譯
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

    // --- Handlers: Secondary Vocalist ---
    const toggleIsSecondary = () => {
        onUpdate(index, { ...line, is_secondary: !line.is_secondary });
    };

    // --- NEW Handler: Together Vocalist ---
    const toggleIsTogether = () => {
        onUpdate(index, { ...line, is_together: !line.is_together });
    };

    // --- Logic: Drag and Drop ---
    const handleDragStart = (
        e: React.DragEvent,
        type: "main" | "bg",
        idx: number,
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
        targetIndex: number,
    ) => {
        e.preventDefault();

        if (!dragState || dragState.type !== targetType) {
            setDragState(null);
            return;
        }

        if (dragState.index === targetIndex) {
            setDragState(null);
            return;
        }

        // 獲取當前列表的副本
        let currentList: LyricPhrase[] = [];
        if (targetType === "main") {
            currentList = [...(line.text || [])];
        } else if (line.background_voice) {
            currentList = [...(line.background_voice.text || [])];
        } else {
            setDragState(null);
            return;
        }

        // 執行移動
        const itemToMove = currentList[dragState.index];
        currentList.splice(dragState.index, 1);
        currentList.splice(targetIndex, 0, itemToMove);

        // 更新狀態
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

    // --- Render: Preview Mode ---
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
                    {/* Secondary Vocalist Marker */}
                    {line.is_secondary && (
                        <span
                            className="text-xs font-black italic text-orange-400 bg-orange-900/20 px-1 rounded-sm leading-none"
                            title="Secondary Vocalist Line"
                        >
                            Secondary
                        </span>
                    )}
                    {/* NEW: Together Vocalist Marker */}
                    {line.is_together && (
                        <span
                            className="text-xs font-black italic text-blue-400 bg-blue-900/20 px-1 rounded-sm leading-none"
                            title="Together Vocalist Line"
                        >
                            Together
                        </span>
                    )}
                </div>

                {/* Content Preview (Click to Edit) */}
                <div
                    className="flex-1 space-y-2 cursor-pointer"
                    onClick={onEditStart}
                    title="Click to edit"
                >
                    {/* Main Text / Special Type */}
                    <div className="flex flex-wrap gap-1">
                        {isSpecialType && (
                            <span className="text-base text-gray-500 uppercase border border-gray-700 px-1 rounded">
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

                    {/* Translation Preview */}
                    {line.translation && (
                        <p className="text-gray-400 text-xs italic mt-1 pt-1 border-t border-white/5">
                            {line.translation}
                        </p>
                    )}

                    {/* BG Voice Preview */}
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

                {/* Edit Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEditStart();
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-gray-700 text-white rounded hover:bg-primary hover:text-black transition-all opacity-0 group-hover:opacity-100 shadow-lg z-10"
                    title="Edit Line" // 編輯行
                >
                    <Pencil size={16} />
                </button>
            </div>
        );
    }

    // --- Render: Editing Mode ---
    return (
        <div
            className={`mb-4 p-4 rounded-lg border transition-all duration-300 ${
                isCurrent
                    ? "is-current bg-dark/80 border-primary shadow-[0_0_15px_rgba(74,194,215,0.3)] transform scale-[1.01]"
                    : "bg-panel border-gray-700 hover:border-gray-500"
            }`}
        >
            {/* 1. Toolbar Header (Time & Type & Actions) */}
            <div className="flex items-center gap-3 mb-3 flex-wrap">
                {/* Time Control (Main) */}
                <div className="bg-black/30 rounded p-1 flex items-center gap-2 border border-gray-600">
                    <button
                        onClick={() => onStampTime(index, false)}
                        className="p-1.5 hover:bg-primary hover:text-black rounded text-primary transition-colors"
                        title="Stamp current player time" // 標記當前播放時間
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
                        title="Main lyrics start time (MM:SS.ss)" // 主歌詞起始時間
                    />
                    <button
                        onClick={() => onSeek(line.time)}
                        className="p-1.5 hover:bg-white/20 rounded text-gray-400 transition-colors"
                        title="Seek player to this time" // 跳轉到該時間點
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

                <div className="flex flex-row gap-2">
                    {/* Toggle Secondary Vocalist Button */}
                    {!isSpecialType && (
                        <button
                            onClick={toggleIsSecondary}
                            disabled={line.is_together}
                            className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold transition-colors mr-2 ${
                                line.is_secondary
                                    ? "bg-orange-900/40 text-orange-300 border border-orange-500/50"
                                    : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                            }
                            ${
                                line.is_together
                                    ? "cursor-not-allowed bg-gray-700 text-gray-400 opacity-50"
                                    : ""
                            }`}
                            title={
                                line.is_together
                                    ? "Not adjustable when set to Together"
                                    : line.is_secondary
                                      ? "Set as Primary Vocalist" // 設為主唱
                                      : "Set as Secondary Vocalist" // 設為副唱
                            }
                        >
                            <span className="text-sm font-black italic">
                                {line.is_secondary ? "2" : "1"}
                            </span>
                            {line.is_secondary ? "Secondary" : "Primary"}
                        </button>
                    )}

                    {/* NEW: Toggle Together Button */}
                    <button
                        onClick={toggleIsTogether}
                        className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold transition-colors mr-2 ${
                            line.is_together // 假設 line.is_together 存在
                                ? "bg-blue-900/40 text-blue-300 border border-blue-500/50"
                                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                        }`}
                        title={
                            line.is_together
                                ? "Set as Primary/Secondary" // 設為主唱/副唱
                                : "Set as Together" // 設為合唱
                        }
                    >
                        <span className="text-sm font-black italic">1/2</span>
                        Together
                    </button>

                    {/* Delete Line Button */}
                    <button
                        onClick={() => onDelete(index)}
                        className="p-1.5 text-red-400 hover:bg-red-900/40 rounded transition-colors"
                        title="Delete Line" // 刪除整行
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* 2. Main Lyrics Editor */}

            {/* Marker Content (for Special Types) */}
            {isSpecialType && (
                <div className="text-gray-500 italic text-center py-2 border border-dashed border-gray-700 rounded bg-black/20 mb-3">
                    {line.type?.toUpperCase()} MARKER
                </div>
            )}
            {!isSpecialType && (
                <div className="bg-black/20 p-3 rounded-lg border border-gray-700/50">
                    <div className="flex flex-wrap gap-2">
                        {line.text?.map((phrase, pIndex) => (
                            <div
                                key={pIndex}
                                // --- 修改 1: 移除外層的 draggable 和 onDragStart ---
                                // 這裡不再設定 draggable={true}，讓瀏覽器恢復預設行為（允許文字選取）

                                // --- 保留放置目標 (Drop Target) 的功能 ---
                                // 這樣您仍然可以將其他項目「放」到這個區塊上來進行交換
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, "main", pIndex)}
                                // --- 修改 2: 調整樣式 ---
                                // 移除了 'cursor-grab'，因為現在只有手柄可以抓取
                                className={`relative ${
                                    dragState?.type === "main" &&
                                    dragState.index === pIndex
                                        ? "opacity-50 border-2 border-primary"
                                        : ""
                                }`}
                            >
                                <PhraseEditor
                                    phrase={phrase}
                                    onChange={(updatedPhrase) =>
                                        handlePhraseChange(
                                            pIndex,
                                            updatedPhrase,
                                        )
                                    }
                                    onDelete={() => deletePhrase(pIndex)}
                                />

                                {/* --- 修改 3: 建立專用的拖曳手柄 (Drag Handle) --- */}
                                <div
                                    // 將 draggable 屬性移到這個包裝 div 上
                                    draggable={true}
                                    // 綁定拖曳開始事件
                                    onDragStart={(e) => {
                                        // (選擇性) 設定拖曳時的殘影為整個區塊，而不僅僅是那個小圖示
                                        // 這樣視覺上會覺得是在拖曳整張卡片
                                        const target =
                                            e.currentTarget as HTMLElement;
                                        const parentCard =
                                            target.closest(".relative");
                                        if (parentCard) {
                                            e.dataTransfer.setDragImage(
                                                parentCard,
                                                0,
                                                0,
                                            );
                                        }

                                        // 呼叫原本的處理函數
                                        handleDragStart(e, "main", pIndex);
                                    }}
                                    // 將原本在 GripVertical 上的樣式移到這個 div，並加入 cursor-grab
                                    className="absolute top-0.5 left-0.5 p-1 cursor-grab active:cursor-grabbing hover:bg-black/10 rounded transition-colors z-10"
                                    title="Drag to reorder" // 拖曳以重新排序
                                >
                                    <GripVertical
                                        size={16}
                                        // 圖示本身只需負責顏色
                                        className="text-gray-500/50 hover:text-gray-300"
                                    />
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={addPhrase}
                            className="flex items-center justify-center h-16 w-16 border border-dashed border-gray-500/50 rounded-md text-gray-500/50 hover:text-primary hover:border-primary hover:bg-white/5 transition-all"
                            title="Add Phrase" // 新增歌詞片段
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                    {/* Main Translation Input */}
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

            {/* Toggle Background Voice Button */}
            {!line.background_voice && (
                <button
                    onClick={toggleBackgroundVoice}
                    disabled={line.background_voice ? true : false}
                    className={`flex items-center gap-2 px-3 py-1 mt-4 rounded text-xs font-bold transition-colors ${
                        line.background_voice
                            ? "bg-purple-900/40 text-purple-300 border border-purple-500/50"
                            : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                    }`}
                    title={
                        line.background_voice
                            ? "Remove BG Voice Track" // 移除背景音軌
                            : "Add BG Voice Track" // 新增背景音軌
                    }
                >
                    <Mic2 size={14} />
                    Add BG Voice
                </button>
            )}

            {/* 3. Background Voice Editor (Conditional) */}
            {line.background_voice && (
                <div className="bg-purple-900/10 p-3 rounded-lg border border-purple-800/50 mt-4">
                    <div className="flex items-center gap-2 justify-start mb-2">
                        <div
                            className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold transition-colors ${
                                line.background_voice
                                    ? "bg-purple-900/40 text-purple-300 border border-purple-500/50"
                                    : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                            }`}
                            title={
                                line.background_voice
                                    ? "Remove BG Voice Track" // 移除背景音軌
                                    : "Add BG Voice Track" // 新增背景音軌
                            }
                        >
                            <Mic2 size={14} />
                            BG Voice
                        </div>
                        {/* Time Control (BG) */}
                        <div className="bg-black/30 rounded p-1 flex items-center gap-2 border border-purple-600/50">
                            <button
                                onClick={() => onStampTime(index, true)}
                                className="p-1.5 hover:bg-purple-500/50 rounded text-purple-300 transition-colors"
                                title="Stamp BG time" // 標記背景音軌的當前播放時間
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
                                title="BG Voice start time (MM:SS.ss)" // 背景音軌起始時間
                            />
                            <button
                                onClick={() =>
                                    onSeek(line.background_voice!.time)
                                }
                                className="p-1.5 hover:bg-white/20 rounded text-gray-400 transition-colors"
                                title="Seek player to this time" // 跳轉到該時間點
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

                    <div className="flex flex-wrap gap-2">
                        {line.background_voice.text?.map((phrase, pIndex) => (
                            <div
                                key={pIndex}
                                // --- 修改 1: 移除外層的 draggable 和 onDragStart ---
                                // 這裡不再設定 draggable={true}，讓瀏覽器恢復預設行為（允許文字選取）

                                // --- 保留放置目標 (Drop Target) 的功能 ---
                                // 這樣您仍然可以將其他項目「放」到這個區塊上來進行交換
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, "bg", pIndex)}
                                // --- 修改 2: 調整樣式 ---
                                // 移除了 'cursor-grab'，因為現在只有手柄可以抓取
                                className={`relative ${
                                    dragState?.type === "bg" &&
                                    dragState.index === pIndex
                                        ? "opacity-50 border-2 border-primary"
                                        : ""
                                }`}
                            >
                                <PhraseEditor
                                    phrase={phrase}
                                    onChange={(updatedPhrase) =>
                                        handleBgPhraseChange(
                                            pIndex,
                                            updatedPhrase,
                                        )
                                    }
                                    onDelete={() => deleteBgPhrase(pIndex)}
                                />

                                {/* --- 修改 3: 建立專用的拖曳手柄 (Drag Handle) --- */}
                                <div
                                    // 將 draggable 屬性移到這個包裝 div 上
                                    draggable={true}
                                    // 綁定拖曳開始事件
                                    onDragStart={(e) => {
                                        // (選擇性) 設定拖曳時的殘影為整個區塊，而不僅僅是那個小圖示
                                        // 這樣視覺上會覺得是在拖曳整張卡片
                                        const target =
                                            e.currentTarget as HTMLElement;
                                        const parentCard =
                                            target.closest(".relative");
                                        if (parentCard) {
                                            e.dataTransfer.setDragImage(
                                                parentCard,
                                                0,
                                                0,
                                            );
                                        }

                                        // 呼叫原本的處理函數
                                        handleDragStart(e, "bg", pIndex);
                                    }}
                                    // 將原本在 GripVertical 上的樣式移到這個 div，並加入 cursor-grab
                                    className="absolute top-0.5 left-0.5 p-1 cursor-grab active:cursor-grabbing hover:bg-black/10 rounded transition-colors z-10"
                                    title="Drag to reorder" // 拖曳以重新排序
                                >
                                    <GripVertical
                                        size={16}
                                        // 圖示本身只需負責顏色
                                        className="text-gray-500/50 hover:text-gray-300"
                                    />
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={addBgPhrase}
                            className="flex items-center justify-center h-16 w-16 border border-dashed border-purple-500/50 rounded-md text-purple-500/50 hover:text-purple-300 hover:border-purple-400 hover:bg-purple-500/10 transition-all"
                            title="Add Background Phrase" // 新增背景歌詞片段
                        >
                            <Plus size={24} />
                        </button>
                    </div>

                    {/* Background Translation Input */}
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
