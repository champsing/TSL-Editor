import { Song, Translation } from "@composables/types";
import { BookOpen, CheckCircle2, GitBranch, Link, User } from "lucide-react";
import React from "react";
import { inputClassEditor, labelClassEditor } from "../../EditorTab";
import { ToggleItem } from "../ToggleItem";

// ── Translation ────────────────────────────────────────────────────────────
export const TranslationModal: React.FC<{
    songData: Song;
    onChange: (field: keyof Song, value: any) => void;
}> = ({ songData, onChange }) => {
    const translation = songData.translation ?? {
        available: false,
        author: "",
        cite: "",
        modified: false,
    };

    const handleFieldChange = <K extends keyof Translation>(
        field: K,
        value: Translation[K],
    ) => {
        onChange("translation", { ...translation, [field]: value });
    };

    return (
        <div className="space-y-4">
            {/* ── Boolean toggles ────────────────────────────────────────── */}
            <div className="bg-black/20 border border-white/10 rounded-2xl p-4 space-y-2">
                <ToggleItem
                    icon={<CheckCircle2 size={18} />}
                    label="Translation Available"
                    checked={!!translation.available}
                    onChange={(val) => handleFieldChange("available", val)}
                    color="text-green-400"
                />
                <ToggleItem
                    icon={<GitBranch size={18} />}
                    label="Modified from Source"
                    checked={!!translation.modified}
                    onChange={(val) => handleFieldChange("modified", val)}
                    color="text-yellow-400"
                />
            </div>

            {/* ── Text fields — always shown ─────────────────────────────── */}
            <div className="space-y-4">
                <div>
                    <label className={labelClassEditor}>
                        <User size={14} /> Author
                    </label>
                    <input
                        value={translation.author ?? ""}
                        onChange={(e) =>
                            handleFieldChange("author", e.target.value)
                        }
                        className={inputClassEditor}
                        placeholder="e.g. Alice／箱庭博物館"
                    />
                </div>

                <div>
                    <label className={labelClassEditor}>
                        <Link size={14} /> Source URL (cite)
                    </label>
                    <input
                        value={translation.cite ?? ""}
                        onChange={(e) =>
                            handleFieldChange("cite", e.target.value)
                        }
                        className={inputClassEditor}
                        placeholder="https://..."
                    />
                    {translation.cite && (
                        <a
                            href={translation.cite}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-1.5 text-[11px] text-primary/70 hover:text-primary transition-colors"
                        >
                            <BookOpen size={11} />
                            Open source ↗
                        </a>
                    )}
                </div>
            </div>

            {/* ── Status hint ───────────────────────────────────────────── */}
            {!translation.available && (
                <p className="text-xs text-gray-600 text-center py-0.5">
                    Translation is currently{" "}
                    <span className="font-mono text-gray-500">disabled</span> —
                    other fields are still stored.
                </p>
            )}
        </div>
    );
};
