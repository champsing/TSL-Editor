import { Album, Song } from "@composables/types";
import { Disc3, Link, XCircle } from "lucide-react";
import React, { useState } from "react";
import { inputClassEditor, labelClassEditor } from "../../EditorTab";
import { ToggleItem } from "../ToggleItem";

// ── Album ──────────────────────────────────────────────────────────────────
export const AlbumModal: React.FC<{
    songData: Song;
    onChange: (field: keyof Song, value: any) => void;
}> = ({ songData, onChange }) => {
    const album = songData.album;

    const [isEnabled, setIsEnabled] = useState<boolean>(
        songData.album !== null,
    );

    const handleToggle = (val: boolean) => {
        setIsEnabled(val);
        onChange("album", val ? (album ?? { name: "", link: "" }) : null);
    };

    const handleFieldChange = (field: keyof Album, value: string) => {
        onChange("album", {
            ...(album ?? { name: "", link: "" }),
            [field]: value,
        });
    };

    return (
        <div className="space-y-4">
            {/* ── "used" toggle ──────────────────────────────────────── */}
            <div className="bg-black/20 border border-white/10 rounded-2xl p-4">
                <ToggleItem
                    icon={<XCircle size={18} />}
                    label="Use Album (set to null if disabled)"
                    checked={isEnabled}
                    onChange={handleToggle}
                    color="text-orange-400"
                />
            </div>

            {/* ── Fields — hidden when disabled ─────────────────────────── */}
            {isEnabled && (
                <div className="space-y-4">
                    <div>
                        <label className={labelClassEditor}>
                            <Disc3 size={14} /> Album Name
                        </label>
                        <input
                            value={album?.name ?? ""}
                            onChange={(e) =>
                                handleFieldChange("name", e.target.value)
                            }
                            className={inputClassEditor}
                            placeholder="e.g. 永遠市"
                        />
                    </div>

                    <div>
                        <label className={labelClassEditor}>
                            <Link size={14} /> Google Music Share Code
                        </label>
                        <input
                            value={album?.link ?? ""}
                            onChange={(e) =>
                                handleFieldChange("link", e.target.value)
                            }
                            className={inputClassEditor}
                            placeholder="e.g. cCJ7CCq"
                        />
                        <p className="mt-1.5 text-[11px] text-gray-600">
                            短代碼取自 Google 搜尋知識面板的分享連結，非完整
                            URL。
                        </p>
                    </div>

                    {/* Preview */}
                    {album?.link && (
                        <a
                            href={`https://share.google/${album.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-xs text-primary/70 hover:text-primary transition-colors"
                        >
                            <Link size={12} />
                            Open via Google Search ↗
                        </a>
                    )}
                </div>
            )}

            {!isEnabled && (
                <p className="text-xs text-gray-600 text-center py-1">
                    Album field will be stored as{" "}
                    <span className="font-mono text-gray-500">null</span>.
                </p>
            )}
        </div>
    );
};
