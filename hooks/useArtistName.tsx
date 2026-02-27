import { useState, useEffect, useCallback } from "react";

export const useArtistNames = () => {
    const [songs, setSongs] = useState<any[]>([]);
    const [artistLookup, setArtistLookup] = useState<Record<string, string>>(
        {},
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        // 同時抓取歌曲與藝人對照字典
        Promise.all([
            fetch("https://api.timesl.online/api/songs/list").then((res) =>
                res.json(),
            ),
            fetch("https://api.timesl.online/api/artists/list").then((res) =>
                res.json(),
            ),
        ])
            .then(([songData, artistData]) => {
                // 處理歌曲清單
                const songList = Array.isArray(songData) ? songData : [];
                setSongs(songList);

                // 處理藝人對照表
                const lookup = artistData || {};
                setArtistLookup(lookup);
            })
            .catch((err) => {
                console.error("Fetch error in useArtistNames:", err);
                setError(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    /**
     * 格式化顯示名稱
     * 支援輸入: "1,2,3" 或 123
     */
    const formatArtistNames = useCallback(
        (artistField: string | number | null | undefined) => {
            if (!artistField) return "Unknown Artist";

            const ids = String(artistField)
                .split(",")
                .map((id) => id.trim());

            return ids.map((id) => artistLookup[id] || `ID: ${id}`).join(", ");
        },
        [artistLookup],
    );

    return {
        songs,
        artistLookup,
        loading,
        error,
        formatArtistNames,
    };
};
