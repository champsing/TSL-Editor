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
    onSeek: (seconds: number) => void;
}

interface ProcessedLine extends LyricLine {
    startTime: number;
    phraseDelays: number[]; // 秒
    phraseDurations: number[]; // 秒
    bgStartTime?: number;
    bgPhraseDelays?: number[];
    bgPhraseDurations?: number[];
}

const processLyrics = (lyrics: LyricData): ProcessedLine[] => {
    return lyrics.map((line, index) => {
        const startTime = timeToSeconds(line.time); // 主歌詞相關變數
        let currentDelay = 0;
        const phraseDelays: number[] = [];
        const phraseDurations: number[] = []; // 背景歌詞相關變數（如果有）

        let bgStartTime: number | undefined = undefined; // 初始化為 undefined
        let bgCurrentDelay = 0;
        let bgPhraseDelays: number[] = [];
        let bgPhraseDurations: number[] = [];

        // 🚨 1. 處理主歌詞 (Main Text) 的修改邏輯 🚨
        let processedLineText: LyricPhrase[] | undefined = line.text;

        // 如果是 prelude 或 interlude
        if (line.type === "prelude" || line.type === "interlude") {
            let totalLineDurationSec: number;
            const nextLine = lyrics[index + 1];

            // 1.1. 計算總時長 (Total Duration)
            if (nextLine) {
                const nextStartTime = timeToSeconds(nextLine.time);
                // 總時長 = 下一行開始時間 - 當前行開始時間
                totalLineDurationSec = nextStartTime - startTime;
            } else {
                // 如果是最後一行，給予一個合理的預設值，例如 3 秒
                totalLineDurationSec = 3.0;
            }

            // 確保時長是正數，且至少有 0.1 秒
            if (totalLineDurationSec <= 0) {
                totalLineDurationSec = 0.1;
            }

            // 1.2. 計算每個短語的時長 (Duration Per Phrase)
            // 將秒數轉換為 centiseconds (10ms)
            const totalLineDurationMs = totalLineDurationSec * 100;
            const durationPerPhraseMs = Math.round(totalLineDurationMs / 3);

            // 1.3. 建立三個 ● 短語
            processedLineText = [
                {
                    phrase: "●",
                    duration: durationPerPhraseMs,
                    pronounciation: "",
                },
                {
                    phrase: " ● ",
                    duration: durationPerPhraseMs,
                    pronounciation: "",
                },
                {
                    phrase: "●",
                    duration: durationPerPhraseMs,
                    pronounciation: "",
                },
            ];
        }

        if (processedLineText) {
            // 使用 processedLineText 來計算延遲和時長
            processedLineText.forEach((phrase) => {
                phraseDelays.push(currentDelay);
                // 假設編輯器中的 duration 是 centiseconds (10ms)，轉換為秒
                const durSec = (phrase.duration || 0) / 100;
                phraseDurations.push(durSec);
                currentDelay += durSec;
            });
        }

        // 2. 處理背景歌詞 (Background Voice)

        if (line.background_voice) {
            bgStartTime = timeToSeconds(line.background_voice.time);
            line.background_voice.text.forEach((phrase) => {
                bgPhraseDelays.push(bgCurrentDelay);
                const durSec = (phrase.duration || 0) / 100;
                bgPhraseDurations.push(durSec);
                bgCurrentDelay += durSec;
            });
        } // 3. 統一返回結果
        // 這裡使用一個單一的 return 語句來處理兩種情況
        // 並且只在有背景歌詞時才包含 bgStartTime/bgPhraseDelays/bgPhraseDurations

        const baseResult: ProcessedLine = {
            ...line,
            text: processedLineText,
            startTime,
            phraseDelays, // 總是包含主歌詞的數據
            phraseDurations, // 總是包含主歌詞的數據
        };
        if (line.background_voice) {
            return {
                ...baseResult,
                bgStartTime, // 這裡 bgStartTime 會有值 (非 undefined)
                bgPhraseDelays,
                bgPhraseDurations,
            };
        }

        return baseResult as ProcessedLine;
    });
};

// --- Helper: Karaoke Style Generator ---
const getPhraseStyle = (
    currentTime: number,
    lineTime: number,
    delay: number,
    duration: number,
    phrase: LyricPhrase,
): React.CSSProperties => {
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
    onSeek, // 👈 從 props 接收 onSeek
}) => {
    const processedLyrics = useMemo(() => processLyrics(lyrics), [lyrics]);
    const containerRef = useRef<HTMLDivElement>(null);

    // 1. 預處理：算出每行的結束時間 (基於 processedLyrics)
    const linesWithEndTime = useMemo(() => {
        return processedLyrics.map((line) => {
            // 計算主歌詞的總時長
            const mainTotalDuration = line.phraseDurations.reduce(
                (a, b) => a + b,
                0,
            );

            // 主歌詞的結束時間 (預設使用主歌詞的 startTime + mainTotalDuration)
            let maxEndTime = line.startTime + mainTotalDuration;

            // 處理 duration 防呆 (如果是 0，給個預設值，例如 3秒)
            const validDuration =
                mainTotalDuration > 0 ? mainTotalDuration : 3.0;

            // 🚨 新增邏輯：檢查背景和聲的結束時間 🚨
            if (line.bgStartTime !== undefined && line.bgPhraseDurations) {
                // 計算背景和聲的總時長
                const bgTotalDuration = line.bgPhraseDurations.reduce(
                    (a, b) => a + b,
                    0,
                );

                // 背景和聲的實際結束時間
                const bgEndTime = line.bgStartTime + bgTotalDuration;

                // 取主歌詞結束時間 和 背景和聲結束時間 兩者的最大值
                maxEndTime = Math.max(maxEndTime, bgEndTime);
            }

            // 如果 maxEndTime <= line.startTime (例如主歌詞 totalDuration 也是 0 的情況)
            // 則使用 validDuration 作為安全預設值
            const finalEndTime =
                maxEndTime > line.startTime
                    ? maxEndTime
                    : line.startTime + validDuration;

            return {
                ...line,
                computedEndTime: finalEndTime,
            };
        });
    }, [processedLyrics]);

    // 2. 核心邏輯：找出所有活躍行
    const activeLineIndices = useMemo(() => {
        const activeIndices: number[] = [];
        const startOffset = 0.3;
        const endBuffer = 0.2;

        linesWithEndTime.forEach((line, index) => {
            const start = line.startTime - startOffset;
            const end = line.computedEndTime + endBuffer;

            if (currentTime >= start && currentTime < end) {
                activeIndices.push(index);
            }
        });
        return activeIndices;
    }, [currentTime, linesWithEndTime]);

    // 3. 定義 currentLineIndex (用於滾動定位，取最後一個活躍行)
    const currentLineIndex = useMemo(() => {
        if (activeLineIndices.length === 0) return -1;
        return activeLineIndices[activeLineIndices.length - 1];
    }, [activeLineIndices]);

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
        <div className="fixed inset-0 z-100 bg-[#102f2c] text-white overflow-hidden font-sans">
            {/* 樣式模擬 (模擬 style.css) */}
            <style>{`
                .preview-lyric-line {
                  margin: 1.5rem 0;
                  opacity: 0.6;
                  transition: opacity 0.3s, transform 0.3s;
                  cursor: pointer; /* 👈 新增點擊游標 */
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

                /* 調整 secondary vocalist 行的 phrase 容器對齊 */
                .is-secondary-vocalist .flex-wrap {
                    justify-content: flex-end;
                }
            `}</style>

            {/* --- 2. Main Preview Container (Scrollable) --- */}
            <div
                ref={containerRef}
                className="w-full h-full overflow-y-auto flex flex-col items-center py-[40vh] scroll-smooth"
                style={{ scrollbarWidth: "none" }}
            >
                {processedLyrics.map((line, lIndex) => {
                    // 👇 修改這裡：檢查 index 是否在活躍陣列中
                    const isActiveLine = activeLineIndices.includes(lIndex);

                    return (
                        <button
                            onClick={() => {
                                onSeek(line.startTime);
                            }}
                            key={lIndex}
                            // 這裡 isActiveLine 會決定是否加上 .is-active-line
                            className={`preview-lyric-line max-w-4xl px-4 ${isActiveLine ? "is-active-line" : ""}`}
                        >
                            {/* Vocalist Marker */}
                            <div
                                className={`w-full flex mb-2 ${line.is_together ? "is-together justify-center" : line.is_secondary ? "is-secondary-vocalist justify-end" : "is-primary-vocalist justify-start"}`}
                            >
                                {line.is_together ? (
                                    <span
                                        className="text-xs font-black italic text-blue-400 bg-blue-900/80 px-2 rounded-xl leading-none"
                                        title="Together Vocalist Line"
                                    >
                                        T
                                    </span>
                                ) : line.is_secondary ? (
                                    <span
                                        className="text-xs font-black italic text-orange-400 bg-orange-900/80 px-2 rounded-xl leading-none"
                                        title="Secondary Vocalist Line"
                                    >
                                        2
                                    </span>
                                ) : (
                                    <span
                                        className="text-xs font-black italic text-neutral-400 bg-neutral-900/80 px-2 rounded-xl leading-none"
                                        title="Primary Vocalist Line"
                                    >
                                        1
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col">
                                {/* Main Text & Karaoke Effect */}
                                <div className="text-3xl md:text-4xl leading-relaxed flex flex-wrap align-bottom gap-x-1">
                                    {line.text?.map((phrase, pIndex) => (
                                        <span
                                            key={pIndex + "-main"}
                                            className="preview-lyric-phrase relative px-0.5"
                                            style={
                                                isActiveLine
                                                    ? getPhraseStyle(
                                                          currentTime,
                                                          line.startTime,
                                                          line.phraseDelays[
                                                              pIndex
                                                          ],
                                                          line.phraseDurations[
                                                              pIndex
                                                          ],
                                                          phrase,
                                                      )
                                                    : {}
                                            }
                                        >
                                            {/* Pronunciation */}
                                            {phrase.pronounciation ? (
                                                <div className="flex flex-col gap-0">
                                                    <span className="text-sm font-normal text-gray-300 opacity-80 -mb-1 block">
                                                        {phrase.pronounciation}
                                                    </span>
                                                    <span>{phrase.phrase}</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-0">
                                                    <span>{phrase.phrase}</span>
                                                </div>
                                            )}
                                        </span>
                                    ))}
                                </div>

                                {/* BG Text & Karaoke Effect */}
                                <div className="text-bg md:text-xl leading-relaxed flex flex-wrap justify-center gap-x-1">
                                    {line.background_voice?.text.map(
                                        (phrase, pIndex) => (
                                            <span
                                                key={pIndex + "-bg"}
                                                className="preview-lyric-phrase relative px-0.5"
                                                style={
                                                    isActiveLine
                                                        ? getPhraseStyle(
                                                              currentTime,
                                                              line.bgStartTime,
                                                              line
                                                                  .bgPhraseDelays[
                                                                  pIndex
                                                              ],
                                                              line
                                                                  .bgPhraseDurations[
                                                                  pIndex
                                                              ],
                                                              phrase,
                                                          )
                                                        : {}
                                                }
                                            >
                                                {/* Pronunciation */}
                                                {phrase.pronounciation ? (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-sm font-normal text-gray-300 opacity-80 -mb-1 block">
                                                            {
                                                                phrase.pronounciation
                                                            }
                                                        </span>
                                                        <span>
                                                            {phrase.phrase}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    phrase.phrase
                                                )}
                                            </span>
                                        ),
                                    )}
                                </div>

                                {/* Translation (Only shown for active line) */}
                                {line.translation && isActiveLine && (
                                    <div className="mt-2 text-xl text-teal-300 font-medium">
                                        {line.translation}
                                    </div>
                                )}
                                {line.background_voice?.translation &&
                                    isActiveLine && (
                                        <div className="mt-2 text-xl text-teal-300 font-medium">
                                            {line.background_voice?.translation}
                                        </div>
                                    )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* --- 3. Bottom Controls Overlay --- */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#231f1f]/90 px-6 py-4 rounded-xl flex items-center gap-6 shadow-2xl backdrop-blur-sm border border-white/10">
                <span className="text-white font-bold text-lg">
                    Preview Song
                </span>

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

                {/* --- Close Button --- */}
                <button
                    onClick={onClose}
                    className="cursor-pointer bg-black/40 hover:bg-black/60 p-2 rounded-full z-50 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>
        </div>
    );
};
