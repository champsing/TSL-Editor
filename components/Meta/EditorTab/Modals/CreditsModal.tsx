import { Contributor, Credits, Song } from "@composables/types";
import { Mic2, Music2, Plus, Settings2, Trash2, X } from "lucide-react";
import React, { useState } from "react";
import { inputClassEditor, labelClassEditor } from "../../EditorTab";

// ── Tab definitions ───────────────────────────────────────────────────────────
type CreditsTab = "performance" | "song_writing" | "engineering";

const TABS: {
    key: CreditsTab;
    label: string;
    icon: React.ReactNode;
    color: string;
}[] = [
    {
        key: "performance",
        label: "表演者",
        icon: <Mic2 size={14} />,
        color: "text-pink-400 border-pink-400",
    },
    {
        key: "song_writing",
        label: "詞曲創作",
        icon: <Music2 size={14} />,
        color: "text-violet-400 border-violet-400",
    },
    {
        key: "engineering",
        label: "工程團隊",
        icon: <Settings2 size={14} />,
        color: "text-sky-400 border-sky-400",
    },
];

// ── ContributorCard ───────────────────────────────────────────────────────────
const ContributorCard: React.FC<{
    contributor: Contributor;
    index: number;
    accentColor: string; // Tailwind border/text class for chip
    onChange: (updated: Contributor) => void;
    onDelete: () => void;
}> = ({ contributor, index, accentColor, onChange, onDelete }) => {
    const [newTag, setNewTag] = useState("");

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...contributor, name: e.target.value });
    };

    const addContribution = () => {
        const trimmed = newTag.trim();
        if (!trimmed) return;
        if (contributor.contribution.includes(trimmed)) {
            setNewTag("");
            return;
        }
        onChange({
            ...contributor,
            contribution: [...contributor.contribution, trimmed],
        });
        setNewTag("");
    };

    const removeContribution = (tag: string) => {
        onChange({
            ...contributor,
            contribution: contributor.contribution.filter((c) => c !== tag),
        });
    };

    return (
        <div className="bg-black/30 border border-white/10 rounded-2xl p-4 space-y-3">
            {/* Header row */}
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-widest w-5 text-center">
                    {index + 1}
                </span>
                <input
                    value={contributor.name}
                    onChange={handleNameChange}
                    className={`${inputClassEditor} flex-1`}
                    placeholder="貢獻者名稱"
                />
                <button
                    onClick={onDelete}
                    className="shrink-0 p-2 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="刪除"
                >
                    <Trash2 size={15} />
                </button>
            </div>

            {/* Contribution tags */}
            <div className="space-y-2 pl-7">
                <label className={labelClassEditor}>貢獻標籤</label>
                <div className="flex flex-wrap gap-2">
                    {contributor.contribution.map((tag) => (
                        <span
                            key={tag}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-black/40 ${accentColor}`}
                        >
                            {tag}
                            <button
                                onClick={() => removeContribution(tag)}
                                className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
                            >
                                <X size={11} />
                            </button>
                        </span>
                    ))}
                </div>

                {/* Add tag row */}
                <div className="flex gap-2">
                    <input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                addContribution();
                            }
                        }}
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
                        placeholder="輸入貢獻後按 Enter 或 +"
                    />
                    <button
                        onClick={addContribution}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── CreditsModal ──────────────────────────────────────────────────────────────
export const CreditsModal: React.FC<{
    songData: Song;
    onChange: (field: keyof Song, value: any) => void;
}> = ({ songData, onChange }) => {
    const [activeTab, setActiveTab] = useState<CreditsTab>("performance");

    // 修改這裡：針對每一個分類獨立進行 null 檢查，確保預設值一定是陣列
    const credits: Credits = {
        performance: songData.credits?.performance ?? [],
        song_writing: songData.credits?.song_writing ?? [],
        engineering: songData.credits?.engineering ?? [],
    };

    const updateSection = (section: CreditsTab, list: Contributor[]) => {
        onChange("credits", { ...credits, [section]: list });
    };

    const addContributor = () => {
        const list = credits[activeTab];
        // 現在 list 保證會是陣列，展開 [...list] 就不會報錯了
        updateSection(activeTab, [...list, { name: "", contribution: [] }]);
    };

    const updateContributor = (index: number, updated: Contributor) => {
        const list = [...credits[activeTab]];
        list[index] = updated;
        updateSection(activeTab, list);
    };

    const deleteContributor = (index: number) => {
        const list = credits[activeTab].filter((_, i) => i !== index);
        updateSection(activeTab, list);
    };

    // 因為上面已經保證了預設值，這裡也不需要再寫 ?? [] 了
    const currentList = credits[activeTab]; 
    const currentTabDef = TABS.find((t) => t.key === activeTab)!;

    return (
        <div className="space-y-4">
            {/* ── Tab strip ─────────────────────────────────────────────── */}
            <div className="flex gap-1 bg-black/30 border border-white/8 rounded-xl p-1">
                {TABS.map((tab) => {
                    const isActive = tab.key === activeTab;
                    const count = (credits[tab.key] ?? []).length;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all duration-200 ${
                                isActive
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                            }`}
                        >
                            <span
                                className={
                                    isActive ? tab.color.split(" ")[0] : ""
                                }
                            >
                                {tab.icon}
                            </span>
                            <span className="hidden sm:inline">
                                {tab.label}
                            </span>
                            {count > 0 && (
                                <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-black leading-none ${
                                        isActive
                                            ? `${tab.color.split(" ")[0]} bg-current/10`
                                            : "bg-white/10 text-gray-500"
                                    }`}
                                    style={
                                        isActive
                                            ? {
                                                  backgroundColor:
                                                      "rgba(255,255,255,0.08)",
                                              }
                                            : undefined
                                    }
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ── Contributor list ──────────────────────────────────────── */}
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-0.5">
                {currentList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-600 gap-2">
                        <span className={currentTabDef.color.split(" ")[0]}>
                            {currentTabDef.icon}
                        </span>
                        <p className="text-xs">尚無{currentTabDef.label}成員</p>
                    </div>
                ) : (
                    currentList.map((contributor, i) => (
                        <ContributorCard
                            key={i}
                            contributor={contributor}
                            index={i}
                            accentColor={currentTabDef.color}
                            onChange={(updated) =>
                                updateContributor(i, updated)
                            }
                            onDelete={() => deleteContributor(i)}
                        />
                    ))
                )}
            </div>

            {/* ── Add button ────────────────────────────────────────────── */}
            <button
                onClick={addContributor}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-white/15 rounded-xl text-xs font-bold text-gray-500 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all uppercase tracking-widest"
            >
                <Plus size={14} />
                新增{currentTabDef.label}成員
            </button>
        </div>
    );
};
