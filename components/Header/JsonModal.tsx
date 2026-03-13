import React, { useState, useCallback, useEffect, useRef } from "react";
import { AlertTriangle, Check, Download, Upload, X } from "lucide-react";
import { LyricData } from "@/composables/types";

// 定義分頁類型
type Tab = "committed" | "uncommitted";

interface JsonModalProps {
    committedJson: string;
    uncommittedJson: string;
    onClose: () => void;
    onUpdateUncommitted: (newJson: string) => void;
    lyrics: LyricData;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const JsonModal: React.FC<JsonModalProps> = ({
    committedJson,
    uncommittedJson,
    lyrics,
    onClose,
    onUpdateUncommitted,
    onFileUpload,
}) => {
    const [isCopied, setIsCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("committed"); // 預設顯示 Committed
    const [editableJson, setEditableJson] = useState(uncommittedJson); // 用於 Uncommitted tab 的內部編輯狀態
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDownloaded, setIsDownloaded] = useState(false);

    // 複製操作
    const handleCopy = useCallback(() => {
        const contentToCopy =
            activeTab === "committed" ? committedJson : editableJson;
        navigator.clipboard.writeText(contentToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }, [committedJson, editableJson, activeTab]);

    // 處理可編輯 JSON 的變更
    const handleJsonChange = (
        event: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
        setEditableJson(event.target.value);
    };

    // 應用變更 (僅用於 Uncommitted Tab)
    const handleApplyChanges = () => {
        try {
            if (window.confirm("您確定要將JSON更動應用於尚未提交的歌詞嗎？")) {
                // 嘗試解析 JSON 以確保格式正確
                JSON.parse(editableJson) as LyricData;
                // 如果解析成功，則調用外部更新函數
                onUpdateUncommitted(editableJson);
                // 關閉 Modal 或給出成功提示 (這裡選擇關閉)
                onClose();
            }
        } catch (error) {
            alert(
                "Invalid JSON format in Uncommitted tab. Please fix it before applying changes.",
            );
            console.error(error);
        }
    };

    const downloadJson = useCallback(() => {
        const jsonStr = JSON.stringify(lyrics, null, 4);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "original.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsDownloaded(true);
        setTimeout(() => setIsDownloaded(false), 2000);
    }, [lyrics]);

    // 當外部的 uncommittedJson 改變時，更新內部的編輯狀態
    // 這確保了從 App.tsx 來的最新 stagedLyrics 總是被顯示
    useEffect(() => {
        setEditableJson(uncommittedJson);
    }, [uncommittedJson]);

    // 選擇顯示的內容和是否可編輯
    const isEditable = activeTab === "uncommitted";
    const currentContent =
        activeTab === "committed" ? committedJson : editableJson;

    return (
        <div className="fixed inset-0 bg-black/80 z-52 flex items-center justify-center p-10 backdrop-blur-sm">
            <div className="bg-panel w-full max-w-5xl h-[90vh] rounded-xl shadow-2xl flex flex-col border border-gray-600">
                {/* 標頭與分頁 */}
                <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            Generated Lyrics JSON
                        </h2>
                        <button
                            onClick={onClose}
                            className="cursor-pointer text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition"
                            title="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="mt-4 flex border-b border-gray-600">
                        <button
                            onClick={() => setActiveTab("committed")}
                            className={`px-4 py-2 font-medium transition ${
                                activeTab === "committed"
                                    ? "text-primary border-b-2 border-primary"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            <div className="flex flex-row gap-2 items-center">
                                <span>Committed Lyrics</span>

                                <span className="text-emerald-300 bg-emerald-900/40 rounded-2xl px-2 text-xs font-semibold border border-emerald-700">
                                    Read-Only
                                </span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab("uncommitted")}
                            className={`px-4 py-2 font-medium transition ${
                                activeTab === "uncommitted"
                                    ? "text-primary border-b-2 border-primary"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            <div className="flex flex-row gap-2 items-center">
                                <span>Uncommitted Lyrics</span>

                                <span className="text-yellow-300 bg-yellow-900/40 rounded-2xl px-2 text-xs font-semibold border border-yellow-700">
                                    Editable
                                </span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* --- 新增：Uncommitted Tab 的警語 --- */}
                {isEditable && (
                    <div className="p-4 bg-red-800/30 border-b border-red-700 text-red-300 flex items-center gap-3">
                        <AlertTriangle
                            size={20}
                            className="text-red-400 shrink-0"
                        />
                        <span className="font-semibold text-sm">
                            應用前請務必確保 JSON
                            格式正確，或先將重要更動提交，否則將可能會造成
                            <span className="text-lg">災難性後果</span>！
                        </span>
                    </div>
                )}
                {/* --- 警語結束 --- */}

                {/* 內容區 - 使用 textarea */}
                <textarea
                    className={`flex-1 ${
                        isEditable ? "bg-[#251e1e]" : "bg-[#1e1e1e]" // 編輯狀態下給予不同背景色
                    } text-green-400 p-4 text-sm resize-none outline-none font-mono leading-relaxed`}
                    readOnly={!isEditable} // 根據 Tab 決定是否唯讀
                    value={currentContent}
                    onChange={isEditable ? handleJsonChange : undefined}
                    placeholder="JSON Content"
                />

                {/* 底部按鈕區 */}
                <div className="p-4 border-t border-white/5 flex justify-between items-center">
                    {/* Left: file utilities */}

                    <div className="flex gap-2">
                        {isEditable && (
                            <div>
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
                                        Import
                                    </span>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        accept=".json"
                                        onChange={(e) => {
                                            onFileUpload(e);
                                            if (fileInputRef.current)
                                                fileInputRef.current.value = "";
                                            onClose();
                                        }}
                                    />
                                </label>
                            </div>
                        )}

                        {/* Download */}
                        <button
                            onClick={downloadJson}
                            disabled={isDownloaded}
                            className={`
                                group flex items-center gap-2
                                px-3 py-2 rounded-lg text-sm font-semibold
                                border transition-all duration-200
                                ${
                                    isDownloaded
                                        ? "bg-green-500/15 border-green-500/30 text-green-400 cursor-not-allowed"
                                        : "bg-white/5 hover:bg-primary/10 border-white/10 hover:border-primary/40 text-gray-400 hover:text-primary cursor-pointer"
                                }
                            `}
                        >
                            {isDownloaded ? (
                                <Check size={14} />
                            ) : (
                                <Download
                                    size={14}
                                    className="transition-transform duration-200 group-hover:scale-110"
                                />
                            )}
                            <span className="uppercase tracking-wide text-xs">
                                {isDownloaded ? "Downloaded!" : "Download"}
                            </span>
                        </button>
                    </div>

                    {/* Right: cancel / copy / apply */}
                    <div className="flex gap-2 items-center">
                        {/* Cancel — ghost */}
                        <button
                            onClick={onClose}
                            className="
                                px-4 py-2 rounded-lg text-sm font-semibold
                                text-gray-500 hover:text-white
                                hover:bg-white/5
                                transition-all duration-200
                            "
                        >
                            Cancel
                        </button>

                        {/* Copy */}
                        <button
                            onClick={handleCopy}
                            disabled={isCopied}
                            className={`
                                group flex items-center gap-2
                                px-4 py-2 rounded-lg text-sm font-semibold
                                border transition-all duration-200
                                ${
                                    isCopied
                                        ? "bg-green-500/15 border-green-500/30 text-green-400 cursor-not-allowed"
                                        : "bg-white/5 hover:bg-primary/10 border-white/10 hover:border-primary/40 text-gray-400 hover:text-primary cursor-pointer"
                                }
                            `}
                        >
                            {isCopied && <Check size={14} />}
                            <span className="uppercase tracking-wide text-xs">
                                {isCopied ? "Copied!" : "Copy JSON"}
                            </span>
                        </button>

                        {/* Apply Changes — destructive */}
                        {isEditable && (
                            <button
                                onClick={handleApplyChanges}
                                className="
                                    flex items-center gap-2
                                    px-4 py-2 rounded-lg text-sm font-semibold
                                    bg-red-500/10 hover:bg-red-500/20
                                    border border-red-500/30 hover:border-red-500/50
                                    text-red-400 hover:text-red-300
                                    cursor-pointer transition-all duration-200
                                "
                            >
                                <span className="uppercase tracking-wide text-xs ">
                                    Apply Changes
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
