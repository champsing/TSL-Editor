import { UploadModal } from "@components/Header/UploadModal/UploadModal";
import { useAuth } from "@composables/useAuth";
import { FileText, Music } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EditorHeader } from "./components/Header/EditorHeader";
import { LyricModal } from "./components/Header/LyricModal";
import { SongSelectionModal } from "./components/Header/SongSelection/SongSelectionModal";
import { DiffModal } from "./components/Lyrics/DiffModal";
import { EditorSidebar } from "./components/Lyrics/EditorSidebar";
import { LyricsEditorTab } from "./components/Lyrics/LyricsEditorTab";
import { PreviewModal } from "./components/Lyrics/PreviewModal";
import { SongMetaEditorTab } from "./components/Meta/EditorTab";
import { LyricData, Song, Version } from "./composables/types";
import { API_BASE_URL, TSL_EDITOR_KEYS } from "./composables/utils";
import { useArtistNames } from "./hooks/useArtistName";
import { useLyricEditor } from "./hooks/useLyricEditor";

// --- Main App Component ---
function App() {
    const {
        // State
        videoId,
        tempVideoId,
        setTempVideoId,
        stagedLyrics,
        lyrics,
        setStagedLyrics,
        playerTime,
        setPlayerTime,
        isPlaying,
        setIsPlaying,
        previewModalOpen,
        setPreviewModalOpen,
        editingLineIndex,
        setEditingLineIndex,
        currentLineIndex,
        activeLineIndices,
        hasUncommittedChanges,
        // Refs
        playerRef,
        // Actions
        handleVideoLoad,
        handleSeek,
        handlePlayPause,
        commitLyrics,
        discardChanges,
        handleStamp,
        updateLine,
        deleteLine,
        addLine,
        handleFileUpload,
        setVideoId,
        loadLyricsByPath,
    } = useLyricEditor();

    const { formatArtistNames } = useArtistNames();
    const { user } = useAuth();

    const [diffModalOpen, setDiffModalOpen] = useState(false);
    const [activeIOModal, setActiveIOModal] = useState<
        "upload" | "json" | null
    >(null);

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [activeTab, setActiveTab] = useState<"lyrics" | "meta">("meta");
    const [isSongModalOpen, setIsSongModalOpen] = useState(false);
    const [songData, setSongData] = useState<Song>({} as Song);

    // ── 401 restore：mount 時讀 tsl_editor_* 還原狀態 ─────────────────────────
    useEffect(() => {
        const variant = sessionStorage.getItem(TSL_EDITOR_KEYS.VARIANT);
        const savedSong = sessionStorage.getItem(TSL_EDITOR_KEYS.SONG_DATA);
        if (variant && savedSong) {
            try {
                const song: Song = JSON.parse(savedSong);
                setSongData(song);
            } catch {}
            sessionStorage.removeItem(TSL_EDITOR_KEYS.VARIANT);
            sessionStorage.removeItem(TSL_EDITOR_KEYS.SONG_DATA);
        }
    }, []);

    // ── 預設載入最新歌曲 ────────────────────────────────────────────────────────
    useEffect(() => {
        const loadLatestSong = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/songs/list`);
                const songs: Song[] = await res.json();
                if (!songs.length) return;

                const latest = songs.reduce((a, b) =>
                    a.updated_at > b.updated_at ? a : b,
                );
                await handleSongSelect(latest);
            } catch (e) {
                console.error("Failed to load latest song on startup:", e);
            }
        };

        loadLatestSong();
    }, []);

    // ── 歌曲選取核心邏輯 ────────────────────────────────────────────────────────
    const handleSongSelect = async (selectedSong: Song) => {
        if (!selectedSong) {
            console.error("No song selected");
            return;
        }

        const response = await fetch(
            `${API_BASE_URL}/songs/${selectedSong.song_id}`,
        );
        const fullSongData = await response.json();

        setSongData(fullSongData);

        const versions = fullSongData.versions || [];

        const defaultVersion: Version =
            versions.find((v: Version) => v.default === true) ||
            versions.find((v: Version) => v.version === "original") ||
            versions[0];

        if (defaultVersion) {
            setVideoId(defaultVersion.id);
            setTempVideoId(defaultVersion.id);

            if (fullSongData.folder) {
                await loadLyricsByPath(
                    selectedSong.song_id,
                    fullSongData.folder,
                    defaultVersion.version,
                );
            } else {
                console.warn(
                    "Song folder is missing, cannot fetch lyrics from GitHub.",
                );
            }
        } else {
            console.warn("This song has no versions available.");
        }
    };

    // ── 自動滾動到當前行 ────────────────────────────────────────────────────────
    useEffect(() => {
        if (previewModalOpen || diffModalOpen) return;

        if (currentLineIndex !== -1 && scrollContainerRef.current) {
            const timeoutId = setTimeout(() => {
                const currentLine =
                    document.getElementsByClassName("is-current")[0];
                if (currentLine) {
                    currentLine.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            }, 0);
            return () => clearTimeout(timeoutId);
        }
        return () => {};
    }, [currentLineIndex, previewModalOpen, diffModalOpen]);

    return (
        <div className="flex flex-col h-screen bg-secondary">
            {/* Header */}
            <EditorHeader
                onOpenSongSelect={() => setIsSongModalOpen(true)}
                activeModal={activeIOModal}
                onViewJson={() => setActiveIOModal("json")}
                onUpload={() => setActiveIOModal("upload")}
            />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Tab content */}
                {activeTab === "lyrics" ? (
                    <LyricsEditorTab
                        isPlaying={isPlaying}
                        playerTime={playerTime}
                        stagedLyrics={stagedLyrics}
                        activeLineIndices={activeLineIndices}
                        editingLineIndex={editingLineIndex}
                        scrollContainerRef={scrollContainerRef}
                        hasUncommittedChanges={hasUncommittedChanges}
                        setEditingLineIndex={setEditingLineIndex}
                        addLine={addLine}
                        updateLine={updateLine}
                        deleteLine={deleteLine}
                        handleStamp={handleStamp}
                        handleSeek={handleSeek}
                        setPreviewModalOpen={setPreviewModalOpen}
                        commitLyrics={commitLyrics}
                        discardChanges={discardChanges}
                        onViewDiff={() => setDiffModalOpen(true)}
                        onPlayPause={handlePlayPause}
                        onImportJson={handleFileUpload}
                    />
                ) : (
                    <SongMetaEditorTab
                        songData={songData}
                        setSongData={setSongData}
                    />
                )}

                {/* Right Panel */}
                <EditorSidebar
                    videoId={videoId}
                    playerRef={playerRef}
                    onTimeUpdate={setPlayerTime}
                    onIsPlayingChange={setIsPlaying}
                    tempVideoId={tempVideoId}
                    setTempVideoId={setTempVideoId}
                    onVideoLoad={handleVideoLoad}
                />
            </div>

            {/* ── 底部 Tab 切換器 ──────────────────────────────────────────── */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 saturate-150 ring-1 ring-white/5">
                <button
                    onClick={() => setActiveTab("meta")}
                    className={`
                        flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 group
                        ${
                            activeTab === "meta"
                                ? "bg-primary text-black font-bold shadow-[0_0_20px_rgba(167,139,250,0.4)]"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        }
                    `}
                >
                    <Music
                        size={18}
                        className={`transition-transform duration-300 ${activeTab === "meta" ? "scale-110" : "group-hover:scale-110"}`}
                    />
                    <span className="tracking-wide text-sm">Song</span>
                </button>

                <div className="w-px h-4 bg-white/10 mx-1" />

                <button
                    onClick={() => setActiveTab("lyrics")}
                    className={`
                        flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300 group
                        ${
                            activeTab === "lyrics"
                                ? "bg-primary text-black font-bold shadow-[0_0_20px_rgba(167,139,250,0.4)]"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                        }
                    `}
                >
                    <FileText
                        size={18}
                        className={`transition-transform duration-300 ${activeTab === "lyrics" ? "scale-110" : "group-hover:scale-110"}`}
                    />
                    <span className="tracking-wide text-sm">Lyrics</span>
                </button>
            </div>

            {/* ── Modals ───────────────────────────────────────────────────── */}

            {/* Preview Modal */}
            {previewModalOpen && (
                <PreviewModal
                    lyrics={stagedLyrics}
                    currentTime={playerTime}
                    currentSongTitle={songData.title}
                    currentSongArtist={formatArtistNames(songData.artist)}
                    isPlaying={isPlaying}
                    onClose={() => setPreviewModalOpen(false)}
                    onPlayPause={handlePlayPause}
                    onSeek={handleSeek}
                />
            )}

            {/* Diff Modal */}
            {diffModalOpen && (
                <DiffModal
                    committedJson={JSON.stringify(lyrics, null, 4)}
                    uncommittedJson={JSON.stringify(stagedLyrics, null, 4)}
                    onClose={() => setDiffModalOpen(false)}
                />
            )}

            {/* JSON Modal */}
            {activeIOModal === "json" && (
                <LyricModal
                    isOpen={activeIOModal === "json"}
                    committedJson={JSON.stringify(lyrics, null, 4)}
                    uncommittedJson={JSON.stringify(stagedLyrics, null, 4)}
                    lyrics={lyrics}
                    onClose={() => setActiveIOModal(null)}
                    onUpdateUncommitted={(newJson) => {
                        try {
                            setStagedLyrics(JSON.parse(newJson) as LyricData);
                        } catch (error) {
                            console.error("Failed to parse JSON:", error);
                        }
                    }}
                    onFileUpload={handleFileUpload}
                    onSwitchToUpload={
                        user ? () => setActiveIOModal("upload") : undefined
                    }
                />
            )}

            {/* Upload Modal */}
            {activeIOModal === "upload" && (
                <UploadModal
                    isOpen={activeIOModal === "upload"}
                    songData={songData}
                    lyrics={lyrics}
                    hasUncommittedChanges={hasUncommittedChanges}
                    onClose={() => setActiveIOModal(null)}
                    onRemoteSongDataRefreshed={(refreshed) =>
                        setSongData(refreshed)
                    }
                    onSwitchToJson={() => setActiveIOModal("json")}
                />
            )}

            {/* 歌曲選擇 Modal */}
            <SongSelectionModal
                isOpen={isSongModalOpen}
                onClose={() => setIsSongModalOpen(false)}
                onSelect={handleSongSelect}
                isLoggedIn={!!user}
            />
        </div>
    );
}

export default App;
