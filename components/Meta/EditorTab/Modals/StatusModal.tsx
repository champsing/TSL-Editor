import React from "react";
import { Song } from "@composables/types";
import { CheckCircle2, Users, Languages } from "lucide-react";
import { ToggleItem } from "../ToggleItem";

// ── Status ─────────────────────────────────────────────────────────────────
export const StatusModal: React.FC<{
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
