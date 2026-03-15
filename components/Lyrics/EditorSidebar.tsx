import React, { useState } from "react";
import { YouTubePlayer, YouTubePlayerHandle } from "../YouTubePlayer";
// 引入 Volume2 圖標
import { ChevronLeft, ChevronRight, Volume2 } from "lucide-react";
import { varColorPrimary } from "../Meta/EditorModal";

interface EditorSidebarProps {
    videoId: string;
    playerRef: React.RefObject<YouTubePlayerHandle>;
    onTimeUpdate: (time: number) => void;
    onIsPlayingChange: (isPlaying: boolean) => void;
    tempVideoId: string;
    setTempVideoId: (id: string) => void;
    onVideoLoad: () => void;
}

export const EditorSidebar: React.FC<EditorSidebarProps> = ({
    videoId,
    playerRef,
    onTimeUpdate,
    onIsPlayingChange,
    tempVideoId,
    setTempVideoId,
    onVideoLoad,
}) => {
    const [isOpen, setIsOpen] = useState(true);
    // 1. 新增音量狀態，預設與 YouTubePlayer 邏輯一致（例如 60）
    const [volume, setVolume] = useState(60);

    // 2. 音量更動處理函式
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseInt(e.target.value, 10);
        setVolume(newVolume);

        // 透過 ref 呼叫 YouTubePlayer 的 setVolume
        if (playerRef.current) {
            playerRef.current.setVolume(newVolume);
        }
    };

    return (
        <div
            className={`relative h-full transition-all duration-300 ease-in-out border-l border-gray-800 shadow-2xl z-10 bg-black
                ${isOpen ? "w-[400px]" : "w-0"}`}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute top-1/2 -left-6 transform -translate-y-1/2 bg-gray-800 border border-gray-700 text-white p-1 rounded-l-md hover:bg-primary hover:text-dark transition-colors"
                title={isOpen ? "收合" : "展開"}
            >
                {isOpen ? (
                    <ChevronRight size={24} />
                ) : (
                    <ChevronLeft size={24} />
                )}
            </button>

            <div
                className={`h-full flex flex-col overflow-hidden ${!isOpen && "invisible"}`}
            >
                <div className="p-4 flex-1 bg-dark text-gray-300 text-sm overflow-y-auto">
                    {/* YouTube ID Input */}
                    <div className="flex gap-3">
                        <div className="flex items-center gap-4 bg-panel p-1.5 pl-0 rounded-lg border border-gray-700 w-full">
                            <span className="pl-2 text-xs text-gray-400 font-bold tracking-wide">
                                YOUTUBE ID
                            </span>
                            <input
                                type="text"
                                value={tempVideoId}
                                onChange={(e) => setTempVideoId(e.target.value)}
                                placeholder="Enter ID"
                                className="w-full bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm focus:ring-2 focus:ring-primary border border-transparent outline-none"
                            />
                            <button
                                onClick={onVideoLoad}
                                className="cursor-pointer bg-primary hover:bg-teal-300 text-dark px-4 py-1.5 rounded-md font-semibold transition text-sm"
                            >
                                LOAD
                            </button>
                        </div>
                    </div>

                    {/* YouTube Player */}
                    <div className="h-relative aspect-video mt-4 p-4 bg-zinc-900 rounded-2xl">
                        <YouTubePlayer
                            ref={playerRef}
                            videoId={videoId}
                            onTimeUpdate={onTimeUpdate}
                            onIsPlayingChange={onIsPlayingChange}
                        />
                    </div>

                    {/* 3. 新增音量控制 UI */}
                    <div className="mt-6 px-2">
                        <div className="flex items-center gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                            <Volume2 size={18} className="text-gray-400" />
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume}
                                onChange={handleVolumeChange}
                                className="volume-slider"
                                style={
                                    {
                                        // 將 React 狀態傳遞給 CSS 變數
                                        "--value": volume,
                                        "--fill": varColorPrimary, // primary
                                        "--empty": "rgba(255, 255, 255, 0.1)",
                                    } as React.CSSProperties
                                }
                            />
                            <span className="text-xs font-mono text-gray-400 w-8 text-right">
                                {volume}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
