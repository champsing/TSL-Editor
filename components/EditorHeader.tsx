import React from "react";
import { CheckCircle, Music2, Undo2, GitCompare } from "lucide-react";
import { VERSION_NUMBER } from "../utils";
import { EditActions } from "./EditActions";

interface EditorHeaderProps {
    tempVideoId: string;
    setTempVideoId: (id: string) => void;
    onVideoLoad: () => void;
    hasUncommittedChanges: boolean;
    commitLyrics: () => void;
    discardChanges: () => void;
    onViewDiff: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
    tempVideoId,
    setTempVideoId,
    onVideoLoad,
    hasUncommittedChanges,
    commitLyrics,
    discardChanges,
    onViewDiff,
}) => (
    <header className="bg-dark shadow-lg z-20 px-6 py-3 flex items-center justify-between border-b border-gray-800">
        {/* --- 1. Logo --- */}
        <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
                <Music2 className="text-dark" size={24} />
            </div>
            <h1 className="text-2xl font-playfair font-bold text-white">
                <span className="text-primary">TSL</span>Editor
            </h1>
            <sup className="text-gray-400 ">Ver {VERSION_NUMBER}</sup>
        </div>

        {/* --- 2. YouTube ID Input --- */}
        <div className="flex items-center gap-4 bg-panel p-1.5 rounded-lg border border-gray-700">
            <span className="pl-2 text-xs text-gray-400 font-bold tracking-wide">
                YOUTUBE ID
            </span>
            <input
                type="text"
                value={tempVideoId}
                onChange={(e) => setTempVideoId(e.target.value)}
                placeholder="Enter YouTube ID"
                className="bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm w-48 focus:ring-2 focus:ring-primary focus:border-primary border border-transparent outline-none transition"
            />
            <button
                onClick={onVideoLoad}
                className="cursor-pointer bg-primary hover:bg-teal-300 text-dark px-4 py-1.5 rounded-md font-semibold transition text-sm"
            >
                LOAD
            </button>
        </div>

        {/* --- 3. Actions: Commit, Discard, Diff --- */}
        <EditActions
            hasUncommittedChanges={hasUncommittedChanges}
            commitLyrics={commitLyrics}
            discardChanges={discardChanges}
            onViewDiff={onViewDiff}
        />
    </header>
);
