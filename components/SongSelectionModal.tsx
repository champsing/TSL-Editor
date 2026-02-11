import { Song } from "@/types";
import React from "react";

// 輔助組件：歌曲選擇 Modal
export const SongSelectionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSelect: (song: Song) => void;
}> = ({ isOpen, onClose, onSelect }) => {
    const [songs, setSongs] = React.useState<Song[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [search, setSearch] = React.useState("");

    React.useEffect(() => {
        if (isOpen) {
            setLoading(true);
            fetch("https://api.timesl.online/songs")
                .then((res) => res.json())
                .then((data) => {
                    // 假設 API 回傳的是歌曲陣列，若在 data.songs 則需調整
                    setSongs(Array.isArray(data) ? data : data.songs || []);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Failed to fetch songs:", err);
                    setLoading(false);
                });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredSongs = songs.filter(
        (s) =>
            s.title.toLowerCase().includes(search.toLowerCase()) ||
            s.artist.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a202c] border border-white/10 w-full max-w-2xl max-h-[80vh] rounded-2xl flex flex-col shadow-2xl">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">
                        Select a Song
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-4">
                    <input
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                        placeholder="Search title or artist..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {loading ? (
                        <div className="text-center py-10 text-gray-400">
                            Loading songs...
                        </div>
                    ) : (
                        filteredSongs.map((song) => (
                            <button
                                key={song.song_id}
                                onClick={() => {
                                    onSelect(song);
                                    onClose();
                                }}
                                className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-primary/20 border border-white/5 hover:border-primary/30 transition-all text-left group"
                            >
                                <div>
                                    <div className="text-white font-bold group-hover:text-primary transition-colors">
                                        {song.title}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {song.artist}
                                    </div>
                                </div>
                                <div className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                                    ID: {song.song_id}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
