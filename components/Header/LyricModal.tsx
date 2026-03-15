import { SongMetaEditorModal } from "@/components/Meta/EditorModal";
import { useAuth } from "@/composables/useAuth";
import { LyricData } from "@composables/types";
import {
    AlertTriangle,
    Check,
    Download,
    FileJson2,
    Upload,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

type Tab = "committed" | "uncommitted";

interface LyricModalProps {
    isOpen: boolean;
    committedJson: string;
    uncommittedJson: string;
    lyrics: LyricData;
    onClose: () => void;
    onUpdateUncommitted: (newJson: string) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSwitchToUpload: () => void;
}

export const LyricModal: React.FC<LyricModalProps> = ({
    isOpen,
    committedJson,
    uncommittedJson,
    lyrics,
    onClose,
    onUpdateUncommitted,
    onFileUpload,
    onSwitchToUpload,
}) => {
    const { user } = useAuth();
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>("committed");
    const [editableJson, setEditableJson] = useState(uncommittedJson);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditableJson(uncommittedJson);
    }, [uncommittedJson]);

    const isEditable = activeTab === "uncommitted";
    const currentContent = isEditable ? editableJson : committedJson;

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(currentContent);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    }, [currentContent]);

    const handleDownload = useCallback(() => {
        const blob = new Blob([JSON.stringify(lyrics, null, 4)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "original.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsDownloaded(true);
        setTimeout(() => setIsDownloaded(false), 2000);
    }, [lyrics]);

    const handleApplyChanges = () => {
        try {
            if (!window.confirm("您確定要將JSON更動應用於尚未提交的歌詞嗎？"))
                return;
            JSON.parse(editableJson) as LyricData;
            onUpdateUncommitted(editableJson);
            onClose();
        } catch {
            alert(
                "Invalid JSON format in Uncommitted tab. Please fix it before applying changes.",
            );
        }
    };

    const btnBase =
        "group flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold border transition-all duration-200";

    return (
        <SongMetaEditorModal
            isOpen={isOpen}
            onClose={onClose}
            title="Lyric JSON"
            icon={<FileJson2 size={20} />}
            accentColor="#4ade80"
            maxWidthClass="max-w-4xl"
            actions={
                <div className="flex gap-2">
                    <label
                        className={`${btnBase} bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-gray-400 hover:text-white cursor-pointer`}
                    >
                        <Upload
                            size={14}
                            className="group-hover:scale-110 transition-transform"
                        />
                        <span className="uppercase tracking-wide text-xs">
                            Import
                        </span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={(e) => {
                                onFileUpload(e);
                                if (fileInputRef.current)
                                    fileInputRef.current.value = "";
                                onClose();
                            }}
                        />
                    </label>

                    {user ? (
                        <button
                            onClick={onSwitchToUpload}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white transition-all"
                        >
                            <FileJson2 size={13} />
                            Data Upload
                        </button>
                    ) : (
                        <></>
                    )}
                </div>
            }
            footer="Committed 為唯讀。Uncommitted 可直接編輯後 Apply，套用前請確保格式正確。"
        >
            <div className="flex flex-col gap-0 " style={{ height: "60vh" }}>
                {/* Sub-tab bar */}
                <div className="flex gap-1 mb-5 bg-black/30 p-1 rounded-4xl border border-white/8">
                    {(["committed", "uncommitted"] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className={`flex-1 py-2 rounded-4xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                                activeTab === t
                                    ? "bg-primary/20 text-primary border border-primary/30"
                                    : "text-gray-500 hover:text-gray-300"
                            }`}
                        >
                            {t === "committed" ? "Committed" : "Uncommitted"}
                            <span
                                className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                                    t === "committed"
                                        ? "text-emerald-300 bg-emerald-900/40 border-emerald-700"
                                        : "text-yellow-300 bg-yellow-900/40 border-yellow-700"
                                }`}
                            >
                                {t === "committed" ? "Read-Only" : "Editable"}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Warning */}
                {isEditable && (
                    <div className="px-4 py-2.5 bg-red-800/20 border-b border-red-700/40 text-red-300 flex items-center gap-2.5 text-xs">
                        <AlertTriangle
                            size={13}
                            className="text-red-400 shrink-0"
                        />
                        應用前請務必確保 JSON
                        格式正確，或先將重要更動提交，否則將可能會造成
                        <span className="font-black">災難性後果</span>！
                    </div>
                )}

                {/* Textarea */}
                <textarea
                    className={`flex-1 text-green-400 p-4 text-base resize-none outline-none font-mono leading-relaxed ${
                        isEditable ? "bg-[#251e1e]" : "bg-[#1e1e1e]"
                    }`}
                    readOnly={!isEditable}
                    value={currentContent}
                    onChange={
                        isEditable
                            ? (e) => setEditableJson(e.target.value)
                            : undefined
                    }
                    placeholder="JSON Content"
                />

                {/* Toolbar */}
                <div className="flex items-center justify-between pt-3 border-t border-white/8">
                    <div className="flex gap-2">
                        <button
                            onClick={handleDownload}
                            disabled={isDownloaded}
                            className={`${btnBase} ${
                                isDownloaded
                                    ? "bg-green-500/15 border-green-500/30 text-green-400 cursor-not-allowed"
                                    : "bg-white/5 hover:bg-primary/10 border-white/10 hover:border-primary/40 text-gray-400 hover:text-primary cursor-pointer"
                            }`}
                        >
                            {isDownloaded ? (
                                <Check size={14} />
                            ) : (
                                <Download
                                    size={14}
                                    className="group-hover:scale-110 transition-transform"
                                />
                            )}
                            <span className="uppercase tracking-wide text-xs">
                                {isDownloaded ? "Downloaded!" : "Download"}
                            </span>
                        </button>
                    </div>
                    <div className="flex gap-2 items-center">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-white hover:bg-white/5 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCopy}
                            disabled={isCopied}
                            className={`${btnBase} ${
                                isCopied
                                    ? "bg-green-500/15 border-green-500/30 text-green-400 cursor-not-allowed"
                                    : "bg-white/5 hover:bg-primary/10 border-white/10 hover:border-primary/40 text-gray-400 hover:text-primary cursor-pointer"
                            }`}
                        >
                            {isCopied && <Check size={14} />}
                            <span className="uppercase tracking-wide text-xs">
                                {isCopied ? "Copied!" : "Copy JSON"}
                            </span>
                        </button>
                        {isEditable && (
                            <button
                                onClick={handleApplyChanges}
                                className={`${btnBase} bg-red-500/10 hover:bg-red-500/20 border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 cursor-pointer`}
                            >
                                <span className="uppercase tracking-wide text-xs">
                                    Apply Changes
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </SongMetaEditorModal>
    );
};
