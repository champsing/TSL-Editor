import React from "react";
import { Song } from "@composables/types";
import { Music, User, Folder, Globe } from "lucide-react";
import { useArtistNames } from "@/hooks/useArtistName";
import { MultiSelectArtistModal } from "../MultiSelectArtistModal";
import { useAuth } from "@/composables/useAuth";
import { inputClassEditor, labelClassEditor } from "../../EditorTab";

// ── Information ───────────────────────────────────────────────────────────
export const InformationModal: React.FC<{
    songData: Song;
    onChange: (field: keyof Song, value: any) => void;
    parseIds: (s: string | undefined) => number[];
}> = ({ songData, onChange, parseIds }) => {
    const { user } = useAuth();

    const { artistLookup, refetch: refetchArtists } = useArtistNames();

    const handleArtistCreated = (artistId: number, name: string) => {
        refetchArtists?.();
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
                <label className={labelClassEditor}>
                    <Music size={14} /> Title
                </label>
                <input
                    value={songData.title}
                    onChange={(e) => onChange("title", e.target.value)}
                    className={inputClassEditor}
                />
            </div>
            <div>
                <label className={labelClassEditor}>
                    <Music size={14} className="opacity-50" /> Subtitle
                </label>
                <input
                    value={songData.subtitle || ""}
                    onChange={(e) => onChange("subtitle", e.target.value)}
                    className={inputClassEditor}
                />
            </div>

            <MultiSelectArtistModal
                label="Artist"
                icon={<User size={14} />}
                selectedIds={parseIds(songData.artist)}
                lookup={artistLookup}
                onChange={(ids) => onChange("artist", ids.join(","))}
                onArtistCreated={handleArtistCreated}
                isLoggedIn={!!user}
            />
            <MultiSelectArtistModal
                label="Lyricist"
                icon={<User size={14} className="opacity-50" />}
                selectedIds={parseIds(songData.lyricist)}
                lookup={artistLookup}
                chipColorClass="bg-blue-400/20 text-blue-400 border-blue-400/30"
                onChange={(ids) => onChange("lyricist", ids.join(","))}
                onArtistCreated={handleArtistCreated}
                isLoggedIn={!!user}
            />

            <div>
                <label className={labelClassEditor}>
                    <Globe size={14} /> Language Code
                </label>
                <input
                    value={songData.lang}
                    onChange={(e) => onChange("lang", e.target.value)}
                    className={`${inputClassEditor} font-mono`}
                    placeholder="ja / en / zh"
                />
            </div>
            <div>
                <label className={labelClassEditor}>
                    <Folder size={14} /> Folder Path
                </label>
                <input
                    value={songData.folder}
                    onChange={(e) => onChange("folder", e.target.value)}
                    className={`${inputClassEditor} font-mono text-sm`}
                />
            </div>
        </div>
    );
};
