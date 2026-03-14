import React from "react";
import { Song } from "@composables/types";
import { Link } from "lucide-react";
import { inputClassEditor, labelClassEditor } from "../../EditorTab";

// ── Cover Art ──────────────────────────────────────────────────────────────
export const CoverArtModal: React.FC<{
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
