// components/SongMetaEditorTab.tsx
import React, { useState } from "react";
import { Song } from "../types";
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
    Link as LinkIcon,
    Layers,
    ChevronRight,
    ChevronDown,
} from "lucide-react";
import { SongSelectionModal } from "./SongSelectionModal"; // 新增歌曲選擇 Modal 組件
import { SongVersionsModal } from "./SongVersionsModal";
import { X } from "lucide-react";
import { useArtistNames } from "@/hooks/useArtistName";

interface Props {
    songData: Song;
    setSongData: (data: Song) => void;
}

export const SongMetaEditorTab: React.FC<Props> = ({
    songData,
    setSongData,
}) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isVersionModalOpen, setIsVersionModalOpen] = React.useState(false);
    const [previewImage, setPreviewImage] = React.useState<string | null>(null);

    const { artistLookup } = useArtistNames();
    // 收合狀態管理
    const [sections, setSections] = useState({
        status: true,
        main: true,
        cover: true,
    });

    const toggleSection = (name: keyof typeof sections) => {
        setSections((prev) => ({ ...prev, [name]: !prev[name] }));
    };

    const handleChange = (field: keyof Song, value: any) => {
        setSongData({ ...songData, [field]: value });
    };

    // 解析 ID 字串為陣列的輔助函數
    const parseIds = (idString: string | undefined) => {
        if (!idString) return [];
        return String(idString)
            .split(",")
            .map((id) => id.trim())
            .filter(Boolean)
            .map(Number);
    };

    const inputClass =
        "w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-medium";
    const labelClass =
        "flex items-center gap-2 text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest";
    const sectionClass =
        "bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm";

    return (
        <div className="flex-1 bg-[#1a202c] p-8 custom-scrollbar overflow-y-auto pb-32">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div className="flex items-center justify-baseline gap-4">
                        <div>
                            <h2 className="text-3xl font-black text-white flex items-center gap-3">
                                <Music className="text-primary" size={32} />
                                Song Metadata
                            </h2>
                        </div>
                        {/* 修改後的 ID 按鈕 */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full hover:bg-primary/20">
                            <Hash size={16} className="text-primary" />
                            <span className="font-mono text-primary font-bold">
                                {songData.song_id}
                            </span>
                        </div>
                    </div>

                    {/* Date Editor */}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 左側主要區域 */}
                    <div className="flex-1 space-y-6 w-full">
                        {/* 1. Status & Versions (垂直收合) */}
                        <CollapsibleSection
                            title="Song status"
                            isOpen={sections.status}
                            onToggle={() => toggleSection("status")}
                            icon={<CheckCircle2 size={16} />}
                        >
                            <div className="grid grid-cols-1 gap-6">
                                <div className="bg-black/20 border border-white/10 rounded-2xl p-4 space-y-2">
                                    <ToggleItem
                                        icon={<CheckCircle2 size={18} />}
                                        label="Available"
                                        checked={!!songData.available}
                                        onChange={(val) =>
                                            handleChange(
                                                "available",
                                                val ? 1 : 0,
                                            )
                                        }
                                        color="text-green-400"
                                    />
                                    <ToggleItem
                                        icon={<Users size={18} />}
                                        label="Duet Mode"
                                        checked={!!songData.is_duet}
                                        onChange={(val) =>
                                            handleChange("is_duet", val ? 1 : 0)
                                        }
                                        color="text-blue-400"
                                    />
                                    <ToggleItem
                                        icon={<Languages size={18} />}
                                        label="Furigana"
                                        checked={!!songData.furigana}
                                        onChange={(val) =>
                                            handleChange(
                                                "furigana",
                                                val ? 1 : 0,
                                            )
                                        }
                                        color="text-purple-400"
                                    />
                                </div>
                            </div>
                        </CollapsibleSection>
                    </div>

                    {/* --- 修改後的 Versions 入口 --- */}
                    <div className="border-white/10">
                        <button
                            onClick={() => setIsVersionModalOpen(true)}
                            className="w-full flex items-center justify-between p-4 bg-white/5 border border-dashed border-white/20 rounded-xl hover:bg-white/10 hover:border-primary/50 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/20 rounded-lg text-primary">
                                    <Layers size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                                        Manage Song Multi-versions
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {songData.versions?.length || 0}{" "}
                                        versions configured
                                    </div>
                                </div>
                            </div>
                            <Plus
                                size={20}
                                className="text-gray-500 group-hover:text-primary"
                            />
                        </button>
                    </div>
                    <div className="col-span-2">
                        {/* 2. Main Content (垂直收合) */}
                        <CollapsibleSection
                            title="Main Content"
                            isOpen={sections.main}
                            onToggle={() => toggleSection("main")}
                            icon={<Music size={16} />}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest">
                                        <Music size={14} /> Title
                                    </label>
                                    <input
                                        value={songData.title}
                                        onChange={(e) =>
                                            handleChange(
                                                "title",
                                                e.target.value,
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest">
                                        <Music
                                            size={14}
                                            className="opacity-50"
                                        />{" "}
                                        Subtitle
                                    </label>
                                    <input
                                        value={songData.subtitle || ""}
                                        onChange={(e) =>
                                            handleChange(
                                                "subtitle",
                                                e.target.value,
                                            )
                                        }
                                        className={inputClass}
                                    />
                                </div>
                                <MultiSelectArtistField
                                    label="Artist"
                                    icon={<User size={14} />}
                                    selectedIds={parseIds(songData.artist)}
                                    lookup={artistLookup}
                                    onChange={(ids) =>
                                        handleChange("artist", ids.join(","))
                                    }
                                />
                                <MultiSelectArtistField
                                    label="Lyricist"
                                    icon={
                                        <User
                                            size={14}
                                            className="opacity-50"
                                        />
                                    }
                                    selectedIds={parseIds(songData.lyricist)}
                                    lookup={artistLookup}
                                    chipColorClass="bg-blue-400/20 text-blue-400 border-blue-400/30"
                                    onChange={(ids) =>
                                        handleChange("lyricist", ids.join(","))
                                    }
                                />

                                <div>
                                    <label className={labelClass}>
                                        Language Code
                                    </label>
                                    <input
                                        value={songData.lang}
                                        onChange={(e) =>
                                            handleChange("lang", e.target.value)
                                        }
                                        className={`${inputClass} font-mono`}
                                        placeholder="ja / en / zh"
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Folder Path
                                    </label>
                                    <input
                                        value={songData.folder}
                                        onChange={(e) =>
                                            handleChange(
                                                "folder",
                                                e.target.value,
                                            )
                                        }
                                        className={`${inputClass} font-mono text-sm`}
                                    />
                                </div>
                            </div>
                        </CollapsibleSection>
                    </div>
                </div>

                {/* 3. Cover Art (水平收合 - 向左收合，向右展開) */}
                <div className="col-span-2">
                    <HorizontalCollapsibleSection
                        title="Cover Art"
                        icon={<ImageIcon size={16} />}
                        isOpen={sections.cover}
                        onToggle={() => toggleSection("cover")}
                    >
                        <div className="w-[350px] p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                {/* 輸入框 */}
                                <input
                                    value={songData.art}
                                    onChange={(e) =>
                                        handleChange("art", e.target.value)
                                    }
                                    className={`${inputClass} text-xs h-11`}
                                    placeholder="https://..."
                                />

                                {/* 縮圖預覽按鈕 */}
                                {songData.art ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPreviewImage(songData.art)
                                        }
                                        className="relative group shrink-0 focus:outline-none"
                                    >
                                        <img
                                            src={songData.art}
                                            alt="Art"
                                            className="w-11 h-11 rounded-lg object-cover border border-white/20 shadow-lg group-hover:scale-105 group-hover:border-primary/50 transition-all cursor-zoom-in"
                                        />
                                        {/* 懸浮時顯示的小圖示 */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity">
                                            <ImageIcon
                                                size={14}
                                                className="text-white"
                                            />
                                        </div>
                                    </button>
                                ) : (
                                    <div className="w-11 h-11 rounded-lg bg-black/40 border border-dashed border-white/10 flex items-center justify-center text-gray-600 shrink-0">
                                        <ImageIcon size={18} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </HorizontalCollapsibleSection>
                </div>
            </div>

            {/* 在最外層 div 結束前加入 Modal */}
            <SongSelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={(selectedSong) => setSongData(selectedSong)}
            />

            <SongVersionsModal
                isOpen={isVersionModalOpen}
                onClose={() => setIsVersionModalOpen(false)}
                versions={songData.versions || []}
                onUpdate={(newVersions) =>
                    handleChange("versions", newVersions)
                }
            />

            {/* 圖片大圖預覽 Overlay */}
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

// 輔助組件：美化的切換按鈕
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

// --- 抽離出的多選組件 ---
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
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // 點擊外部關閉選單
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
        setIsOpen(false);
    };

    const labelClass =
        "flex items-center gap-2 text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest";
    const inputClass =
        "w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-medium flex flex-wrap gap-2 min-h-[46px] items-center";

    return (
        <div className="relative" ref={dropdownRef}>
            <label className={labelClass}>
                {icon} {label}
            </label>
            <div className={inputClass}>
                {selectedIds.length === 0 && (
                    <span className="text-gray-500 text-sm">{placeholder}</span>
                )}
                {selectedIds.map((id) => (
                    <div
                        key={id}
                        className={`flex items-center gap-1.5 text-sm font-bold px-2 py-1 rounded-md border ${chipColorClass}`}
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
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="ml-auto text-gray-400 hover:text-white transition-colors"
                >
                    <Plus size={20} />
                </button>
            </div>

            {isOpen && (
                <div className="absolute mt-2 w-full max-h-60 overflow-y-auto bg-[#2d3748] border border-white/10 rounded-xl shadow-2xl custom-scrollbar z-53">
                    {Object.entries(lookup)
                        .filter(([id]) => !selectedIds.includes(Number(id)))
                        .map(([id, name]) => (
                            <button
                                key={id}
                                onClick={() => toggleId(Number(id))}
                                className="w-full text-left px-4 py-3 text-sm text-gray-200 hover:bg-primary/20 hover:text-primary transition-all border-b border-white/5 last:border-0"
                            >
                                {name}{" "}
                                <span className="ml-2 text-xs opacity-50 font-mono">
                                    {id}
                                </span>
                            </button>
                        ))}
                    {Object.keys(lookup).length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500 italic">
                            Loading...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// 1. 垂直收合元件 (已統一)
const CollapsibleSection: React.FC<{
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    icon?: React.ReactNode;
    children: React.ReactNode;
}> = ({ title, isOpen, onToggle, icon, children }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl transition-all duration-300">
        <button
            onClick={onToggle}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5"
        >
            <div className="flex items-center gap-3">
                <span className="text-primary opacity-70">{icon}</span>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-300">
                    {title}
                </span>
            </div>
            <div
                className={`text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            >
                <ChevronDown size={18} />
            </div>
        </button>

        <div
            className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
            <div className="overflow-hidden">
                <div className="p-6">{children}</div>
            </div>
        </div>
    </div>
);

// 2. 水平收合元件 (調整為與上方一致的 Header 風格)
const HorizontalCollapsibleSection: React.FC<{
    title: string; // 新增標題屬性以求統一
    isOpen: boolean;
    onToggle: () => void;
    icon?: React.ReactNode;
    children: React.ReactNode;
}> = ({ title, isOpen, onToggle, icon, children }) => (
    <div className="flex items-start shrink-0 h-full relative">
        {/* 切換按鈕：位置稍微優化 */}
        <button
            onClick={onToggle}
            className={`
                absolute -left-4 top-12 z-20
                w-8 h-8 bg-[#2d3748] border border-white/10 rounded-full 
                flex items-center justify-center text-primary backdrop-blur-md
                hover:border-primary/50 hover:text-white transition-all duration-300
                shadow-xl
                ${isOpen ? "rotate-0" : "rotate-180"}
            `}
        >
            <ChevronRight size={18} />
        </button>

        <div
            className={`grid transition-all duration-500 ease-in-out ${isOpen ? "grid-cols-2 opacity-100" : "grid-cols-[0fr] opacity-0"}`}
        >
            <div className="overflow-hidden h-full">
                <div className="w-[350px] ml-4 bg-white/5 border border-white/10 rounded-2xl shadow-xl h-full flex flex-col">
                    {/* 新增的一致化 Header */}
                    <div className="px-5 py-4 flex items-center gap-3 border-b border-white/5">
                        <span className="text-primary opacity-70">{icon}</span>
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-300">
                            {title}
                        </span>
                    </div>
                    {/* 內容區 */}
                    <div className="flex-1">{children}</div>
                </div>
            </div>
        </div>
    </div>
);
