// components/SongMetaEditorTab.tsx
import { useArtistNames } from "@/hooks/useArtistName";
import { Song, Version } from "@composables/types";
import {
    BookOpen,
    Calendar,
    CheckCircle2,
    Disc3,
    Hash,
    Image as ImageIcon,
    Layers,
    LinkIcon,
    Music,
    Plus,
} from "lucide-react";
import React, { useState } from "react";
import { SongSelectionModal } from "../Header/SongSelection/SongSelectionModal";
import { VersionsEditor } from "../Header/SongSelection/VersionEditor";
import { SongMetaEditorModal } from "./EditorModal";
import { EditorEntryButton } from "./EditorTab/EditorEntryButton";
import { AlbumModal } from "./EditorTab/Modals/AlbumModal";
import { CoverArtModal } from "./EditorTab/Modals/CoverArtModal";
import { InformationModal } from "./EditorTab/Modals/InformationModal";
import { StatusModal } from "./EditorTab/Modals/StatusModal";
import { TranslationModal } from "./EditorTab/Modals/TranslationModal";

interface Props {
    songData: Song;
    setSongChangeTitle: (data: Song) => void;
    /** 點擊鉛筆後，通知 App 切換歌詞編輯版本 */
    onVersionSwitch?: (version: Version) => void;
}

export const inputClassEditor =
    "w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-medium";
export const labelClassEditor =
    "flex items-center gap-2 text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest";

// ─── Modal key type ────────────────────────────────────────────────────────────
type ModalKey =
    | "status"
    | "main"
    | "cover"
    | "versions"
    | "album"
    | "translation"
    | null;
export const SongMetaEditorTab: React.FC<Props> = ({
    songData,
    setSongChangeTitle,
    onVersionSwitch,
}) => {
    const [openModal, setOpenModal] = useState<ModalKey>(null);
    const [isSongSelectOpen, setIsSongSelectOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { formatArtistNames } = useArtistNames();

    const handleChange = (field: keyof Song, value: any) => {
        setSongChangeTitle({ ...songData, [field]: value });
    };

    const parseIds = (idString: string | undefined) => {
        if (!idString) return [];
        return String(idString)
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
            .map(Number);
    };

    const close = () => setOpenModal(null);

    // ── Derived display values for button subtitles ──────────────────────────
    const statusSummary = [
        songData.available ? "Available" : "Unavailable",
        songData.is_duet ? "Duet" : null,
        songData.furigana ? "Furigana" : null,
    ]
        .filter(Boolean)
        .join(" · ");

    const mainSummary = [songData.title, songData.subtitle]
        .filter(Boolean)
        .join(" — ");

    const albumSummary =
        songData.album === null
            ? "Not set (null)"
            : songData.album?.name
              ? songData.album.name
              : "No name set";

    const translationSummary = (() => {
        const t = songData.translation;
        if (!t) return "No data";
        const parts: string[] = [];
        if (t.available) parts.push("Enabled");
        else parts.push("Disabled");
        if (t.author) parts.push(t.author);
        if (t.modified) parts.push("Modified");
        return parts.join(" · ");
    })();

    return (
        <div className="flex-1 bg-[#1a202c] p-8 custom-scrollbar overflow-y-auto pb-32">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-black text-white flex items-center gap-3">
                            <Music className="text-primary" size={32} />
                        </h2>
                        <div className="flex flex-col leading-tight">
                            <span className="text-white font-bold text-lg">
                                {songData.title}
                            </span>
                            <span className="text-gray-400 text-sm">
                                {formatArtistNames(songData.artist)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
                            <Hash size={16} className="text-primary" />
                            <span className="font-mono text-primary font-bold">
                                {songData.song_id}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Calendar size={16} />
                            <span className="text-xs font-bold uppercase tracking-wider">
                                Last Updated:
                            </span>
                        </div>
                        <input
                            type="date"
                            value={
                                songData.updated_at
                                    ? songData.updated_at.split(" ")[0]
                                    : ""
                            }
                            onChange={(e) =>
                                handleChange("updated_at", e.target.value)
                            }
                            className="bg-black/40 border border-white/10 rounded px-3 py-1 text-sm text-primary font-mono focus:outline-none focus:border-primary transition-colors cursor-pointer"
                        />
                    </div>
                </div>

                {/* ── Editor Entry Buttons Grid ───────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <EditorEntryButton
                        icon={<CheckCircle2 size={22} />}
                        label="Song Status"
                        subtitle={statusSummary}
                        accentClass="bg-green-500/15 text-green-400 group-hover:bg-green-500/25"
                        onClick={() => setOpenModal("status")}
                    />
                    <EditorEntryButton
                        icon={<Music size={22} />}
                        label="Information"
                        subtitle={mainSummary || "Title, artist, language…"}
                        accentClass="bg-rose-500/15 text-rose-500 group-hover:bg-rose-500/25"
                        onClick={() => setOpenModal("main")}
                    />
                    <EditorEntryButton
                        icon={<ImageIcon size={22} />}
                        label="Cover Art"
                        subtitle={
                            songData.art
                                ? "Art URL configured"
                                : "No art URL set"
                        }
                        accentClass="bg-purple-500/15 text-purple-400 group-hover:bg-purple-500/25"
                        onClick={() => setOpenModal("cover")}
                        preview={
                            songData.art ? (
                                <img
                                    src={songData.art}
                                    alt="Cover"
                                    className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                                />
                            ) : undefined
                        }
                    />
                    <EditorEntryButton
                        icon={<Layers size={22} />}
                        label="Song Versions"
                        subtitle={`${songData.versions?.length || 0} version${(songData.versions?.length || 0) !== 1 ? "s" : ""} configured`}
                        accentClass="bg-blue-500/15 text-blue-400 group-hover:bg-blue-500/25"
                        onClick={() => setOpenModal("versions")}
                    />
                    <EditorEntryButton
                        icon={<Disc3 size={22} />}
                        label="Album"
                        subtitle={albumSummary}
                        accentClass="bg-orange-500/15 text-orange-400 group-hover:bg-orange-500/25"
                        onClick={() => setOpenModal("album")}
                    />
                    <EditorEntryButton
                        icon={<BookOpen size={22} />}
                        label="Translation"
                        subtitle={translationSummary}
                        accentClass="bg-teal-500/15 text-teal-400 group-hover:bg-teal-500/25"
                        onClick={() => setOpenModal("translation")}
                    />
                </div>
            </div>

            {/* ── Modals ───────────────────────────────────────────────────── */}

            {/* 1. Song Status */}
            <SongMetaEditorModal
                isOpen={openModal === "status"}
                onClose={close}
                title="Song Status"
                icon={<CheckCircle2 size={20} />}
                accentColor="#4ade80"
                footer="Changes are saved to the current song buffer immediately."
            >
                <StatusModal songData={songData} onChange={handleChange} />
            </SongMetaEditorModal>

            {/* 2. Information */}
            <SongMetaEditorModal
                isOpen={openModal === "main"}
                onClose={close}
                title="Information"
                icon={<Music size={20} />}
                accentColor="var(--color-rose-500, #ff2056)"
                footer="Title, artist IDs, language code and folder path are all stored in the song buffer."
            >
                <InformationModal
                    songData={songData}
                    onChange={handleChange}
                    parseIds={parseIds}
                />
            </SongMetaEditorModal>

            {/* 3. Cover Art */}
            <SongMetaEditorModal
                isOpen={openModal === "cover"}
                onClose={close}
                title="Cover Art"
                icon={<ImageIcon size={20} />}
                accentColor="#c084fc"
                footer="Paste any publicly accessible image URL. Click the thumbnail to preview full size."
            >
                <CoverArtModal
                    songData={songData}
                    onChange={handleChange}
                    onPreview={setPreviewImage}
                />
            </SongMetaEditorModal>

            {/* 4. Song Versions */}
            <SongMetaEditorModal
                isOpen={openModal === "versions"}
                onClose={close}
                title="Song Versions"
                icon={<LinkIcon size={20} />}
                accentColor="#60a5fa"
                actions={
                    <button
                        onClick={() => {
                            const newVersions = [
                                ...(songData.versions || []),
                                {
                                    version: "New Version",
                                    id: "",
                                    duration: "0:00",
                                    default: false,
                                },
                            ];
                            handleChange("versions", newVersions);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-black hover:bg-primary/90 rounded-lg text-xs font-black tracking-wider transition-all"
                    >
                        <Plus size={14} /> ADD
                    </button>
                }
                footer='The "original" version is required and cannot be deleted. All changes are saved to the current song buffer.'
            >
                <VersionsEditor
                    versions={songData.versions || []}
                    onUpdate={(v) => handleChange("versions", v)}
                    onEditVersion={onVersionSwitch}
                />
            </SongMetaEditorModal>

            {/* 5. Album */}
            <SongMetaEditorModal
                isOpen={openModal === "album"}
                onClose={close}
                title="Album"
                icon={<Disc3 size={20} />}
                accentColor="#fb923c"
                footer="Toggle 'No Album' to store null. The link field accepts a Google Music share code, not a full URL."
            >
                <AlbumModal songData={songData} onChange={handleChange} />
            </SongMetaEditorModal>

            {/* 6. Translation */}
            <SongMetaEditorModal
                isOpen={openModal === "translation"}
                onClose={close}
                title="Translation"
                icon={<BookOpen size={20} />}
                accentColor="#2dd4bf"
                footer="'Available' controls whether translation is shown in the player. Disabling does not erase author or cite data."
            >
                <TranslationModal songData={songData} onChange={handleChange} />
            </SongMetaEditorModal>

            {/* Song Selection Modal */}
            <SongSelectionModal
                isOpen={isSongSelectOpen}
                onClose={() => setIsSongSelectOpen(false)}
                onSelect={(selectedSong) => setSongChangeTitle(selectedSong)}
            />

            {/* Full-size image preview overlay */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-md cursor-zoom-out p-10 animate-in fade-in duration-200"
                    onClick={() => setPreviewImage(null)}
                >
                    <div className="relative max-w-4xl max-h-full">
                        <img
                            src={previewImage}
                            alt="Large Preview"
                            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl border border-white/10 object-contain animate-in zoom-in-95 duration-300"
                        />
                        <div className="absolute -top-12 left-0 right-0 text-center">
                            <p className="text-white/60 text-sm font-medium">
                                Click anywhere to close
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
