import React, { useEffect, useMemo, useRef } from "react";
import { LyricData, LyricLine, LyricPhrase } from "../types";
import { timeToSeconds } from "../utils";
import { X, Play, Pause } from "lucide-react";

interface PreviewModalProps {
  lyrics: LyricData;
  currentTime: number;
  onClose: () => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  currentSongTitle?: string;
  currentSongArtist?: string;
}

// 輔助函式：將編輯器的資料結構轉換為播放器計算所需的結構
interface ProcessedLine extends LyricLine {
  startTime: number;
  phraseDelays: number[]; // 秒
  phraseDurations: number[]; // 秒
}

const processLyrics = (lyrics: LyricData): ProcessedLine[] => {
  return lyrics.map((line) => {
    const startTime = timeToSeconds(line.time);
    let currentDelay = 0;
    const phraseDelays: number[] = [];
    const phraseDurations: number[] = [];

    if (line.text) {
      line.text.forEach((phrase) => {
        phraseDelays.push(currentDelay);
        // 假設編輯器中的 duration 是 centiseconds (10ms)，這是一般卡拉OK字幕的標準
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

export const PreviewModal: React.FC<PreviewModalProps> = ({
  lyrics,
  currentTime,
  onClose,
  isPlaying,
  onPlayPause,
  currentSongTitle = "Preview Song",
  currentSongArtist = "Unknown Artist",
}) => {
  const processedLyrics = useMemo(() => processLyrics(lyrics), [lyrics]);
  const containerRef = useRef<HTMLDivElement>(null);

  // 找出當前行
  const currentLineIndex = useMemo(() => {
    // 簡單的倒敘搜尋，與 player.js 邏輯一致
    for (let i = processedLyrics.length - 1; i >= 0; i--) {
      if (currentTime >= processedLyrics[i].startTime - 0.3) {
        return i;
      }
    }
    return -1;
  }, [currentTime, processedLyrics]);

  // 自動滾動
  useEffect(() => {
    if (currentLineIndex !== -1 && containerRef.current) {
      const activeElement = containerRef.current.querySelector(".is-active-line");
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [currentLineIndex]);

  // 移植自 phrasesHandle.js 的樣式生成邏輯
  const getPhraseStyle = (
    line: ProcessedLine,
    phraseIndex: number,
    phrase: LyricPhrase
  ) => {
    const lineTime = line.startTime;
    const delay = line.phraseDelays[phraseIndex];
    const duration = line.phraseDurations[phraseIndex];
    
    // 計算進度
    const rawProgress = (currentTime - lineTime - delay) / duration;

    let phraseProgressValue = 0;
    if (duration > 0) {
      phraseProgressValue = Math.min(1, Math.max(0, rawProgress));
    }

    // 若時間未到
    if (currentTime - lineTime < delay) {
      phraseProgressValue = 0;
    }

    const sinProgress = Math.sin((phraseProgressValue * Math.PI) / 2);
    const a = 0.35 + 0.5 * sinProgress; // Opacity 0.35 -> 0.85

    const transitionWidth = 8;
    const colorStop = phraseProgressValue * 100;
    let transitionStart = Math.max(0, colorStop - transitionWidth);
    let transitionEnd = Math.min(
      100 + transitionWidth,
      colorStop + transitionWidth
    );

    if (phraseProgressValue === 0) {
      transitionStart = 0;
      transitionEnd = 0;
    }

    // 建構 CSS Gradient
    const linearGradient = `linear-gradient(to right,
        rgba(255, 255, 255, ${a}) 0%,
        rgba(255, 255, 255, ${a}) ${transitionStart}%,
        rgba(132, 132, 132, 0.35) ${transitionEnd}%,
        rgba(132, 132, 132, 0.35) 100%
    )`;

    const styles: React.CSSProperties = {
      backgroundImage: linearGradient,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent", // 讓背景 gradient 顯示出來
      display: "inline-block",
      transition: "transform 0.1s linear",
    };

    // Kiai Effect (放大效果)
    if (phrase.kiai) {
      const waveScale = 0.1;
      const waveFrequency = 1;
      const scaleWave = Math.sin(phraseProgressValue * Math.PI * waveFrequency);
      const scaleValue = 1 + waveScale * scaleWave;

      styles.transform = `matrix(${scaleValue}, 0, 0, ${scaleValue}, 0, ${
        -2 * phraseProgressValue
      })`;
      
      // Kiai Glow Effect
      if (phraseProgressValue > 0 && phraseProgressValue < 1) {
         styles.textShadow = "0 0 10px rgba(255, 255, 255, 0.5)";
      }
    } else {
      styles.transform = `matrix(1, 0, 0, 1, 0, ${-2 * phraseProgressValue})`;
    }

    return styles;
  };

  // 判斷 Phrase 是否為 Active (用於額外 class)
  const isPhraseActive = (
    line: ProcessedLine,
    phraseIndex: number
  ) => {
    const start = line.startTime + line.phraseDelays[phraseIndex];
    const end = start + line.phraseDurations[phraseIndex];
    return currentTime > start && currentTime < end;
  };

  return (
    <div className="fixed inset-0 z-100 bg-[#365456] flex flex-col items-center justify-center text-white overflow-hidden font-sans">
      {/* 嵌入樣式 (模擬 style.css) */}
      <style>{`
        .preview-lyric-line {
          margin: 1.5rem 0;
          opacity: 0.6;
          transition: opacity 0.3s, transform 0.3s;
          cursor: pointer;
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

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 p-2 rounded-full z-50 transition-colors"
      >
        <X size={24} />
      </button>

      {/* Main Preview Container */}
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
              className={`preview-lyric-line flex flex-col items-center text-center max-w-4xl px-4 ${isActiveLine ? 'is-active-line' : ''}`}
            >
              {/* Main Text */}
              <div className="text-3xl md:text-4xl leading-relaxed flex flex-wrap justify-center gap-x-1">
                {line.text?.map((phrase, pIndex) => (
                  <span
                    key={pIndex}
                    className="preview-lyric-phrase relative px-0.5"
                    style={isActiveLine ? getPhraseStyle(line, pIndex, phrase) : {}}
                  >
                    {/* Pronunciation (Ruby) */}
                    {phrase.pronounciation ? (
                        <ruby>
                            {phrase.phrase}
                            <rt className="text-sm font-normal text-gray-300 opacity-80 mb-1 block">{phrase.pronounciation}</rt>
                        </ruby>
                    ) : (
                        phrase.phrase
                    )}
                  </span>
                ))}
              </div>

              {/* Translation */}
              {line.translation && isActiveLine && (
                  <div className="mt-4 text-xl text-teal-300 font-medium">
                      {line.translation}
                  </div>
              )}
            </div>
           );
        })}
      </div>

      {/* Bottom Controls Overlay */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#231f1f]/90 px-6 py-4 rounded-xl flex items-center gap-6 shadow-2xl backdrop-blur-sm border border-white/10">
        <div className="flex flex-col">
            <span className="text-white font-bold text-lg">{currentSongTitle}</span>
            <span className="text-gray-400 text-sm">{currentSongArtist}</span>
        </div>

        <div className="h-8 w-px bg-gray-600"></div>

        <button 
            onClick={onPlayPause}
            className="bg-primary text-black rounded-full p-3 hover:bg-teal-300 transition-colors shadow-[0_0_15px_rgba(74,194,215,0.4)]"
        >
            {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" />}
        </button>

        <div className="font-mono text-xl text-primary w-24 text-center">
             {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(2).padStart(5, '0')}
        </div>
      </div>
    </div>
  );
};