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

    // ── Derived subtitle ReactNodes ──────────────────────────────────────────

    // Song Status — available 綠/紅，is_duet 藍，furigana 紫
    const statusSubtitle = (() => {
        return (
            <>
                <span
                    className={`font-semibold ${
                        songData.available
                            ? "text-green-400"
                            : "text-red-400/80"
                    }`}
                >
                    {songData.available ? "✓ Available" : "✗ Unavailable"}
                </span>
                {!!songData.is_duet && (
                    <span className="text-blue-400 font-semibold"> · Duet</span>
                )}
                {!!songData.furigana && (
                    <span className="text-purple-400 font-semibold">
                        {" "}
                        · Furigana
                    </span>
                )}
            </>
        );
    })();

    // Information — 標題白字，副標灰字
    const mainSubtitle = songData.title ? (
        <>
            <span className="text-gray-300 font-medium">{songData.title}</span>
            {songData.subtitle && (
                <span className="text-gray-500">{songData.subtitle}</span>
            )}
        </>
    ) : (
        <span className="text-gray-600 italic">Title, artist, language…</span>
    );

    // Cover Art — 綠色 ✓ 或灰色 ✗
    const coverSubtitle = songData.art ? (
        <span className="text-green-400 font-semibold">✓ configured</span>
    ) : (
        <span className="text-gray-500">✗ not set</span>
    );

    // Song Versions — 數量藍色 + 版本名列表
    const versionsSubtitle = (() => {
        const count = songData.versions?.length || 0;
        const names = (songData.versions || []).map((v: Version) => v.version);
        return (
            <>
                <span className="text-blue-400 font-semibold">
                    {count} version{count !== 1 ? "s" : ""}
                </span>
                {names.length > 0 && (
                    <span className="text-gray-600"> · {names.join(", ")}</span>
                )}
            </>
        );
    })();

    // Album — null 用灰色 mono，有名稱直接顯示（自訂內容），有 link 加橙色鏈結標示
    const albumSubtitle = (() => {
        if (songData.album === null) {
            return (
                <span className="text-gray-600 font-mono italic">
                    null (disabled)
                </span>
            );
        }
        const name = songData.album?.name;
        const hasLink = !!songData.album?.link;
        if (!name) {
            return (
                <span className="text-gray-600 italic">No album name set</span>
            );
        }
        return (
            <>
                {/* 自訂內容：原樣顯示，不加顏色標記 */}
                <span className="text-gray-300">{name}</span>
                {hasLink && (
                    <span className="text-orange-400/80 font-semibold">
                        {" "}
                        · 🔗 link set
                    </span>
                )}
            </>
        );
    })();

    // Translation — available 綠/灰，author 灰字（自訂），modified 黃色
    const translationSubtitle = (() => {
        const t = songData.translation;
        if (!t) return <span className="text-gray-600 italic">No data</span>;
        return (
            <div className="flex flex-col gap-1">
                {t.author && (
                    /* 自訂內容：作者名原樣顯示 */
                    <div className="text-gray-400">{t.author}</div>
                )}
                <div>
                    <span
                        className={`font-semibold ${
                            t.available ? "text-green-400" : "text-gray-500"
                        }`}
                    >
                        {t.available ? "✓ Enabled" : "Disabled"}
                    </span>
                    {t.modified && (
                        <span className="text-yellow-400 font-semibold ml-2">
                            {" "}
                            · ✏️Modified
                        </span>
                    )}
                </div>
            </div>
        );
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
                        subtitle={statusSubtitle}
                        accentClass="bg-green-500/15 text-green-400 group-hover:bg-green-500/25"
                        onClick={() => setOpenModal("status")}
                    />
                    <EditorEntryButton
                        icon={<Music size={22} />}
                        label="Information"
                        subtitle={mainSubtitle}
                        accentClass="bg-rose-500/15 text-rose-500 group-hover:bg-rose-500/25"
                        onClick={() => setOpenModal("main")}
                    />
                    <EditorEntryButton
                        icon={<ImageIcon size={22} />}
                        label="Cover Art"
                        subtitle={coverSubtitle}
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
                        subtitle={versionsSubtitle}
                        accentClass="bg-blue-500/15 text-blue-400 group-hover:bg-blue-500/25"
                        onClick={() => setOpenModal("versions")}
                    />
                    <EditorEntryButton
                        icon={<Disc3 size={22} />}
                        label="Album"
                        subtitle={albumSubtitle}
                        accentClass="bg-orange-500/15 text-orange-400 group-hover:bg-orange-500/25"
                        onClick={() => setOpenModal("album")}
                    />
                    <EditorEntryButton
                        icon={<BookOpen size={22} />}
                        label="Translation"
                        subtitle={translationSubtitle}
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
