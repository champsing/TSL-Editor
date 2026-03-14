import { useArtistNames } from "@/hooks/useArtistName";
import { Song } from "@composables/types";
import { Search, X, Plus } from "lucide-react";
import React from "react";
import { CreateSongView } from "./CreateSongView";

// ── VersionsModalContent (inline，複用 EditorTab 的邏輯) ──────────────────────
export const inputClassSong =
    "w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors";

// ── Main Modal ────────────────────────────────────────────────────────────────
export const SongSelectionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSelect: (song: Song) => void;
    isLoggedIn?: boolean;
}> = ({ isOpen, onClose, onSelect, isLoggedIn = false }) => {
    const { songs, loading, formatArtistNames, refetch } = useArtistNames();
    const [search, setSearch] = React.useState("");
    const [view, setView] = React.useState<"list" | "create">("list");

    if (!isOpen) return null;

    const filteredSongs = songs.filter((s) => {
        const term = search.toLowerCase();
        return (
            s.title.toLowerCase().includes(term) ||
            formatArtistNames(s.artist).toLowerCase().includes(term)
        );
    });

    const handleCreated = () => {
        // 重新抓歌曲列表，然後回到清單
        refetch?.();
        setView("list");
    };

    if (view === "create") {
        return (
            <div className="fixed inset-0 z-51 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-[#1a202c] border border-white/10 w-full max-w-2xl max-h-[80vh] rounded-2xl flex flex-col shadow-2xl">
                    <CreateSongView
                        onBack={() => setView("list")}
                        onCreated={handleCreated}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-51 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a202c] border border-white/10 w-full max-w-2xl max-h-[80vh] rounded-2xl flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white flex gap-3 items-center">
                        <Search size={22} className="text-primary" />
                        Select a Song
                    </h3>
                    <div className="flex items-center gap-3">
                        {isLoggedIn && (
                            <button
                                onClick={() => setView("create")}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-lg text-sm font-semibold transition-all"
                            >
                                <Plus size={15} />
                                New Song
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="p-4">
                    <input
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                        placeholder="Search title or artist..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {loading ? (
                        <div className="py-12 text-center text-gray-500">
                            Loading…
                        </div>
                    ) : filteredSongs.length === 0 ? (
                        <div className="py-12 text-center text-gray-500">
                            No songs found.
                        </div>
                    ) : (
                        filteredSongs.map((song) => (
                            <button
                                key={song.song_id}
                                onClick={() => {
                                    onSelect(song);
                                    onClose();
                                }}
                                className="w-full flex items-center gap-4 p-3 rounded-xl bg-white/3 hover:bg-white/8 border border-white/5 hover:border-white/15 transition-all text-left group"
                            >
                                {song.art && (
                                    <img
                                        src={song.art}
                                        alt=""
                                        className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                                    />
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-white font-semibold text-sm truncate">
                                        {song.title}
                                    </p>
                                    <p className="text-gray-400 text-xs truncate">
                                        {formatArtistNames(song.artist)}
                                    </p>
                                </div>
                                <span className="text-gray-600 text-xs font-mono shrink-0">
                                    #{song.song_id}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
