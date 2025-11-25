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
            newLyrics[index] = {
                ...newLyrics[index],
                background_voice: {
                    ...newLyrics[index].background_voice!,
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
    };
};
