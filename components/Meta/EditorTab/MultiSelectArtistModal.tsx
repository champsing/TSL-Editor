import { useState } from "react";
import { labelClassEditor } from "../EditorTab";
import { ArtistSelectModal } from "../ArtistSelection/ArtistSelectModal";
import { Plus, X } from "lucide-react";

export const MultiSelectArtistModal: React.FC<{
    label: string;
    icon: React.ReactNode;
    selectedIds: number[];
    lookup: Record<number, string>;
    onChange: (newIds: number[]) => void;
    onArtistCreated: (artistId: number, name: string) => void;
    isLoggedIn?: boolean;
    placeholder?: string;
    chipColorClass?: string;
}> = ({
    label,
    icon,
    selectedIds,
    lookup,
    onChange,
    onArtistCreated,
    isLoggedIn = false,
    placeholder = "Select...",
    chipColorClass = "bg-primary/20 text-primary border-primary/30",
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const multiInputClass =
        "w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-medium flex flex-wrap gap-2 min-h-[46px] items-center cursor-pointer hover:border-white/20";

    return (
        <>
            <div>
                <label className={labelClassEditor}>
                    {icon} {label}
                </label>
                <div
                    className={multiInputClass}
                    onClick={() => setIsModalOpen(true)}
                >
                    {selectedIds.length === 0 && (
                        <span className="text-gray-500 text-sm">
                            {placeholder}
                        </span>
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
                                    onChange(
                                        selectedIds.filter((i) => i !== id),
                                    );
                                }}
                                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    <div className="ml-auto text-gray-400">
                        <Plus size={18} />
                    </div>
                </div>
            </div>

            <ArtistSelectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedIds={selectedIds}
                lookup={lookup}
                chipColorClass={chipColorClass}
                onChange={onChange}
                onArtistCreated={onArtistCreated}
                isLoggedIn={isLoggedIn}
                label={label}
            />
        </>
    );
};
