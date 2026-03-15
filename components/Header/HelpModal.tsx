import { SongMetaEditorModal } from "@/components/Meta/EditorModal";
import {
    ArrowUpDown,
    CheckCheck,
    ChevronDown,
    Clock,
    Eye,
    FileJson2,
    GitCompare,
    HelpCircle,
    MoveRight,
    Undo2,
} from "lucide-react";
import React, { useState } from "react";

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// ── Section heading (collapsible) ─────────────────────────────────────────────
const Section: React.FC<{
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}> = ({ title, defaultOpen = true, children }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="space-y-2">
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between gap-2 group"
            >
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 group-hover:text-gray-300 transition-colors">
                    {title}
                </p>
                <ChevronDown
                    size={13}
                    className={`text-gray-600 group-hover:text-gray-400 transition-all duration-200 ${open ? "rotate-0" : "-rotate-90"}`}
                />
            </button>
            {open && <div className="space-y-2">{children}</div>}
        </div>
    );
};

// ── Single shortcut / action row ───────────────────────────────────────────────
const Row: React.FC<{
    icon: React.ReactNode;
    iconColor?: string;
    label: string;
    desc: string;
}> = ({ icon, iconColor = "text-gray-300", label, desc }) => (
    <div className="flex items-start gap-3 py-2 px-3 rounded-xl bg-white/3 border border-white/5 hover:bg-white/6 transition-colors">
        <span
            className={`mt-0.5 flex items-center justify-center w-7 h-7 rounded-lg bg-black/40 border border-white/10 shrink-0 ${iconColor}`}
        >
            {icon}
        </span>
        <div className="min-w-0">
            <p className="text-sm font-semibold text-white leading-tight">
                {label}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                {desc}
            </p>
        </div>
    </div>
);

// ── Main ───────────────────────────────────────────────────────────────────────
export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => (
    <SongMetaEditorModal
        isOpen={isOpen}
        onClose={onClose}
        title="Shortcuts & Tips"
        icon={<HelpCircle size={20} />}
        accentColor="#94a3b8"
        maxWidthClass="max-w-xl"
        footer="時間格式為 MM:SS.mm。影片暫停時才能新增行。"
    >
        <div className="space-y-6">
            {/* ── 歌詞編輯按鈕 ─────────────────────────────────────── */}
            <Section title="歌詞編輯按鈕">
                <Row
                    icon={<MoveRight size={14} />}
                    label="Seek"
                    desc="將影片跳轉到該行的起始時間。"
                />
                <Row
                    icon={<Clock size={14} />}
                    label="Stamp"
                    desc="將該行起始時間設置為影片當前時間。需先暫停影片。"
                />
                <Row
                    icon={<ArrowUpDown size={14} />}
                    iconColor="text-primary"
                    label="Reorder Lines"
                    desc="拖曳或以 Shift ↑↓ 鍵調整行順序。套用時時間衝突會自動修正。"
                />
                <Row
                    icon={<Eye size={14} />}
                    iconColor="text-purple-400"
                    label="Preview"
                    desc="以播放器視角預覽目前的歌詞渲染效果。"
                />
            </Section>

            {/* ── 編輯後可使用 ─────────────────────────────────────────── */}
            <Section title="提交工具列">
                <Row
                    icon={<GitCompare size={14} />}
                    iconColor="text-blue-400"
                    label="Diff"
                    desc="比對 Committed 與 Uncommitted 版本的 JSON 差異。"
                />
                <Row
                    icon={<CheckCheck size={14} />}
                    iconColor="text-green-400"
                    label="Commit"
                    desc="將目前的編輯結果提交為新的基準版本。"
                />
                <Row
                    icon={<Undo2 size={14} />}
                    iconColor="text-red-400"
                    label="Discard"
                    desc="捨棄所有未提交的變更，還原到上次 Commit 的狀態。"
                />
                <Row
                    icon={<FileJson2 size={14} />}
                    iconColor="text-yellow-400"
                    label="View JSON"
                    desc="檢視或匯入原始 JSON 資料，也可下載備份。"
                />
            </Section>
        </div>
    </SongMetaEditorModal>
);
