import React from "react"; // <-- 移除 useState 和 useCallback
import { YouTubePlayer, YouTubePlayerHandle } from "./YouTubePlayer";

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
    return (
        <div className=" bg-black flex flex-col border-l border-gray-800 shadow-2xl z-10">
            {/* Sidebar Content (Tips & Actions) */}
            <div className="p-4 flex-1 bg-dark text-gray-300 text-sm overflow-y-auto">
                <div className="flex gap-3">
                    {/* --- 2. YouTube ID Input --- */}
                    <div className="flex items-center gap-4 bg-panel p-1.5 pl-0 rounded-lg border border-gray-700">
                        <span className="pl-2 text-xs text-gray-400 font-bold tracking-wide">
                            YOUTUBE ID
                        </span>
                        <input
                            type="text"
                            value={tempVideoId}
                            onChange={(e) => setTempVideoId(e.target.value)}
                            placeholder="Enter YouTube ID"
                            className="bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary border border-transparent outline-none transition"
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
    );
};
