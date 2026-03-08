import React from "react";
import { Check, RotateCcw, GitCompare, AlertCircle } from "lucide-react";

interface EditActionsProps {
    hasUncommittedChanges: boolean;
    commitLyrics: () => void;
    discardChanges: () => void;
    onViewDiff: () => void;
}

export const EditActions: React.FC<EditActionsProps> = ({
    hasUncommittedChanges,
    commitLyrics,
    discardChanges,
    onViewDiff,
}) => (
    <div className="flex items-center gap-2">
        {/* 整合後的 Diff 狀態按鈕 */}
        <button
            onClick={onViewDiff}
            disabled={!hasUncommittedChanges}
            className={`group relative flex items-center gap-2.5 px-4 py-1.5 border transition-all duration-300 active:scale-95relative z-10 inset-0 rounded-md
                ${
                    hasUncommittedChanges
                        ? "text-amber-400 animate-pulse bg-amber-400/20 hover:bg-orange-500/10 hover:border-orange-500/50"
                        : " text-gray-700 bg-emerald-500/20 border border-emerald-500/30 cursor-not-allowed"
                }`}
            title={
                hasUncommittedChanges ? "View Changes" : "No changes detected"
            }
        >
            <GitCompare
                size={16}
                className={`transition-transform duration-300 ${hasUncommittedChanges ? "opacity-100 group-hover:rotate-12" : "opacity-30"}`}
            />

            <span className="text-sm font-semibold tracking-wide">Diff</span>
        </button>

        {/* Discard Button */}
        <button
            onClick={discardChanges}
            disabled={!hasUncommittedChanges}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all active:scale-95
                ${
                    hasUncommittedChanges
                        ? "text-red-400 hover:bg-red-500/10"
                        : "text-gray-700 cursor-not-allowed opacity-80"
                }`}
        >
            <RotateCcw size={16} />
            <span>Discard</span>
        </button>

        {/* Commit Button - 主要行動按鈕 */}
        <button
            onClick={commitLyrics}
            disabled={!hasUncommittedChanges}
            className={`flex items-center gap-2 px-5 py-1.5 rounded-md text-sm font-bold shadow-sm transition-all"
                ${
                    hasUncommittedChanges
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20active:scale-95"
                        : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                }`}
        >
            <Check size={18} strokeWidth={3} />
            <span>Commit</span>
        </button>
    </div>
);
