import React, { useState } from "react"; 
import { YouTubePlayer, YouTubePlayerHandle } from "./YouTubePlayer";
import { ChevronLeft, ChevronRight } from "lucide-react"; // 建議安裝 lucide-react 圖標庫，或使用自訂 SVG

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
    // 1. 新增收合狀態
    const [isOpen, setIsOpen] = useState(true);

    return (
        /* 2. 外部容器：控制整體寬度與動畫 */
        <div 
            className={`relative h-full transition-all duration-300 ease-in-out border-l border-gray-800 shadow-2xl z-10 bg-black
                ${isOpen ? "w-[400px]" : "w-0"}`} // 這裡的寬度可依需求調整
        >
            {/* 3. 扣環按鈕 (Toggle Button) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute top-1/2 -left-6 transform -translate-y-1/2 bg-gray-800 border border-gray-700 text-white p-1 rounded-l-md hover:bg-primary hover:text-dark transition-colors"
                title={isOpen ? "收合" : "展開"}
            >
                {isOpen ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
            </button>

            {/* 4. 內容遮罩：當 w-0 時隱藏溢出內容，避免文字擠壓 */}
            <div className={`h-full flex flex-col overflow-hidden ${!isOpen && "invisible"}`}>
                <div className="p-4 flex-1 bg-dark text-gray-300 text-sm overflow-y-auto">
                    <div className="flex gap-3">
                        <div className="flex items-center gap-4 bg-panel p-1.5 pl-0 rounded-lg border border-gray-700">
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
                </div>
            </div>
        </div>
    );
};