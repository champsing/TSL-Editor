import React, {
    useRef,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from "react";

// --- YouTube Player Handle Interface ---
export interface YouTubePlayerHandle {
    seekTo: (seconds: number) => void;
    playVideo: () => void;
    pauseVideo: () => void;
}

// --- YouTube Player Props Interface ---
interface YouTubePlayerProps {
    videoId: string;
    onTimeUpdate: (time: number) => void;
    onIsPlayingChange: (isPlaying: boolean) => void;
}

// --- YouTube Player Component ---
export const YouTubePlayer = forwardRef<
    YouTubePlayerHandle,
    YouTubePlayerProps
>(({ videoId, onTimeUpdate, onIsPlayingChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerInstanceRef = useRef<any>(null);
    const intervalRef = useRef<number | null>(null);

    // 暴露方法給父層
    useImperativeHandle(ref, () => ({
        seekTo: (seconds: number) => {
            if (playerInstanceRef.current && playerInstanceRef.current.seekTo) {
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
        }, 80); // 加快更新頻率
    };

    // 初始化 YouTube Player
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

                            onIsPlayingChange(isPlaying);

                            if (isPlaying) {
                                startTimer();
                            } else {
                                clearTimer();
                            }
                        },
                    },
                },
            );
        };
        // @ts-ignore
        if (!window.YT) {
            // 載入 API 腳本
            if (!document.getElementById("yt-api-script")) {
                const tag = document.createElement("script");
                tag.id = "yt-api-script";
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag =
                    document.getElementsByTagName("script")[0];
                firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
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

        // 清理函式
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
});
YouTubePlayer.displayName = "YouTubePlayer";
