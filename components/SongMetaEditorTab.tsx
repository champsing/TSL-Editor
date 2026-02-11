// components/SongMetaEditorTab.tsx
import React from "react";
import { Song } from "../types";
import {
    Music,
    User,
    Globe,
    Image as ImageIcon,
    CheckCircle2,
    Users,
    Languages,
    Calendar,
    Hash,
    Plus,
    Link as LinkIcon,
    Layers,
} from "lucide-react";
import { SongSelectionModal } from "./SongSelectionModal"; // 新增歌曲選擇 Modal 組件
import { SongVersionsModal } from "./SongVersionsModal";

interface Props {
    songData: Song;
    setSongData: (data: Song) => void;
}

export const SongMetaEditorTab: React.FC<Props> = ({
    songData,
    setSongData,
}) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false); // 新增狀態
    const [isVersionModalOpen, setIsVersionModalOpen] = React.useState(false); // 控制版本 Modal
    const [previewImage, setPreviewImage] = React.useState<string | null>(null);

    const handleChange = (field: keyof Song, value: any) => {
        setSongData({ ...songData, [field]: value });
    };

    // 延續 LineEditor 的設計風格
    const inputClass =
        "w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-medium";
    const labelClass =
        "flex items-center gap-2 text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest";
    const sectionClass =
        "bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl backdrop-blur-sm";

    return (
        <div className="flex-1 bg-[#1a202c] overflow-y-auto p-8 custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div>
                        <h2 className="text-3xl font-black text-white flex items-center gap-3">
                            <Music className="text-primary" size={32} />
                            Song Metadata
                        </h2>
                        <p className="text-gray-400 mt-1">
                            Configure core information and display settings.
                        </p>
                    </div>
                    {/* 修改後的 ID 按鈕 */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full hover:bg-primary/20 hover:scale-105 active:scale-95 transition-all group"
                    >
                        <Hash size={16} className="text-primary" />
                        <span className="font-mono text-primary font-bold">
                            {songData.song_id || "SELECT SONG"}
                        </span>
                        <div className="ml-1 pl-2 border-l border-primary/30 text-[10px] text-primary/60 font-black uppercase tracking-tighter group-hover:text-primary">
                            Change
                        </div>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Basic Info */}
                    <div className={`${sectionClass} lg:col-span-3 space-y-6`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className={labelClass}>
                                    <Music size={14} /> Title
                                </label>
                                <input
                                    value={songData.title}
                                    onChange={(e) =>
                                        handleChange("title", e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="Song title"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>
                                    <Music size={14} className="opacity-50" />{" "}
                                    Subtitle
                                </label>
                                <input
                                    value={songData.subtitle || ""}
                                    onChange={(e) =>
                                        handleChange("subtitle", e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="Live version / Remix..."
                                />
                            </div>
                            <div>
                                <label className={labelClass}>
                                    <User size={14} /> Artist
                                </label>
                                <input
                                    value={songData.artist}
                                    onChange={(e) =>
                                        handleChange("artist", e.target.value)
                                    }
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>
                                    <User size={14} className="opacity-50" />{" "}
                                    Lyricist
                                </label>
                                <input
                                    value={songData.lyricist}
                                    onChange={(e) =>
                                        handleChange("lyricist", e.target.value)
                                    }
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <label className={labelClass}>
                                <ImageIcon size={14} /> Cover Art URL
                            </label>
                            <div className="flex gap-4">
                                <input
                                    value={songData.art}
                                    onChange={(e) =>
                                        handleChange("art", e.target.value)
                                    }
                                    className={inputClass}
                                    placeholder="https://..."
                                />
                                {songData.art && (
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
                                        {/* 懸浮提示 */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity">
                                            <Hash
                                                size={12}
                                                className="text-white"
                                            />
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: System & Status */}
                    <div className="space-y-6">
                        <div className={sectionClass}>
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <Globe size={16} className="text-primary" />
                                System Settings
                            </h3>
                            <div className="space-y-4">
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
                        </div>
                    </div>
                    {/* Toggle Switches */}
                    <div className="bg-black/20 border border-white/10 rounded-2xl p-4 space-y-2">
                        <ToggleItem
                            icon={<CheckCircle2 size={18} />}
                            label="Available"
                            checked={!!songData.available}
                            onChange={(val) =>
                                handleChange("available", val ? 1 : 0)
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
                                handleChange("furigana", val ? 1 : 0)
                            }
                            color="text-purple-400"
                        />
                    </div>

                    {/* --- 修改後的 Versions 入口 --- */}
                    <div className="pt-4 border-t border-white/10">
                        <label className={labelClass}>
                            <LinkIcon size={14} /> Song Versions
                        </label>
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
                                        Manage Multi-versions
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
                </div>

                {/* Footer: Date Editor & Meta */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl">
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

                    <div className="text-xs font-mono text-gray-500">
                        System Status:{" "}
                        <span className="text-green-500">Synced</span>
                    </div>
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
