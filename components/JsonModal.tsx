// JsonModal.tsx (修改後)

import React, { useState, useCallback, useEffect } from "react";
import { AlertTriangle, Check, X } from "lucide-react"; // 引入 X 用於關閉按鈕
import { LyricData } from "@/types";

// 定義分頁類型
type Tab = "committed" | "uncommitted";

interface JsonModalProps {
    committedJson: string; // 已提交的 JSON (唯讀)
    uncommittedJson: string; // 尚未提交的 JSON (可編輯)
    onClose: () => void;
    onCopy: () => void; // 複製 committedJson 的操作
    onUpdateUncommitted: (newJson: string) => void; // 新增：更新 stagedLyrics 的回調函數
}

export const JsonModal: React.FC<JsonModalProps> = ({
    committedJson,
    uncommittedJson,
    onClose,
    onUpdateUncommitted, // 接收新的更新函數
}) => {
    const [isCopied, setIsCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("committed"); // 預設顯示 Committed
    const [editableJson, setEditableJson] = useState(uncommittedJson); // 用於 Uncommitted tab 的內部編輯狀態

    // 複製操作
    const handleCopy = useCallback(() => {
        // 僅複製當前活躍的內容
        const contentToCopy =
            activeTab === "committed" ? committedJson : editableJson;
        navigator.clipboard.writeText(contentToCopy); // 直接使用瀏覽器 API 複製

        setIsCopied(true);
        const timer = setTimeout(() => {
            setIsCopied(false);
        }, 2000);

        return () => clearTimeout(timer);
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
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-10 backdrop-blur-sm">
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
                                {/* ✨ 優化後的 Read-Only 標籤設計 */}
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
                                {/* ✨ 優化後的 Editable 標籤設計 */}
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
                <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="cursor-pointer px-4 py-2 text-gray-300 hover:text-white rounded"
                    >
                        Cancel
                    </button>

                    {/* 複製按鈕 - 複製當前分頁的內容 */}
                    <button
                        onClick={handleCopy}
                        className={`
                            ${
                                isCopied
                                    ? "cursor-not-allowed bg-green-500 hover:bg-green-400 text-white"
                                    : "cursor-pointer bg-primary hover:bg-teal-300 text-dark"
                            }
                            font-bold px-6 py-2 rounded shadow flex items-center gap-2 transition
                        `}
                        title={`Copy the content of the ${activeTab} tab`}
                    >
                        {isCopied && <Check size={20} />}
                        {isCopied ? "Copied!" : "Copy JSON"}
                    </button>

                    {/* 應用變更按鈕 (僅在 Uncommitted Tab 顯示) */}
                    {isEditable && (
                        <button
                            onClick={handleApplyChanges}
                            className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2 rounded shadow flex items-center gap-2 transition"
                        >
                            Apply Changes
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
