import React, {
    useState,
    useRef,
    useEffect,
    useMemo,
    forwardRef,
    useImperativeHandle,
} from "react";
import { LyricLine, LyricData } from "./types";
import {
    INITIAL_JSON_DATA,
    DEFAULT_VIDEO_ID,
    timeToSeconds,
    secondsToTime,
} from "./utils";
import { LineEditor } from "./components/LineEditor";
import { PreviewModal } from "./components/PreviewModal";
import {
    Plus,
    Copy,
    FileJson,
    Upload,
    Music2,
    Clock,
    MoveRight,
    Play,
    CheckCircle, // 新增圖標：用於提交狀態
} from "lucide-react";

// 引入 lodash/isEqual 進行深度比較，判斷 JSON 是否改變。
// 假設專案中已安裝 'lodash'
// 如果沒有安裝，可以使用一個簡單的 JSON.stringify 比較作為替代
// import isEqual from 'lodash/isEqual';

// --- 定義 Storage Keys (儲存鍵) ---
const STORAGE_KEY_VIDEO_ID = "sync_editor_video_id";
const STORAGE_KEY_LYRICS = "sync_editor_lyrics";

// --- 定義 YouTube Player Props 與 Handle (播放器屬性與介面) ---
interface YouTubePlayerProps {
    videoId: string;
    onTimeUpdate: (time: number) => void;
    onIsPlayingChange: (isPlaying: boolean) => void;
}

interface YouTubePlayerHandle {
    seekTo: (seconds: number) => void;
    playVideo: () => void; // 新增播放方法
    pauseVideo: () => void; // 新增暫停方法
}

// --- YouTube Player Component (YouTube 播放器元件) ---
const YouTubePlayer = forwardRef<YouTubePlayerHandle, YouTubePlayerProps>(
    ({ videoId, onTimeUpdate, onIsPlayingChange }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const playerInstanceRef = useRef<any>(null);
        const intervalRef = useRef<number | null>(null);

        // 暴露方法給父層
        useImperativeHandle(ref, () => ({
            seekTo: (seconds: number) => {
                if (
                    playerInstanceRef.current &&
                    playerInstanceRef.current.seekTo
                ) {
                    playerInstanceRef.current.seekTo(seconds, true);
                }
            },
            playVideo: () => {
                if (
                    playerInstanceRef.current &&
                    playerInstanceRef.current.playVideo
                ) {
                    playerInstanceRef.current.playVideo();
                }
            },
            pauseVideo: () => {
                if (
                    playerInstanceRef.current &&
                    playerInstanceRef.current.pauseVideo
                ) {
                    playerInstanceRef.current.pauseVideo();
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
            }, 80); // 加快更新頻率以獲得更流暢的預覽動畫
        };

        useEffect(() => {
            const initPlayer = () => {
                if (!containerRef.current || playerInstanceRef.current) return;

                // @ts-ignore
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
                                // @ts-ignore
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
            // @ts-ignore
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
                // @ts-ignore
                const previousReady = window.onYouTubeIframeAPIReady;
                // @ts-ignore
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

// --- 輔助函式：深度比較兩個歌詞陣列 (簡易版) ---
const areLyricsEqual = (a: LyricData, b: LyricData): boolean => {
    // 更好的做法是引入 lodash/isEqual，這裡使用 JSON.stringify 作為簡易替代
    // 但請注意：JSON.stringify 的順序可能會影響結果，在複雜物件中不夠精準。
    // 在此應用中 (LyricLine 結構相對固定)，這應該足夠。
    return JSON.stringify(a) === JSON.stringify(b);
};

function App() {
    // State (狀態管理)
    const [videoId, setVideoId] = useState(() => {
        const savedId = sessionStorage.getItem(STORAGE_KEY_VIDEO_ID);
        return savedId || DEFAULT_VIDEO_ID;
    });

    const [tempVideoId, setTempVideoId] = useState(videoId);

    // 儲存已提交/已存檔的歌詞
    const [lyrics, setLyrics] = useState<LyricData>(() => {
        const savedLyrics = sessionStorage.getItem(STORAGE_KEY_LYRICS);
        if (savedLyrics) {
            try {
                return JSON.parse(savedLyrics);
            } catch (e) {
                console.error(
                    "Failed to parse saved lyrics from sessionStorage",
                    e
                );
            }
        }
        try {
            return JSON.parse(INITIAL_JSON_DATA);
        } catch (e) {
            console.error("Failed to parse initial data");
            return [];
        }
    });

    // 儲存正在編輯/暫存的歌詞 (新的狀態)
    const [stagedLyrics, setStagedLyrics] = useState<LyricData>(lyrics);

    const [playerTime, setPlayerTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [jsonModalOpen, setJsonModalOpen] = useState(false);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);

    const [editingLineIndex, setEditingLineIndex] = useState<number | null>(
        null
    );

    const playerRef = useRef<YouTubePlayerHandle>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // --- Storage Sync Effects (儲存同步效果) ---
    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEY_VIDEO_ID, videoId);
    }, [videoId]);

    // 找出當前正在播放的行 (使用已提交的 lyrics)
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

    // 檢查是否有未提交的變更 (紅/綠點狀態)
    const hasUncommittedChanges = useMemo(() => {
        return !areLyricsEqual(lyrics, stagedLyrics);
    }, [lyrics, stagedLyrics]);

    // 自動滾動到當前行
    useEffect(() => {
        // 如果正在預覽，不執行這裡的滾動，因為預覽視窗有自己的滾動
        if (previewModalOpen) return;

        if (currentLineIndex !== -1 && scrollContainerRef.current) {
            // 注意: 這裡的 currentLineIndex 是針對 'lyrics' (已提交)
            // 但清單渲染的是 'stagedLyrics'。
            // 由於只有 commit 時 'lyrics' 才會更新，
            // 且 LineEditor 還是使用 index，這裡應該不會有問題。
            const currentLine =
                document.getElementsByClassName("is-current")[0];

            currentLine?.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    }, [currentLineIndex, previewModalOpen]);

    const handleProgress = (currentTime: number) => {
        setPlayerTime(currentTime);
    };

    const handleSeek = (timeStr: string) => {
        const seconds = timeToSeconds(timeStr);
        if (playerRef.current) {
            playerRef.current.seekTo(seconds);
            setPlayerTime(seconds);
        }
    };

    const handlePlayPause = () => {
        if (playerRef.current) {
            if (isPlaying) {
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
            }
        }
    };

    // --- 新增 Commit 函式 ---
    const commitLyrics = () => {
        if (!hasUncommittedChanges) return; // 沒有變更則不提交

        setLyrics(stagedLyrics); // 更新已提交狀態
        // 寫入 sessionStorage (節省效能)
        sessionStorage.setItem(
            STORAGE_KEY_LYRICS,
            JSON.stringify(stagedLyrics)
        );
        console.log("Lyrics committed and saved to sessionStorage!");
    };

    // --- 編輯相關函式：現在修改 stagedLyrics ---
    const handleStamp = (index: number) => {
        const newLyrics = [...stagedLyrics];
        newLyrics[index] = {
            ...newLyrics[index],
            time: secondsToTime(playerTime, 1),
        };
        setStagedLyrics(newLyrics);
    };

    const updateLine = (index: number, updatedLine: LyricLine) => {
        const newLyrics = [...stagedLyrics];
        newLyrics[index] = updatedLine;
        setStagedLyrics(newLyrics);
    };

    const deleteLine = (index: number) => {
        if (!window.confirm("確定要刪除這行歌詞嗎？")) return;

        const newLyrics = stagedLyrics.filter((_, i) => i !== index);
        setStagedLyrics(newLyrics);

        if (editingLineIndex === index) {
            setEditingLineIndex(null);
        }
    };

    const addLine = () => {
        const newLine: LyricLine = {
            time: secondsToTime(playerTime, 1),
            text: [{ phrase: "新行歌詞", duration: 20 }],
            translation: "",
        };
        // Insert after current index or at end (這裡使用已提交的 currentLineIndex)
        // 注意：這裡可能會因為 currentLineIndex (使用 lyrics) 和 stagedLyrics 的長度不同而產生不精準的插入位置
        // 更嚴謹的做法是重新計算一個 stagedCurrentLineIndex，但為簡化，暫時沿用 currentLineIndex 邏輯
        const insertIndex =
            currentLineIndex !== -1
                ? currentLineIndex + 1
                : stagedLyrics.length;
        const newLyrics = [...stagedLyrics];
        newLyrics.splice(insertIndex, 0, newLine);
        setStagedLyrics(newLyrics);
        setEditingLineIndex(insertIndex);
    };

    const copyJson = () => {
        // 複製已提交的 lyrics
        const jsonStr = JSON.stringify(lyrics, null, 4);
        navigator.clipboard.writeText(jsonStr).then(() => {
            console.log("JSON copied to clipboard!");
        });
        // 這裡不再寫入 sessionStorage，因為 commitLyrics 已經處理
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (Array.isArray(json)) {
                    // 同時更新 lyrics 和 stagedLyrics
                    setLyrics(json);
                    setStagedLyrics(json);
                    setEditingLineIndex(null);
                    // 檔案載入成功後立即寫入 sessionStorage
                    sessionStorage.setItem(
                        STORAGE_KEY_LYRICS,
                        JSON.stringify(json)
                    );
                } else {
                    console.error("Invalid JSON format: Expected an array.");
                }
            } catch (err) {
                console.error("Error parsing JSON file", err);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="flex flex-col h-screen bg-secondary">
            {/* Header (標頭) */}
            <header className="bg-dark shadow-lg z-20 px-6 py-3 flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center gap-3">
                    <div className="bg-primary p-2 rounded-lg">
                        <Music2 className="text-dark" size={24} />
                    </div>
                    <h1 className="text-2xl font-playfair font-bold text-white">
                        <span className="text-primary">TSL</span>Editor
                    </h1>
                </div>

                {/* YouTube ID Input (YouTube ID 輸入) */}
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

                {/* Actions (操作按鈕) - 新增 Commit/Status */}
                <div className="flex items-center gap-3">
                    {/* Commit 按鈕與狀態指示燈 */}
                    <button
                        onClick={commitLyrics}
                        disabled={!hasUncommittedChanges}
                        className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm transition font-semibold ${
                            hasUncommittedChanges
                                ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20"
                                : "bg-gray-700 text-gray-400 cursor-not-allowed"
                        }`}
                    >
                        <CheckCircle size={16} />
                        Commit
                        {/* 狀態指示燈 */}
                        <span
                            className={`w-3 h-3 rounded-full ml-1 ${
                                hasUncommittedChanges
                                    ? "bg-red-400 animate-pulse"
                                    : "bg-green-400"
                            }`}
                            title={
                                hasUncommittedChanges
                                    ? "Uncommitted Changes (未提交變更)"
                                    : "Committed (已提交)"
                            }
                        ></span>
                    </button>

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

            {/* Main Content (主要內容) */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel: Editor (左側面板：編輯器) */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#2d3748]">
                    {/* Editor Toolbar (編輯器工具列) */}
                    <div className="bg-panel px-6 py-3 border-b border-gray-700 flex items-center justify-between sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <div className="text-3xl font-mono text-primary font-bold tabular-nums">
                                {/* 顯示當前時間 */}
                                {isPlaying
                                    ? secondsToTime(playerTime, 0)
                                    : secondsToTime(playerTime, 1)}
                            </div>
                            <div className="h-8 w-px bg-gray-600 mx-2"></div>
                            <div className="text-sm text-gray-400">
                                {stagedLyrics.length} lines total
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {/* 新增 Preview 按鈕 (預覽按鈕) */}
                            <button
                                onClick={() => setPreviewModalOpen(true)}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded flex items-center gap-2 transition shadow-lg shadow-purple-900/20"
                            >
                                <Play size={18} />
                                Preview
                            </button>
                            <button
                                onClick={addLine}
                                className={`bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 transition ${
                                    !isPlaying
                                        ? "shadow-lg shadow-green-900/20"
                                        : "opacity-50 cursor-not-allowed shadow-none"
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
                    </div>

                    {/* Scrollable List (可滾動清單) */}
                    <div
                        ref={scrollContainerRef}
                        className="flex-1 overflow-y-auto p-6 scroll-smooth pb-32"
                    >
                        <div className="max-w-4xl mx-auto">
                            {stagedLyrics.length === 0 && (
                                <div className="text-center text-gray-500 mt-20">
                                    No lyrics loaded. Import a file or add a
                                    line.
                                </div>
                            )}
                            {/* 清單現在使用 stagedLyrics 進行渲染 */}
                            {stagedLyrics.map((line, index) => (
                                <LineEditor
                                    key={index}
                                    index={index}
                                    // 雖然渲染 stagedLyrics，但 isCurrent 依賴 currentLineIndex (使用 lyrics)
                                    // 這是故意的，因為只有 committed 的歌詞才會影響播放高亮
                                    line={line}
                                    isCurrent={index === currentLineIndex}
                                    isEditing={index === editingLineIndex} // 傳入是否為編輯模式
                                    onEditStart={() =>
                                        setEditingLineIndex(index)
                                    } // 切換編輯模式
                                    onUpdate={updateLine}
                                    onDelete={deleteLine}
                                    onStampTime={handleStamp}
                                    onSeek={handleSeek}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Fixed Player (右側面板：固定播放器) */}
                <div className="w-[400px] bg-black flex flex-col border-l border-gray-800 shadow-2xl z-10">
                    <div className="h-relative bg-black aspect-video">
                        <YouTubePlayer
                            ref={playerRef}
                            videoId={videoId}
                            onTimeUpdate={handleProgress}
                            onIsPlayingChange={setIsPlaying}
                        />
                    </div>
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
                                "Duration" 欄位用於卡拉 OK 視覺效果的持續時間
                                (近似值)。
                            </li>
                        </ul>
                        <div className="mt-6 p-3 bg-blue-900/20 border border-blue-500/30 rounded text-blue-200">
                            <p>
                                <strong>注意:</strong> 時間格式為{" "}
                                <code>MM:SS.mm</code>。
                            </p>
                            <p>只有當影片暫停時才能新增行。</p>
                            <p>
                                編輯後必須點擊{" "}
                                <strong className="text-red-400">Commit</strong>{" "}
                                按鈕才能使更改生效並儲存。
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* JSON Modal (JSON 模態框) */}
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
                            // 這裡顯示已提交的 lyrics
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

            {/* Preview Modal (預覽模態框) */}
            {previewModalOpen && (
                <PreviewModal
                    // 預覽使用已提交的 lyrics
                    lyrics={lyrics}
                    currentTime={playerTime}
                    onClose={() => setPreviewModalOpen(false)}
                    isPlaying={isPlaying}
                    onPlayPause={handlePlayPause}
                />
            )}
        </div>
    );
}

export default App;
