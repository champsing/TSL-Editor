import React, { useRef, useState, useCallback } from "react";
import { Download, FileJson, Upload, Check } from "lucide-react"; // 引入 Download
import { LyricData } from "../types"; // 假設 LyricData 的型別是從上一層目錄引入的

// --- Helper Function: Download JSON ---
const downloadJson = (data: LyricData, filename = "original.json") => {
    const jsonStr = JSON.stringify(data, null, 4);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

interface JsonButtonsProps {
    lyrics: LyricData; // 傳入已提交的歌詞數據 (用於下載)
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onViewJson: () => void;
}

export const JsonButtons: React.FC<JsonButtonsProps> = ({
    lyrics,
    onFileUpload,
    onViewJson,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDownloaded, setIsDownloaded] = useState(false); // 新增下載狀態

    // 包裝下載邏輯
    const handleDownloadJson = useCallback(() => {
        downloadJson(lyrics); // 執行實際的下載操作
        setIsDownloaded(true); // 設定下載成功狀態

        // 數秒後恢復
        const timer = setTimeout(() => {
            setIsDownloaded(false);
        }, 2000); // 2000 毫秒 (2 秒)

        return () => clearTimeout(timer); // 清除定時器
    }, [lyrics]);

    return (
        <div className="flex gap-2 mt-10">
            {/* Import Button */}
            <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm transition">
                <Upload size={16} />
                Import
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".json"
                    onChange={(e) => {
                        onFileUpload(e);
                        if (fileInputRef.current) {
                            fileInputRef.current.value = ""; // 重設 input 以允許重新上傳相同檔案
                        }
                    }}
                />
            </label>
            {/* View JSON Button */}
            <button
                onClick={onViewJson}
                className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm transition"
            >
                <FileJson size={16} />
                View JSON
            </button>
            {/* Download JSON Button */}
            <button
                onClick={handleDownloadJson} // 使用新的下載處理函數
                className={`
                    ${
                        isDownloaded
                            ? "cursor-not-allowed bg-green-500 hover:bg-green-400 text-white font-semibold shadow-[0_0_10px_rgba(34,197,94,0.5)]" // 下載成功狀態
                            : "cursor-pointer bg-primary hover:bg-teal-300 text-dark font-semibold shadow-[0_0_10px_rgba(74,194,215,0.3)]" // 原始狀態
                    }
                    px-4 py-2 rounded-md flex items-center gap-2 text-sm transition
                `}
            >
                {isDownloaded ? <Check size={16} /> : <Download size={16} />}{" "}
                {isDownloaded ? "Downloaded!" : "Download JSON"}{" "}
            </button>
        </div>
    );
};
