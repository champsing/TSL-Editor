import React, { useRef } from "react";
import { Copy, FileJson, MoveRight, Clock, Upload } from "lucide-react";
import { YouTubePlayer, YouTubePlayerHandle } from "./YouTubePlayer";

interface EditorSidebarProps {
    videoId: string;
    playerRef: React.RefObject<YouTubePlayerHandle>;
    onTimeUpdate: (time: number) => void;
    onIsPlayingChange: (isPlaying: boolean) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onViewJson: () => void;
    onCopyJson: () => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
    videoId,
    playerRef,
    onTimeUpdate,
    onIsPlayingChange,
    onFileUpload,
    onViewJson,
    onCopyJson,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="w-[400px] bg-black flex flex-col border-l border-gray-800 shadow-2xl z-10">
            {/* YouTube Player */}
            <div className="h-relative bg-black aspect-video">
                <YouTubePlayer
                    ref={playerRef}
                    videoId={videoId}
                    onTimeUpdate={onTimeUpdate}
                    onIsPlayingChange={onIsPlayingChange}
                />
            </div>

            {/* Sidebar Content (Tips & Actions) */}
            <div className="p-4 flex-1 bg-dark text-gray-300 text-sm overflow-y-auto">
                <h3 className="text-primary font-bold mb-2 text-lg">
                    快捷鍵與提示 (Shortcuts & Tips)
                </h3>
                <ul className="space-y-2 list-disc pl-4 text-gray-400">
                    <li>
                        點擊{" "}
                        <span className="text-white font-bold mx-1">
                            <Clock size={12} className="inline" />
                        </span>{" "}
                        將行時間同步到當前播放時間。
                    </li>
                    <li>
                        點擊{" "}
                        <span className="text-white font-bold mx-1">
                            <MoveRight size={12} className="inline" />
                        </span>{" "}
                        將影片跳轉到該行時間。
                    </li>
                    <li>拖動 YouTube 播放器的進度條進行精確定位。</li>
                    <li>
                        "Duration" 欄位用於卡拉 OK 視覺效果的持續時間 (近似值)。
                    </li>
                </ul>
                <div className="mt-6 p-3 bg-blue-900/20 border border-blue-500/30 rounded text-blue-200">
                    <p>
                        <strong>注意:</strong> 時間格式為 <code>MM:SS.mm</code>
                        。
                    </p>
                    <p>只有當影片暫停時才能新增行。</p>
                    <p>
                        編輯後可以點擊{" "}
                        <strong className="text-red-400">Commit</strong>{" "}
                        按鈕提交變更；或點擊{" "}
                        <strong className="text-gray-300">Discard</strong>{" "}
                        按鈕還原。
                    </p>
                </div>

                {/* File/JSON Actions */}
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
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm transition"
                    >
                        <FileJson size={16} />
                        View JSON
                    </button>
                    {/* Copy JSON Button */}
                    <button
                        onClick={onCopyJson}
                        className="bg-primary hover:bg-teal-300 text-dark font-semibold px-4 py-2 rounded-md flex items-center gap-2 text-sm shadow-[0_0_10px_rgba(74,194,215,0.3)] transition"
                    >
                        <Copy size={16} />
                        Copy JSON
                    </button>
                </div>
            </div>
        </div>
    );
};
