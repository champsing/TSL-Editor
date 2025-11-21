import React, {
    useState,
    useRef,
    useEffect,
    useMemo,
    forwardRef,
    useImperativeHandle,
} from "react";
import { LyricLine, LyricData } from "./types";
import { INITIAL_JSON_DATA, timeToSeconds, secondsToTime } from "./utils";
import { LineEditor } from "./components/LineEditor";
import {
    Plus,
    Copy,
    FileJson,
    Upload,
    Music2,
    Clock,
    MoveRight,
} from "lucide-react";

// --- 定義 YouTube Player Props 與 Handle ---
interface YouTubePlayerProps {
    videoId: string;
    onTimeUpdate: (time: number) => void;
    onIsPlayingChange: (isPlaying: boolean) => void;
}

interface YouTubePlayerHandle {
    seekTo: (seconds: number) => void;
}

// --- YouTube Player Component ---
const YouTubePlayer = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(
    ({ videoId, onTimeUpdate, onIsPlayingChange }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const playerInstanceRef = useRef<any>(null);
        const intervalRef = useRef<number | null>(null);

        // 暴露方法給父層 (讓 App 可以呼叫 seekTo)
        useImperativeHandle(ref, () => ({
            seekTo: (seconds: number) => {
                if (
                    playerInstanceRef.current &&
                    playerInstanceRef.current.seekTo
                ) {
                    playerInstanceRef.current.seekTo(seconds, true);
                }
            },
        }));

        // 清除計時器
        const clearTimer = () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        // 啟動計時器 (Polling 當前時間)
        const startTimer = () => {
            clearTimer();
            intervalRef.current = window.setInterval(() => {
                if (
                    playerInstanceRef.current &&
                    playerInstanceRef.current.getCurrentTime
                ) {
                    const time = playerInstanceRef.current.getCurrentTime();
                    onTimeUpdate(time);
                }
            }, 100); // 每 100ms 更新一次時間
        };

        useEffect(() => {
            const initPlayer = () => {
                if (!containerRef.current || playerInstanceRef.current) return;

                playerInstanceRef.current = new window.YT.Player(
                    containerRef.current,
                    {
                        height: "100%",
                        width: "100%",
                        videoId: videoId,
                        playerVars: {
                            playsinline: 1,
                            rel: 0,
                        },
                        events: {
                            onReady: () => {
                                // Player ready
                            },
                            onStateChange: (event: any) => {
                                const PlayerState = window.YT.PlayerState;
                                const isPlaying =
                                    event.data === PlayerState.PLAYING;

                                // 更新播放狀態
                                onIsPlayingChange(isPlaying);

                                // 如果正在播放，開始追蹤時間；否則停止
                                if (isPlaying) {
                                    startTimer();
                                } else {
                                    clearTimer();
                                }
                            },
                        },
                    }
                );
            };

            if (!window.YT) {
                // 載入 API
                if (!document.getElementById("yt-api-script")) {
                    const tag = document.createElement("script");
                    tag.id = "yt-api-script";
                    tag.src = "https://www.youtube.com/iframe_api";
                    const firstScriptTag =
                        document.getElementsByTagName("script")[0];
                    firstScriptTag.parentNode?.insertBefore(
                        tag,
                        firstScriptTag
                    );
                }
                const previousReady = window.onYouTubeIframeAPIReady;
                window.onYouTubeIframeAPIReady = () => {
                    if (previousReady) previousReady();
                    initPlayer();
                };
            } else {
                initPlayer();
            }

            return () => {
                clearTimer();
                if (playerInstanceRef.current) {
                    try {
                        playerInstanceRef.current.destroy();
                    } catch (e) {
                        console.error(e);
                    }
                    playerInstanceRef.current = null;
                }
            };
        }, []);

        // 當 videoId 改變時載入新影片
        useEffect(() => {
            if (
                playerInstanceRef.current &&
                playerInstanceRef.current.loadVideoById
            ) {
                playerInstanceRef.current.loadVideoById(videoId);
            }
        }, [videoId]);

        return <div ref={containerRef} className="w-full h-full" />;
    }
);
YouTubePlayer.displayName = "YouTubePlayer";

const DEFAULT_VIDEO_ID = "p-O_X77C4l8"; // Bocchi the Rock - Guitar, Loneliness and Blue Planet

function App() {
    // State
    const [videoId, setVideoId] = useState(DEFAULT_VIDEO_ID);
    const [tempVideoId, setTempVideoId] = useState(DEFAULT_VIDEO_ID);
    const [lyrics, setLyrics] = useState<LyricData>([]);
    const [playerTime, setPlayerTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [jsonModalOpen, setJsonModalOpen] = useState(false);

    // Refs
    // 注意：這裡的 Ref 類型改為指向我們自定義的 YouTubePlayerHandle
    const playerRef = useRef<YouTubePlayerHandle>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Initialize Data
    useEffect(() => {
        try {
            const parsed = JSON.parse(INITIAL_JSON_DATA);
            setLyrics(parsed);
        } catch (e) {
            console.error("Failed to parse initial data");
        }
    }, []);

    // Find current line based on time
    const currentLineIndex = useMemo(() => {
        let index = -1;
        for (let i = 0; i < lyrics.length; i++) {
            const lineTime = timeToSeconds(lyrics[i].time);
            if (playerTime >= lineTime) {
                index = i;
            } else {
                break;
            }
        }
        return index;
    }, [playerTime, lyrics]);

    // Auto-scroll to current line
    useEffect(() => {
        if (currentLineIndex !== -1 && scrollContainerRef.current) {
            const currentLine = document.getElementsByClassName(
                "is-current"
            )[0];
            

            currentLine?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [currentLineIndex]);

    // Player Handlers
    // 修改：直接接收秒數 (Native Player 傳上來的)
    const handleProgress = (currentTime: number) => {
        setPlayerTime(currentTime);
    };

    // 修改：使用我們自定義的 seekTo 方法
    const handleSeek = (timeStr: string) => {
        const seconds = timeToSeconds(timeStr);
        if (playerRef.current) {
            playerRef.current.seekTo(seconds);
            setPlayerTime(seconds); // 立即更新 UI 時間，不用等 callback
        }
    };

    const handleStamp = (index: number) => {
        const newLyrics = [...lyrics];
        newLyrics[index] = {
            ...newLyrics[index],
            time: secondsToTime(playerTime),
        };
        setLyrics(newLyrics);
    };

    // Data Handlers
    const updateLine = (index: number, updatedLine: LyricLine) => {
        const newLyrics = [...lyrics];
        newLyrics[index] = updatedLine;
        setLyrics(newLyrics);
    };

    const deleteLine = (index: number) => {
        if (window.confirm("Delete this line?")) {
            const newLyrics = lyrics.filter((_, i) => i !== index);
            setLyrics(newLyrics);
        }
    };

    const addLine = () => {
        const newLine: LyricLine = {
            time: secondsToTime(playerTime),
            text: [{ phrase: "New", duration: 20 }],
            translation: "",
        };
        // Insert after current index or at end
        const insertIndex =
            currentLineIndex !== -1 ? currentLineIndex + 1 : lyrics.length;
        const newLyrics = [...lyrics];
        newLyrics.splice(insertIndex, 0, newLine);
        setLyrics(newLyrics);
    };

    const copyJson = () => {
        const jsonStr = JSON.stringify(lyrics, null, 4);
        navigator.clipboard.writeText(jsonStr).then(() => {
            alert("JSON copied to clipboard!");
        });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (Array.isArray(json)) {
                    setLyrics(json);
                } else {
                    alert("Invalid JSON format: Expected an array.");
                }
            } catch (err) {
                alert("Error parsing JSON file");
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex flex-col h-screen bg-secondary">
            {/* Header */}
            <header className="bg-dark shadow-lg z-20 px-6 py-3 flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-lg">
                        <Music2 className="text-dark" size={24} />
                    </div>
                    <h1 className="text-2xl font-playfair font-bold text-white">
                        <span className="text-primary">Sync</span>Editor
                    </h1>
                </div>

                <div className="flex items-center gap-4 bg-panel p-1.5 rounded-lg border border-gray-700">
                    <span className="pl-2 text-xs text-gray-400 font-bold tracking-wide">
                        YOUTUBE ID
                    </span>
                    <input
                        type="text"
                        value={tempVideoId}
                        onChange={(e) => setTempVideoId(e.target.value)}
                        className="bg-transparent outline-none text-white w-32 text-sm font-mono"
                        placeholder="Video ID"
                    />
                    <button
                        onClick={() => setVideoId(tempVideoId)}
                        className="bg-primary text-dark px-3 py-1 rounded text-xs font-bold hover:bg-teal-300 transition"
                    >
                        LOAD
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm transition">
                        <Upload size={16} />
                        Import
                        <input
                            type="file"
                            className="hidden"
                            accept=".json"
                            onChange={handleFileUpload}
                        />
                    </label>
                    <button
                        onClick={() => setJsonModalOpen(true)}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-md flex items-center gap-2 text-sm transition"
                    >
                        <FileJson size={16} />
                        View JSON
                    </button>
                    <button
                        onClick={copyJson}
                        className="bg-primary hover:bg-teal-300 text-dark font-semibold px-4 py-2 rounded-md flex items-center gap-2 text-sm shadow-[0_0_10px_rgba(74,194,215,0.3)] transition"
                    >
                        <Copy size={16} />
                        Copy JSON
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel: Editor */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#2d3748]">
                    {/* Editor Toolbar */}
                    <div className="bg-panel px-6 py-3 border-b border-gray-700 flex items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <div className="text-3xl font-mono text-primary font-bold tabular-nums">
                                {isPlaying
                                    ? secondsToTime(playerTime, 0)
                                    : secondsToTime(playerTime, 1)}
                            </div>
                            <div className="h-8 w-px bg-gray-600 mx-2"></div>
                            <div className="text-sm text-gray-400">
                                {lyrics.length} lines total
                            </div>
                        </div>
                        <button
                            onClick={addLine}
                            className={`bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 transition ${
                                !isPlaying
                                    ? "shadow-lg shadow-green-900/20" // 當 isPlaying 為 false (暫停中) 時顯示陰影
                                    : "opacity-50 cursor-not-allowed shadow-none" // 當 isPlaying 為 true (播放中) 時移除陰影並變半透明
                            }`}
                            disabled={isPlaying}
                        >
                            <Plus size={18} />
                            Add Line at{" "}
                            {isPlaying
                                ? "--:--.--"
                                : secondsToTime(playerTime, 1)}
                        </button>
                    </div>

                    {/* Scrollable List */}
                    <div
                        ref={scrollContainerRef}
                        className="flex-1 overflow-y-auto p-6 scroll-smooth pb-32"
                    >
                        <div className="max-w-4xl mx-auto">
                            {lyrics.length === 0 && (
                                <div className="text-center text-gray-500 mt-20">
                                    No lyrics loaded. Import a file or add a
                                    line.
                                </div>
                            )}
                            {lyrics.map((line, index) => (
                                <LineEditor
                                    key={index}
                                    index={index}
                                    line={line}
                                    isCurrent={index === currentLineIndex}
                                    onUpdate={updateLine}
                                    onDelete={deleteLine}
                                    onStampTime={handleStamp}
                                    onSeek={handleSeek}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Fixed Player */}
                <div className="w-[400px] bg-black flex flex-col border-l border-gray-800 shadow-2xl z-10">
                    <div className="h-relative bg-black aspect-video">
                        {/* 這裡使用了我們自定義的 YouTubePlayer 
                           並傳入了同步時間與狀態的 callback
                        */}
                        <YouTubePlayer
                            ref={playerRef}
                            videoId={videoId}
                            onTimeUpdate={handleProgress}
                            onIsPlayingChange={setIsPlaying}
                        />
                    </div>
                    <div className="p-4 flex-1 bg-dark text-gray-300 text-sm overflow-y-auto">
                        <h3 className="text-primary font-bold mb-2 text-lg">
                            Shortcuts
                        </h3>
                        <ul className="space-y-2 list-disc pl-4 text-gray-400">
                            <li>
                                Click{" "}
                                <span className="text-white font-bold mx-1">
                                    <Clock size={12} className="inline" />
                                </span>{" "}
                                to sync line to video time.
                            </li>
                            <li>
                                Click{" "}
                                <span className="text-white font-bold mx-1">
                                    <MoveRight size={12} className="inline" />
                                </span>{" "}
                                to jump video to line time.
                            </li>
                            <li>
                                Drag the progress bar in YouTube player to
                                scrub.
                            </li>
                            <li>
                                Use the "Duration" field for karaoke visual
                                length (approximate).
                            </li>
                        </ul>
                        <div className="mt-6 p-3 bg-blue-900/20 border border-blue-500/30 rounded text-blue-200">
                            <p>
                                <strong>Note:</strong> Time format is{" "}
                                <code>MM:SS.mm</code>.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* JSON Modal */}
            {jsonModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-10 backdrop-blur-sm">
                    <div className="bg-panel w-full max-w-3xl h-[80vh] rounded-xl shadow-2xl flex flex-col border border-gray-600">
                        <div className="flex items-center justify-between p-4 border-b border-gray-700">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FileJson className="text-primary" /> Generated
                                JSON
                            </h2>
                            <button
                                onClick={() => setJsonModalOpen(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                Close
                            </button>
                        </div>
                        <textarea
                            className="flex-1 bg-[#1e1e1e] text-green-400 font-mono p-4 text-sm resize-none outline-none"
                            readOnly
                            value={JSON.stringify(lyrics, null, 4)}
                        />
                        <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
                            <button
                                onClick={() => setJsonModalOpen(false)}
                                className="px-4 py-2 text-gray-300 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={copyJson}
                                className="bg-primary hover:bg-teal-300 text-dark font-bold px-6 py-2 rounded shadow"
                            >
                                Copy to Clipboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
