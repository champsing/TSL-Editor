// EditActions.tsx

import React from "react";
import { CheckCircle, Undo2, GitCompare } from "lucide-react";

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
    /* --- 3. Actions: Commit, Discard, Diff --- */
    <div className="flex items-center gap-3">
        {/* Diff Button */}
        <button
            onClick={onViewDiff}
            className={`cursor-pointer px-4 py-2 rounded-md flex items-center gap-2 text-sm transition font-semibold ${
                hasUncommittedChanges
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                    : "bg-gray-700 text-gray-400"
            }`}
        >
            <GitCompare size={16} />
            Diff
            <span
                className={`w-3 h-3 rounded-full ml-1 ${
                    hasUncommittedChanges
                        ? "bg-red-400 animate-pulse"
                        : "bg-green-400"
                }`}
                title={
                    hasUncommittedChanges
                        ? "Uncommitted Changes (未提交變更)"
                        : "Committed (已提交)"
                }
            ></span>
        </button>

        {/* Discard Button */}
        <button
            onClick={discardChanges}
            disabled={!hasUncommittedChanges}
            className={` px-4 py-2 rounded-md flex items-center gap-2 text-sm transition font-semibold ${
                hasUncommittedChanges
                    ? " cursor-pointer bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20"
                    : "cursor-not-allowed bg-gray-700 text-gray-400 opacity-50 "
            }`}
        >
            <Undo2 size={16} />
            Discard
        </button>

        {/* Commit Button */}
        <button
            onClick={commitLyrics}
            disabled={!hasUncommittedChanges}
            className={` px-4 py-2 rounded-md flex items-center gap-2 text-sm transition font-semibold ${
                hasUncommittedChanges
                    ? "cursor-pointer bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20"
                    : "cursor-not-allowed bg-gray-700 text-gray-400 opacity-50 "
            }`}
        >
            <CheckCircle size={16} />
            Commit
        </button>
    </div>
);