import React, { useState, useEffect, useCallback } from "react";
import { Search, X, Plus, User } from "lucide-react";
import { CreateArtistForm } from "./CreateArtistForm";

export const inputClassArtist =
    "w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors";

// ── Main Modal ────────────────────────────────────────────────────────────────
export const ArtistSelectModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    selectedIds: number[];
    lookup: Record<number, string>;
    chipColorClass?: string;
    onChange: (newIds: number[]) => void;
    onArtistCreated: (artistId: number, name: string) => void;
    isLoggedIn?: boolean;
    label: string;
}> = ({
    isOpen,
    onClose,
    selectedIds,
    lookup,
    chipColorClass = "bg-primary/20 text-primary border-primary/30",
    onChange,
    onArtistCreated,
    isLoggedIn = false,
    label,
}) => {
    const [search, setSearch] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // 每次打開重置搜尋和建立表單狀態
    useEffect(() => {
        if (isOpen) {
            setSearch("");
            setIsCreating(false);
        }
    }, [isOpen]);

    const toggleId = useCallback(
        (id: number) => {
            if (selectedIds.includes(id)) {
                onChange(selectedIds.filter((i) => i !== id));
            } else {
                onChange([...selectedIds, id]);
            }
        },
        [selectedIds, onChange],
    );

    if (!isOpen) return null;

    const allArtists = Object.entries(lookup).map(([id, name]) => ({
        id: Number(id),
        name,
    }));

    const filtered = allArtists.filter(({ id, name }) => {
        const term = search.toLowerCase();
        return name.toLowerCase().includes(term) || String(id).includes(term);
    });

    // 已選的排最前面，其餘照搜尋結果
    const selectedSet = new Set(selectedIds);
    const sorted = [
        ...filtered.filter((a) => selectedSet.has(a.id)),
        ...filtered.filter((a) => !selectedSet.has(a.id)),
    ];

    const handleCreated = (artistId: number, name: string) => {
        onArtistCreated(artistId, name);
        // 自動選取剛建立的藝人
        onChange([...selectedIds, artistId]);
        setIsCreating(false);
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a202c] border border-white/10 w-full max-w-lg h-[70vh] rounded-2xl flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <User size={18} className="text-primary" />
                        Select {label}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Selected chips */}
                {selectedIds.length > 0 && (
                    <div className="px-4 pt-3 pb-1 flex flex-wrap gap-2 shrink-0">
                        {selectedIds.map((id) => (
                            <div
                                key={id}
                                className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border ${chipColorClass}`}
                            >
                                {lookup[id] || `ID: ${id}`}
                                <button
                                    onClick={() => toggleId(id)}
                                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Search */}
                <div className="px-4 py-3 shrink-0">
                    <div className="relative">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                        />
                        <input
                            autoFocus
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                            placeholder="Search by name or ID..."
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto px-4 pb-2 custom-scrollbar space-y-1">
                    {sorted.length === 0 ? (
                        <div className="py-10 text-center text-gray-500 text-sm italic">
                            No artists found.
                        </div>
                    ) : (
                        sorted.map(({ id, name }) => {
                            const isSelected = selectedSet.has(id);
                            return (
                                <button
                                    key={id}
                                    onClick={() => toggleId(id)}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all text-left ${
                                        isSelected
                                            ? "bg-primary/10 border-primary/30 text-primary"
                                            : "bg-white/3 border-white/5 hover:bg-white/8 hover:border-white/15 text-white"
                                    }`}
                                >
                                    <span className="font-semibold text-sm">
                                        {name}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-xs opacity-40">
                                            #{id}
                                        </span>
                                        {isSelected && (
                                            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                                                <X
                                                    size={9}
                                                    className="text-black"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Footer: New Artist */}
                {isLoggedIn &&
                    (isCreating ? (
                        <CreateArtistForm
                            onCreated={handleCreated}
                            onCancel={() => setIsCreating(false)}
                        />
                    ) : (
                        <div className="shrink-0 border-t border-white/10 p-3">
                            <button
                                onClick={() => setIsCreating(true)}
                                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-white/15 text-gray-500 hover:text-primary hover:border-primary/30 transition-all text-sm"
                            >
                                <Plus size={14} /> New Artist
                            </button>
                        </div>
                    ))}
            </div>
        </div>
    );
};
