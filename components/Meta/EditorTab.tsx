// components/SongMetaEditorTab.tsx
import React, { useEffect, useRef, useState } from "react";
import { Song } from "@composables/types";
import {
    Music,
    User,
    Image as ImageIcon,
    CheckCircle2,
    Users,
    Languages,
    Calendar,
    Hash,
    Plus,
    Layers,
    ChevronDown,
    Folder,
    Globe,
    Star,
    Clock,
    LinkIcon,
    Trash2,
    Link,
} from "lucide-react";
import { X } from "lucide-react";
import { SongSelectionModal } from "../Header/SongSelection/SongSelectionModal";
import { useArtistNames } from "@/hooks/useArtistName";
import { SongMetaEditorModal } from "./EditorModal";
import { Version } from "@composables/types";
import { ArtistSelectModal } from "./ArtistSelection/ArtistSelectModal";
import { ToggleItem } from "./EditorTab/ToggleItem";
import { MultiSelectArtistModal } from "./EditorTab/MultiSelectArtistModal";
import { VersionsModal } from "./EditorTab/VersionsModal";

interface Props {
    songData: Song;
    setSongData: (data: Song) => void;
}

export const inputClassEditor =
    "w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-medium";
export const labelClassEditor =
    "flex items-center gap-2 text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest";

// ─── Modal key type ────────────────────────────────────────────────────────────
type ModalKey = "status" | "main" | "cover" | "versions" | null;

export const SongMetaEditorTab: React.FC<Props> = ({
    songData,
    setSongData,
}) => {
    const [openModal, setOpenModal] = useState<ModalKey>(null);
    const [isSongSelectOpen, setIsSongSelectOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const { artistLookup, formatArtistNames } = useArtistNames();

    const handleChange = (field: keyof Song, value: any) => {
        setSongData({ ...songData, [field]: value });
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
                        label="Main Content"
                        subtitle={mainSummary || "Title, artist, language…"}
                        accentClass="bg-primary/15 text-primary group-hover:bg-primary/25"
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
                <StatusModalContent
                    songData={songData}
                    onChange={handleChange}
                />
            </SongMetaEditorModal>

            {/* 2. Main Content */}
            <SongMetaEditorModal
                isOpen={openModal === "main"}
                onClose={close}
                title="Main Content"
                icon={<Music size={20} />}
                accentColor="var(--color-primary, #a78bfa)"
                footer="Title, artist IDs, language code and folder path are all stored in the song buffer."
            >
                <MainContentModalContent
                    songData={songData}
                    onChange={handleChange}
                    parseIds={parseIds}
                    artistLookup={artistLookup}
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
                <CoverArtModalContent
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
                <VersionsModal
                    versions={songData.versions || []}
                    onUpdate={(v) => handleChange("versions", v)}
                />
            </SongMetaEditorModal>

            {/* Song Selection Modal */}
            <SongSelectionModal
                isOpen={isSongSelectOpen}
                onClose={() => setIsSongSelectOpen(false)}
                onSelect={(selectedSong) => setSongData(selectedSong)}
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

// ─────────────────────────────────────────────────────────────────────────────
// EditorEntryButton — the unified entry tile on the main page
// ─────────────────────────────────────────────────────────────────────────────
const EditorEntryButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    subtitle?: string;
    accentClass?: string;
    onClick: () => void;
    preview?: React.ReactNode;
}> = ({
    icon,
    label,
    subtitle,
    accentClass = "bg-primary/15 text-primary group-hover:bg-primary/25",
    onClick,
    preview,
}) => (
    <button
        onClick={onClick}
        className="group w-full flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/8 hover:border-white/20 transition-all duration-200 text-left"
    >
        <div
            className={`p-3 rounded-xl transition-colors duration-200 ${accentClass}`}
        >
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                {label}
            </div>
            {subtitle && (
                <div className="text-xs text-gray-500 mt-0.5 truncate">
                    {subtitle}
                </div>
            )}
        </div>
        {preview && <div className="shrink-0">{preview}</div>}
        <Plus
            size={18}
            className="text-gray-600 group-hover:text-primary transition-colors shrink-0"
        />
    </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// Modal content components
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Status ─────────────────────────────────────────────────────────────────
const StatusModalContent: React.FC<{
    songData: Song;
    onChange: (field: keyof Song, value: any) => void;
}> = ({ songData, onChange }) => (
    <div className="bg-black/20 border border-white/10 rounded-2xl p-4 space-y-2">
        <ToggleItem
            icon={<CheckCircle2 size={18} />}
            label="Available"
            checked={!!songData.available}
            onChange={(val) => onChange("available", val ? 1 : 0)}
            color="text-green-400"
        />
        <ToggleItem
            icon={<Users size={18} />}
            label="Duet Mode"
            checked={!!songData.is_duet}
            onChange={(val) => onChange("is_duet", val ? 1 : 0)}
            color="text-blue-400"
        />
        <ToggleItem
            icon={<Languages size={18} />}
            label="Furigana"
            checked={!!songData.furigana}
            onChange={(val) => onChange("furigana", val ? 1 : 0)}
            color="text-purple-400"
        />
    </div>
);

// ── 2. Main Content ───────────────────────────────────────────────────────────
const MainContentModalContent: React.FC<{
    songData: Song;
    onChange: (field: keyof Song, value: any) => void;
    parseIds: (s: string | undefined) => number[];
    artistLookup: Record<number, string>;
}> = ({ songData, onChange, parseIds, artistLookup }) => (
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

{/* 這裡要加 Artist 和 Lyricist */}

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

// ── 3. Cover Art ──────────────────────────────────────────────────────────────
const CoverArtModalContent: React.FC<{
    songData: Song;
    onChange: (field: keyof Song, value: any) => void;
    onPreview: (url: string) => void;
}> = ({ songData, onChange, onPreview }) => (
    <div className="space-y-4">
        <div className="flex items-center gap-3 px-4">
            <label className={labelClassEditor}>
                <Link size={14} /> URL
            </label>
            <input
                value={songData.art}
                onChange={(e) => onChange("art", e.target.value)}
                className={`${inputClassEditor} text-xs h-11`}
                placeholder="https://..."
            />
        </div>
        {songData.art && (
            <div className="flex justify-center">
                <img
                    src={songData.art}
                    alt="Cover Art Preview"
                    onClick={() => onPreview(songData.art)}
                    className="max-h-64 rounded-xl border border-white/10 shadow-xl object-contain cursor-zoom-in hover:scale-[1.02] transition-transform"
                />
            </div>
        )}
    </div>
);
