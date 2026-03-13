// components/SongMetaEditorTab.tsx
import React, { useState } from "react";
import { Song } from "../../composables/types";
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
import { SongSelectionModal } from "../Header/SongSelectionModal";
import { useArtistNames } from "@/hooks/useArtistName";
import { SongMetaEditorModal } from "./EditorModal";
import { Version } from "@/composables/types";

interface Props {
    songData: Song;
    setSongData: (data: Song) => void;
}

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
                <VersionsModalContent
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

const inputClass =
    "w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-medium";
const labelClass =
    "flex items-center gap-2 text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest";

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
            <label className={labelClass}>
                <Music size={14} /> Title
            </label>
            <input
                value={songData.title}
                onChange={(e) => onChange("title", e.target.value)}
                className={inputClass}
            />
        </div>
        <div>
            <label className={labelClass}>
                <Music size={14} className="opacity-50" /> Subtitle
            </label>
            <input
                value={songData.subtitle || ""}
                onChange={(e) => onChange("subtitle", e.target.value)}
                className={inputClass}
            />
        </div>
        <MultiSelectArtistField
            label="Artist"
            icon={<User size={14} />}
            selectedIds={parseIds(songData.artist)}
            lookup={artistLookup}
            onChange={(ids) => onChange("artist", ids.join(","))}
        />
        <MultiSelectArtistField
            label="Lyricist"
            icon={<User size={14} className="opacity-50" />}
            selectedIds={parseIds(songData.lyricist)}
            lookup={artistLookup}
            chipColorClass="bg-blue-400/20 text-blue-400 border-blue-400/30"
            onChange={(ids) => onChange("lyricist", ids.join(","))}
        />
        <div>
            <label className={labelClass}>
                <Globe size={14} /> Language Code
            </label>
            <input
                value={songData.lang}
                onChange={(e) => onChange("lang", e.target.value)}
                className={`${inputClass} font-mono`}
                placeholder="ja / en / zh"
            />
        </div>
        <div>
            <label className={labelClass}>
                <Folder size={14} /> Folder Path
            </label>
            <input
                value={songData.folder}
                onChange={(e) => onChange("folder", e.target.value)}
                className={`${inputClass} font-mono text-sm`}
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
            <label className={labelClass}>
                <Link size={14} /> URL
            </label>
            <input
                value={songData.art}
                onChange={(e) => onChange("art", e.target.value)}
                className={`${inputClass} text-xs h-11`}
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

// ── 4. Versions ───────────────────────────────────────────────────────────────
const VersionsModalContent: React.FC<{
    versions: Version[];
    onUpdate: (versions: Version[]) => void;
}> = ({ versions, onUpdate }) => {
    const updateVersion = (idx: number, field: keyof Version, value: any) => {
        const updated = [...versions];
        updated[idx] = { ...updated[idx], [field]: value };
        onUpdate(updated);
    };

    const setDefault = (idx: number) => {
        onUpdate(versions.map((v, i) => ({ ...v, default: i === idx })));
    };

    const removeVersion = (idx: number) => {
        onUpdate(versions.filter((_, i) => i !== idx));
    };

    if (versions.length === 0) {
        return (
            <div className="py-12 text-center text-gray-500 italic border border-dashed border-white/10 rounded-2xl">
                No versions defined.
            </div>
        );
    }

    return (
        <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                    <th className="pb-2 pl-4 w-12 text-center">Def.</th>
                    <th className="pb-2">Version Name</th>
                    <th className="pb-2">YouTube ID</th>
                    <th className="pb-2 w-28">Duration</th>
                    <th className="pb-2 pr-4 w-12"></th>
                </tr>
            </thead>
            <tbody>
                {versions.map((v, idx) => (
                    <tr key={idx} className="bg-black/20 group transition-all">
                        <td className="py-3 pl-4 rounded-l-xl text-center">
                            <button
                                onClick={() => setDefault(idx)}
                                className={`transition-colors ${v.default ? "text-yellow-400" : "text-gray-600 hover:text-gray-400"}`}
                            >
                                <Star
                                    size={18}
                                    fill={v.default ? "currentColor" : "none"}
                                />
                            </button>
                        </td>
                        <td className="py-3">
                            <input
                                value={v.version}
                                onChange={(e) =>
                                    updateVersion(
                                        idx,
                                        "version",
                                        e.target.value,
                                    )
                                }
                                disabled={v.version === "original"}
                                className="bg-transparent border-none p-0 text-sm text-white focus:ring-0 w-full font-bold disabled:opacity-50"
                                placeholder="Version name"
                            />
                        </td>
                        <td className="py-3">
                            <input
                                value={v.id}
                                onChange={(e) =>
                                    updateVersion(idx, "id", e.target.value)
                                }
                                className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-blue-300 font-mono focus:border-primary/50 outline-none w-11/12"
                                placeholder="Video ID"
                            />
                        </td>
                        <td className="py-3">
                            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded px-2 py-1 w-24">
                                <Clock size={12} className="text-gray-500" />
                                <input
                                    value={v.duration}
                                    onChange={(e) =>
                                        updateVersion(
                                            idx,
                                            "duration",
                                            e.target.value,
                                        )
                                    }
                                    className="bg-transparent border-none p-0 text-xs text-white focus:ring-0 w-full font-mono"
                                />
                            </div>
                        </td>
                        <td className="py-3 pr-4 rounded-r-xl text-right">
                            {v.version !== "original" && (
                                <button
                                    onClick={() => removeVersion(idx)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared sub-components (previously in SongMetaEditorTab)
// ─────────────────────────────────────────────────────────────────────────────

const ToggleItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
    color: string;
}> = ({ icon, label, checked, onChange, color }) => (
    <label
        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${checked ? "bg-white/5" : "hover:bg-white/5"}`}
    >
        <div
            className={`flex items-center gap-3 ${checked ? color : "text-gray-400"}`}
        >
            {icon}
            <span className="text-sm font-bold">{label}</span>
        </div>
        <div
            onClick={() => onChange(!checked)}
            className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${checked ? "bg-primary" : "bg-gray-700"}`}
        >
            <div
                className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${checked ? "left-6" : "left-1"}`}
            />
        </div>
    </label>
);

const MultiSelectArtistField: React.FC<{
    label: string;
    icon: React.ReactNode;
    selectedIds: number[];
    lookup: Record<number, string>;
    onChange: (newIds: number[]) => void;
    placeholder?: string;
    chipColorClass?: string;
}> = ({
    label,
    icon,
    selectedIds,
    lookup,
    onChange,
    placeholder = "Select...",
    chipColorClass = "bg-primary/20 text-primary border-primary/30",
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        } else {
            setSearchQuery("");
        }
    }, [isOpen]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleId = (id: number) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((i) => i !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const filteredOptions = Object.entries(lookup).filter(([id, name]) => {
        if (selectedIds.includes(Number(id))) return false;
        const searchLower = searchQuery.toLowerCase();
        return (
            name.toLowerCase().includes(searchLower) || id.includes(searchLower)
        );
    });

    const multiInputClass =
        "w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-medium flex flex-wrap gap-2 min-h-[46px] items-center cursor-pointer";

    return (
        <div className="relative" ref={dropdownRef}>
            <label className={labelClass}>
                {icon} {label}
            </label>
            <div className={multiInputClass} onClick={() => setIsOpen(!isOpen)}>
                {selectedIds.length === 0 && (
                    <span className="text-gray-500 text-sm">{placeholder}</span>
                )}
                {selectedIds.map((id) => (
                    <div
                        key={id}
                        className={`flex items-center gap-1.5 text-sm font-bold px-2 py-1 rounded-md border ${chipColorClass}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {lookup[id] || `ID: ${id}`}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleId(id);
                            }}
                            className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
                <div className="ml-auto text-gray-400">
                    <ChevronDown
                        size={18}
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                </div>
            </div>

            {isOpen && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-100 bg-[#2d3748] border border-white/20 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-white/10 bg-black/20">
                        <div className="relative">
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Search by name or ID..."
                                className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-all"
                            />
                            <div className="absolute left-3 top-2.5 text-gray-500">
                                <Hash size={14} />
                            </div>
                        </div>
                    </div>
                    <div className="max-h-60 overflow-y-scroll custom-scrollbar p-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(([id, name]) => (
                                <button
                                    key={id}
                                    onClick={() => toggleId(Number(id))}
                                    className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-primary hover:text-white rounded-lg transition-all mb-0.5 last:mb-0 group"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">
                                            {name}
                                        </span>
                                        <span className="text-[10px] opacity-40 group-hover:opacity-100 font-mono bg-black/20 px-1.5 py-0.5 rounded">
                                            #{id}
                                        </span>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center">
                                <p className="text-gray-500 text-sm italic">
                                    No results found
                                </p>
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="text-primary text-xs mt-2 hover:underline"
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
