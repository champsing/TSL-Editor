import React from "react"; // <-- 移除 useState 和 useCallback
import { MoveRight, Clock } from "lucide-react"; // <-- 移除 Copy, FileJson, Upload, Check
import { YouTubePlayer, YouTubePlayerHandle } from "./YouTubePlayer";
import { JsonButtons } from "./JsonButtons"; // <-- 引入新的 JsonButtons
import { LyricData } from "../types"; // <-- 假設 LyricData 的型別需要在這裡引入

interface EditorSidebarProps {
    videoId: string;
    playerRef: React.RefObject<YouTubePlayerHandle>;
    lyrics: LyricData; // <-- 新增 lyrics 屬性 (用於傳給 JsonButtons 下載)
    onTimeUpdate: (time: number) => void;
    onIsPlayingChange: (isPlaying: boolean) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onViewJson: () => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
    videoId,
    playerRef,
    lyrics, // <-- 接收 lyrics
    onTimeUpdate,
    onIsPlayingChange,
    onFileUpload,
    onViewJson,
}) => {
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
                            <MoveRight size={12} className="inline" />
                        </span>{" "}
                        將影片跳轉到該時間。
                    </li>
                    <li>
                        點擊{" "}
                        <span className="text-white font-bold mx-1">
                            <Clock size={12} className="inline" />
                        </span>{" "}
                        將該行起始時間設置為影片當前時間。
                    </li>
                </ul>
                <h3 className="text-primary font-bold mb-2 text-lg mt-3">
                    編輯後可以點擊：
                </h3>
                <ul>
                    <li>
                        <strong className="text-blue-400">Diff</strong>{" "}
                        按鈕查看變更內容。
                    </li>
                    <li>
                        <strong className="text-green-400">Commit</strong>{" "}
                        按鈕提交變更。
                    </li>
                    <li>
                        <strong className="text-red-400">Discard</strong>{" "}
                        按鈕還原。
                    </li>
                </ul>

                <div className="mt-6 p-3 bg-blue-900/20 border border-blue-500/30 rounded text-blue-200">
                    <p>
                        <strong>注意:</strong> 時間格式為 <code>MM:SS.mm</code>
                        。
                    </p>
                    <p>只有當影片暫停時才能新增行。</p>
                </div>

                {/* File/JSON Actions - 使用新組件 */}
                <JsonButtons
                    lyrics={lyrics} // 傳入已提交的歌詞
                    onFileUpload={onFileUpload}
                    onViewJson={onViewJson}
                />
            </div>
        </div>
    );
};
