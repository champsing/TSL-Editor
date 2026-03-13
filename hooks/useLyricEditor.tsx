import React, { useState, useEffect, useMemo, useRef } from "react";
import { LyricData, LyricLine } from "../composables/types";
import { secondsToTime, timeToSeconds } from "../composables/utils";
import { YouTubePlayerHandle } from "../components/YouTubePlayer";

// --- Constants ---
const STORAGE_KEY_VIDEO_ID = "sync_editor_video_id";
const STORAGE_KEY_LYRICS = "sync_editor_lyrics";

// --- Helper: Deep Comparison (Simplified) ---
const areLyricsEqual = (a: LyricData, b: LyricData): boolean => {
    // 更好的做法是引入 lodash/isEqual，這裡使用 JSON.stringify 作為簡易替代
    return JSON.stringify(a) === JSON.stringify(b);
};

// --- Custom Hook ---
export const useLyricEditor = () => {
    // --- Refs ---
    const playerRef = useRef<YouTubePlayerHandle>(null);

    // --- State: Video ID ---
    const [videoId, setVideoId] = useState(() => {
        return sessionStorage.getItem(STORAGE_KEY_VIDEO_ID) ?? "sL-yJIyuEaM";
    });
    const [tempVideoId, setTempVideoId] = useState(videoId);

    // --- State: Lyrics ---
    const [lyrics, setLyrics] = useState<LyricData>(() => {
        const savedLyrics = sessionStorage.getItem(STORAGE_KEY_LYRICS);
        if (savedLyrics) {
            try {
                return JSON.parse(savedLyrics);
            } catch {
                console.error(
                    "Failed to parse saved lyrics from sessionStorage",
                );
            }
        }
        return [];
    });

    // 儲存正在編輯/暫存的歌詞
    const [stagedLyrics, setStagedLyrics] = useState<LyricData>(lyrics);

    // --- State: Player Status ---
    const [playerTime, setPlayerTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // --- State: UI ---
    const [jsonModalOpen, setJsonModalOpen] = useState(false);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [editingLineIndex, setEditingLineIndex] = useState<number | null>(
        null,
    );

    // 🚨 新增：根據路徑抓取歌詞的通用函式
    const loadLyricsByPath = async (
        songId: number,
        folder: string,
        version: string,
    ) => {
        try {
            // 編碼 URL 以防資料夾名稱有空格或特殊字元
            const encodedFolder = encodeURIComponent(folder);

            const url = `https://lyric.timesl.online/${songId}_${folder}/${version}.json`;

            const response = await fetch(url);
            if (!response.ok) throw new Error("Network response was not ok");

            const mapping = await response.json();

            // 更新所有相關狀態
            setLyrics(mapping);
            setStagedLyrics(mapping);
            setEditingLineIndex(null);

            // 同步到 sessionStorage
            sessionStorage.setItem(STORAGE_KEY_LYRICS, JSON.stringify(mapping));

            console.log(`Successfully loaded lyrics: ${folder}/${version}`);
            return true;
        } catch (e) {
            console.error("Failed to fetch lyrics:", e);
            alert("無法載入歌詞檔案，請檢查 GitHub 儲存庫路徑是否存在。");
            return false;
        }
    };

    // --- Effects: Storage Sync ---
    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEY_VIDEO_ID, videoId);
    }, [videoId]);

    // --- Computed Values ---
    // 1. 預處理：為每行歌詞計算精確的「結束時間」
    // 這樣不用每次 playerTime 變更時都重新 reduce 陣列，節省效能
    const linesWithTiming = useMemo(() => {
        return lyrics.map((line) => {
            const startTime = timeToSeconds(line.time);
            let totalDuration = 0;

            // 計算該行的總持續時間 (根據 text 內的 phrase duration 加總)
            if (line.text && Array.isArray(line.text)) {
                totalDuration = line.text.reduce((sum, phrase) => {
                    // 假設 duration 是 centiseconds (10ms)，轉為秒
                    return sum + (phrase.duration || 0) / 100;
                }, 0);
            }

            // 防呆：如果算出 0，給個預設值 (例如 3秒) 避免瞬間消失
            if (totalDuration === 0) totalDuration = 3.0;

            return {
                startTime,
                computedEndTime: startTime + totalDuration,
            };
        });
    }, [lyrics]);

    // 2. 核心邏輯：找出所有「現在應該顯示」的行數索引 (多行支援)
    const activeLineIndices = useMemo(() => {
        const activeIndices: number[] = [];
        const startOffset = 0.3; // 提早顯示
        const endBuffer = 0.2; // 延後消失

        linesWithTiming.forEach((line, index) => {
            const start = line.startTime - startOffset;
            const end = line.computedEndTime + endBuffer;

            // 判斷當前時間是否落在 [開始-0.3, 結束+0.2] 區間內
            if (playerTime >= start && playerTime < end) {
                activeIndices.push(index);
            }
        });

        return activeIndices;
    }, [playerTime, linesWithTiming]);

    // 3. 定義當前行 (用於自動滾動)
    // 為了相容原本的邏輯，我們取活躍行中的「最後一行」作為主要滾動目標
    const currentLineIndex = useMemo(() => {
        if (activeLineIndices.length === 0) return -1;
        return activeLineIndices[activeLineIndices.length - 1];
    }, [activeLineIndices]);

    // 檢查是否有未提交的變更
    const hasUncommittedChanges = useMemo(() => {
        return !areLyricsEqual(lyrics, stagedLyrics);
    }, [lyrics, stagedLyrics]);

    // --- Core Actions ---

    const handleVideoLoad = () => {
        setVideoId(tempVideoId);
    };

    const handleSeek = (timeInput: string | number) => {
        if (typeof timeInput === "number") {
            if (playerRef.current) {
                playerRef.current.seekTo(timeInput);
                setPlayerTime(timeInput);
            }
            return;
        }

        // 處理字串時間格式
        const timeStr = timeInput.trim();
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

    // --- Commit/Discard ---
    const commitLyrics = () => {
        if (!hasUncommittedChanges) return;

        // 1. 複製並確保是新的陣列實例
        let newStagedLyrics = JSON.parse(JSON.stringify(stagedLyrics));

        // 2. 🚨 新增：根據 line.time 進行排序
        newStagedLyrics.sort((a, b) => {
            const timeA = timeToSeconds(a.time);
            const timeB = timeToSeconds(b.time);
            return timeA - timeB; // 升序排列 (時間早的在前)
        });

        // 3. 更新 lyrics 狀態
        setStagedLyrics(newStagedLyrics);
        setLyrics(newStagedLyrics);

        // 4. 將排序後的結果儲存到 sessionStorage
        sessionStorage.setItem(
            STORAGE_KEY_LYRICS,
            JSON.stringify(newStagedLyrics),
        );
        console.log(
            "Lyrics committed, sorted by time, and saved to sessionStorage!",
        );
    };

    const discardChanges = () => {
        if (!hasUncommittedChanges) return;
        const confirmation = window.confirm(
            "確定要放棄所有未提交的變更嗎？這將會回復到上次提交的狀態。",
        );

        if (!confirmation) return;

        const newLyrics = JSON.parse(JSON.stringify(lyrics));
        setStagedLyrics(newLyrics);
        setEditingLineIndex(null);
        console.log("Uncommitted changes discarded.");
    };

    // --- Editor Actions ---
    const handleStamp = (index: number, bg: boolean) => {
        const newLyrics = [...stagedLyrics];
        if (bg) {
            if (!newLyrics[index].background_voice) return;
            newLyrics[index] = {
                ...newLyrics[index],
                background_voice: {
                    ...newLyrics[index].background_voice,
                    time: secondsToTime(playerTime, 1),
                },
            };
        } else {
            newLyrics[index] = {
                ...newLyrics[index],
                time: secondsToTime(playerTime, 1),
            };
        }
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
            text: [{ phrase: "輸入歌詞", duration: 20 }],
            translation: "",
        };
        const insertIndex =
            currentLineIndex !== -1
                ? currentLineIndex + 1
                : stagedLyrics.length;
        const newLyrics = [...stagedLyrics];
        newLyrics.splice(insertIndex, 0, newLine);
        setStagedLyrics(newLyrics);
        setEditingLineIndex(insertIndex);
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
                    setStagedLyrics(json);
                    setEditingLineIndex(null);
                    sessionStorage.setItem(
                        STORAGE_KEY_LYRICS,
                        JSON.stringify(json),
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

    return {
        // Refs
        playerRef,
        // Video State
        videoId,
        tempVideoId,
        setTempVideoId,
        handleVideoLoad,
        // Lyric State
        lyrics,
        stagedLyrics,
        setStagedLyrics,
        // Player State
        playerTime,
        setPlayerTime,
        isPlaying,
        setIsPlaying,
        // UI State
        jsonModalOpen,
        setJsonModalOpen,
        previewModalOpen,
        setPreviewModalOpen,
        editingLineIndex,
        setEditingLineIndex,
        // Computed Values
        currentLineIndex,
        activeLineIndices,
        hasUncommittedChanges,
        // Actions
        handleSeek,
        handlePlayPause,
        commitLyrics,
        discardChanges,
        handleStamp,
        updateLine,
        deleteLine,
        addLine,
        handleFileUpload,
        loadLyricsByPath,
        setVideoId,
    };
};
