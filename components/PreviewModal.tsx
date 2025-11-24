import React, { useEffect, useMemo, useRef } from "react";
import { LyricData, LyricLine, LyricPhrase } from "../types";
import { timeToSeconds } from "../utils";
import { X, Play, Pause } from "lucide-react";

// --- Interfaces ---
interface PreviewModalProps {
    lyrics: LyricData;
    currentTime: number;
    onClose: () => void;
    isPlaying: boolean;
    onPlayPause: () => void;
    currentSongTitle?: string;
    currentSongArtist?: string;
}

interface ProcessedLine extends LyricLine {
    startTime: number;
    phraseDelays: number[]; // 秒
    phraseDurations: number[]; // 秒
}

// --- Helper: Data Processing ---
const processLyrics = (lyrics: LyricData): ProcessedLine[] => {
    return lyrics.map((line) => {
        const startTime = timeToSeconds(line.time);
        let currentDelay = 0;
        const phraseDelays: number[] = [];
        const phraseDurations: number[] = [];

        if (line.text) {
            line.text.forEach((phrase) => {
                phraseDelays.push(currentDelay);
                // 假設編輯器中的 duration 是 centiseconds (10ms)
                const durSec = (phrase.duration || 0) / 100;
                phraseDurations.push(durSec);
                currentDelay += durSec;
            });
        }

        return {
            ...line,
            startTime,
            phraseDelays,
            phraseDurations,
        };
    });
};

// --- Helper: Karaoke Style Generator ---
const getPhraseStyle = (
    currentTime: number,
    line: ProcessedLine,
    phraseIndex: number,
    phrase: LyricPhrase,
): React.CSSProperties => {
    const lineTime = line.startTime;
    const delay = line.phraseDelays[phraseIndex];
    const duration = line.phraseDurations[phraseIndex];

    // 計算進度: 0.0 -> 1.0
    const rawProgress = (currentTime - lineTime - delay) / duration;

    let phraseProgressValue = 0;
    if (duration > 0) {
        phraseProgressValue = Math.min(1, Math.max(0, rawProgress));
    }

    // 若時間未到，進度為 0
    if (currentTime - lineTime < delay) {
        phraseProgressValue = 0;
    }

    // --- 1. Gradient Effect (Fill) ---
    const sinProgress = Math.sin((phraseProgressValue * Math.PI) / 2);
    const a = 0.35 + 0.5 * sinProgress; // Opacity 0.35 -> 0.85
    const transitionWidth = 8; // 過渡寬度百分比
    const colorStop = phraseProgressValue * 100;
    const transitionStart = Math.max(0, colorStop - transitionWidth);
    const transitionEnd = Math.min(
        100 + transitionWidth,
        colorStop + transitionWidth,
    );

    // 處理靜止時的狀態
    const baseColor = "rgba(132, 132, 132, 0.35)";
    let linearGradient: string;

    if (phraseProgressValue <= 0) {
        // 未開始，使用背景色
        linearGradient = `linear-gradient(to right, ${baseColor} 0%, ${baseColor} 100%)`;
    } else if (phraseProgressValue >= 1) {
        // 已完成，使用亮色
        linearGradient = `linear-gradient(to right, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.85) 100%)`;
    } else {
        // 進行中，使用漸變
        linearGradient = `linear-gradient(to right,
            rgba(255, 255, 255, ${a}) 0%,
            rgba(255, 255, 255, ${a}) ${transitionStart}%,
            ${baseColor} ${transitionEnd}%,
            ${baseColor} 100%
        )`;
    }

    const styles: React.CSSProperties = {
        backgroundImage: linearGradient,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        display: "inline-block",
        transition: "transform 0.1s linear",
    };

    // --- 2. Kiai & Translation Effect (Scale/Glow) ---
    if (phrase.kiai) {
        const waveScale = 0.1;
        const waveFrequency = 1;
        const scaleWave = Math.sin(
            phraseProgressValue * Math.PI * waveFrequency,
        );
        const scaleValue = 1 + waveScale * scaleWave;

        // Scale & Vertical Translation
        styles.transform = `matrix(${scaleValue}, 0, 0, ${scaleValue}, 0, ${
            -2 * phraseProgressValue
        })`;

        // Kiai Glow Effect (僅在進行中)
        if (phraseProgressValue > 0 && phraseProgressValue < 1) {
            styles.textShadow = "0 0 10px rgba(255, 255, 255, 0.5)";
        }
    } else {
        // Normal Vertical Translation
        styles.transform = `matrix(1, 0, 0, 1, 0, ${-2 * phraseProgressValue})`;
    }

    return styles;
};

// --- Component: PreviewModal ---
export const PreviewModal: React.FC<PreviewModalProps> = ({
    lyrics,
    currentTime,
    onClose,
    isPlaying,
    onPlayPause,
    currentSongTitle = "Preview Song",
}) => {
    const processedLyrics = useMemo(() => processLyrics(lyrics), [lyrics]);
    const containerRef = useRef<HTMLDivElement>(null);

    // 找出當前行 (Active Line)
    const currentLineIndex = useMemo(() => {
        // 簡單的倒敘搜尋，與播放器邏輯保持一致 (提早 0.3 秒開始高亮)
        for (let i = processedLyrics.length - 1; i >= 0; i--) {
            if (currentTime >= processedLyrics[i].startTime - 0.3) {
                return i;
            }
        }
        return -1;
    }, [currentTime, processedLyrics]);

    // 自動滾動效果
    useEffect(() => {
        if (currentLineIndex !== -1 && containerRef.current) {
            const activeElement =
                containerRef.current.querySelector(".is-active-line");
            if (activeElement) {
                activeElement.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }
    }, [currentLineIndex]);

    return (
        <div className="fixed inset-0 z-100 bg-[#102f2c] flex flex-col items-center justify-center text-white overflow-hidden font-sans">
            {/* 樣式模擬 (模擬 style.css) */}
            <style>{`
                .preview-lyric-line {
                  margin: 1.5rem 0;
                  opacity: 0.6;
                  transition: opacity 0.3s, transform 0.3s;
                  cursor: default;
                }
                .preview-lyric-line.is-active-line {
                  opacity: 1;
                  transform: scale(1.05);
                }
                .preview-lyric-phrase {
                   /* Fallback color */
                   color: rgba(132, 132, 132, 0.35);
                   font-weight: 700;
                   font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                }
            `}</style>

            {/* --- 1. Close Button --- */}
            <button
                onClick={onClose}
                className="cursor-pointer absolute top-4 right-4 bg-black/40 hover:bg-black/60 p-2 rounded-full z-50 transition-colors"
            >
                <X size={24} />
            </button>

            {/* --- 2. Main Preview Container (Scrollable) --- */}
            <div
                ref={containerRef}
                className="w-full h-full overflow-y-auto flex flex-col items-center py-[40vh] scroll-smooth"
                style={{ scrollbarWidth: "none" }}
            >
                {processedLyrics.map((line, lIndex) => {
                    const isActiveLine = lIndex === currentLineIndex;

                    return (
                        <div
                            key={lIndex}
                            className={`preview-lyric-line flex flex-col items-center text-center max-w-4xl px-4 ${isActiveLine ? "is-active-line" : ""}`}
                        >
                            {/* Main Text & Karaoke Effect */}
                            <div className="text-3xl md:text-4xl leading-relaxed flex flex-wrap justify-center gap-x-1">
                                {line.text?.map((phrase, pIndex) => (
                                    <span
                                        key={pIndex}
                                        className="preview-lyric-phrase relative px-0.5"
                                        style={
                                            isActiveLine
                                                ? getPhraseStyle(
                                                      currentTime,
                                                      line,
                                                      pIndex,
                                                      phrase,
                                                  )
                                                : {}
                                        }
                                    >
                                        {/* Pronunciation (Ruby) */}
                                        {phrase.pronounciation ? (
                                            <ruby>
                                                {phrase.phrase}
                                                <rt className="text-sm font-normal text-gray-300 opacity-80 mb-1 block">
                                                    {phrase.pronounciation}
                                                </rt>
                                            </ruby>
                                        ) : (
                                            phrase.phrase
                                        )}
                                    </span>
                                ))}
                            </div>

                            {/* Translation (Only shown for active line) */}
                            {line.translation && isActiveLine && (
                                <div className="mt-4 text-xl text-teal-300 font-medium">
                                    {line.translation}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* --- 3. Bottom Controls Overlay --- */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#231f1f]/90 px-6 py-4 rounded-xl flex items-center gap-6 shadow-2xl backdrop-blur-sm border border-white/10">
                <div className="flex flex-col">
                    <span className="text-white font-bold text-lg">
                        {currentSongTitle}
                    </span>
                </div>

                <div className="h-8 w-px bg-gray-600"></div>

                <button
                    onClick={onPlayPause}
                    className="cursor-pointer bg-primary text-black rounded-full p-3 hover:bg-teal-300 transition-colors shadow-[0_0_15px_rgba(74,194,215,0.4)]"
                >
                    {isPlaying ? (
                        <Pause size={24} fill="black" />
                    ) : (
                        <Play size={24} fill="black" />
                    )}
                </button>

                <div className="font-mono text-xl text-primary w-24 text-center">
                    {/* Format: MM:SS.mm */}
                    {Math.floor(currentTime / 60)}:
                    {(currentTime % 60).toFixed(2).padStart(5, "0")}
                </div>
            </div>
        </div>
    );
};
