import React, { useState, useEffect, useMemo, useRef } from "react";
import { LyricData, LyricLine } from "../types";
import {
    INITIAL_JSON_DATA,
    DEFAULT_VIDEO_ID,
    secondsToTime,
    timeToSeconds,
} from "../utils";
import { YouTubePlayerHandle } from "../components/YouTubePlayer";

// --- Constants ---
const STORAGE_KEY_VIDEO_ID = "sync_editor_video_id";
const STORAGE_KEY_LYRICS = "sync_editor_lyrics";
const tenbyouVideoID = "sL-yJIyuEaM";

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
        const savedId = sessionStorage.getItem(STORAGE_KEY_VIDEO_ID);
        return savedId || DEFAULT_VIDEO_ID;
    });
    const [tempVideoId, setTempVideoId] = useState(videoId);

    // --- State: Lyrics ---
    const [lyrics, setLyrics] = useState<LyricData>(() => {
        const savedLyrics = sessionStorage.getItem(STORAGE_KEY_LYRICS);
        if (savedLyrics) {
            try {
                return JSON.parse(savedLyrics);
            } catch (e) {
                console.error(
                    "Failed to parse saved lyrics from sessionStorage",
                    e,
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

        const newStagedLyrics = JSON.parse(JSON.stringify(stagedLyrics));
        setLyrics(newStagedLyrics);
        sessionStorage.setItem(
            STORAGE_KEY_LYRICS,
            JSON.stringify(newStagedLyrics),
        );
        console.log("Lyrics committed and saved to sessionStorage!");
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
            text: [{ phrase: "新行歌詞", duration: 20 }],
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

    const copyJson = () => {
        const jsonStr = JSON.stringify(lyrics, null, 4);
        navigator.clipboard.writeText(jsonStr).then(() => {
            console.log("JSON copied to clipboard!");
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

    // 🚨 新增 fetch 函式 (使用 useCallback 確保函式穩定性)
    const fetchTenbyou = React.useCallback(async () => {
        try {
            const response = await fetch(
                "https://raw.githubusercontent.com/champsing/Time-synced-lyrics/refs/heads/master/mappings/Mrs%20Green%20Apple%2C%20Sonoko%20Inoue%20-%20Tenbyouno%20Uta/original.json",
            );
            const mapping = await response.json();
            // 🚨 這裡直接使用 setVideoId，而不是 setTempVideoId

            setVideoId(tenbyouVideoID);
            setTempVideoId(tenbyouVideoID); // 確保 tempVideoId 也更新
            setLyrics(mapping);
            setStagedLyrics(mapping); // 確保 stagedLyrics 也更新
            sessionStorage.setItem(STORAGE_KEY_VIDEO_ID, tenbyouVideoID);
            sessionStorage.setItem(STORAGE_KEY_LYRICS, JSON.stringify(mapping));
            console.log(
                "Successfully fetched Mrs. GREEN APPLE feat. Sonoko Inoue - Tenbyounouta's mapping file.",
            );
        } catch (e) {
            console.error(
                "Couldn't fetch Mrs. GREEN APPLE feat. Sonoko Inoue - Tenbyounouta's mapping file, using fallback initial data.",
                e,
            );
        }
    }, [setVideoId, setTempVideoId, setLyrics, setStagedLyrics]);

    useEffect(() => {
        // 檢查 tempVideoId 是否為預設值
        if (!tempVideoId || tempVideoId === DEFAULT_VIDEO_ID) {
            console.log("No lyrics loaded, attempting to fetch example data.");
            fetchTenbyou();
            handleVideoLoad();
        }
    }, [fetchTenbyou]); // 依賴 fetchTenbyou (它是一個穩定的 useCallback 函式)

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
        activeLineIndices, // 👈 新增導出這個陣列
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
        copyJson,
        handleFileUpload,
        fetchTenbyou,
    };
};
