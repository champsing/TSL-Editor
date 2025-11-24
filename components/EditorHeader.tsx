import React from "react";
import { CheckCircle, Music2, Undo2 } from "lucide-react";
import { VERSION_NUMBER } from "@/utils";

interface EditorHeaderProps {
    tempVideoId: string;
    setTempVideoId: (id: string) => void;
    onVideoLoad: () => void;
    hasUncommittedChanges: boolean;
    commitLyrics: () => void;
    discardChanges: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
    tempVideoId,
    setTempVideoId,
    onVideoLoad,
    hasUncommittedChanges,
    commitLyrics,
    discardChanges,
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
            <sup class="text-gray-400 ">Ver {VERSION_NUMBER}</sup>
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
                className="bg-transparent outline-none text-white w-32 text-sm font-mono"
                placeholder="Video ID"
            />
            <button
                onClick={onVideoLoad}
                className="bg-primary text-dark px-3 py-1 rounded text-xs font-bold hover:bg-teal-300 transition"
            >
                LOAD
            </button>
        </div>

        {/* --- 3. Actions (Commit/Discard) --- */}
        <div className="flex gap-2">
            <div className="flex items-center gap-3">
                {/* Commit Button & Status Indicator */}
                <button
                    onClick={commitLyrics}
                    disabled={!hasUncommittedChanges}
                    className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm transition font-semibold ${
                        hasUncommittedChanges
                            ? "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20"
                            : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                >
                    <CheckCircle size={16} />
                    Commit
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
                    className={`px-4 py-2 rounded-md flex items-center gap-2 text-sm transition font-semibold ${
                        hasUncommittedChanges
                            ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                            : "bg-gray-700 text-gray-400 opacity-50 cursor-not-allowed"
                    }`}
                >
                    <Undo2 size={16} />
                    Discard
                </button>
            </div>
        </div>
    </header>
);
