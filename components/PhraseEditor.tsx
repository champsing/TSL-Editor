import React from "react";
import { LyricPhrase } from "../types";
import { X, Mic, Type, Zap, Pin } from "lucide-react";

interface PhraseEditorProps {
    phrase: LyricPhrase;
    onChange: (updated: LyricPhrase) => void;
    onDelete: () => void;
}

export const PhraseEditor: React.FC<PhraseEditorProps> = ({
    phrase,
    onChange,
    onDelete,
}) => {
    return (
        <div
            className={`flex flex-col p-2 rounded-md border min-w-40 relative group transition-all duration-200 ${
                phrase.kiai
                    ? "bg-yellow-900/20 border-yellow-600/50 shadow-[0_0_10px_rgba(234,179,8,0.1)]"
                    : "bg-gray-700/50 border-gray-600"
            }`}
        >
            {/* --- Delete Button --- */}
            <button
                onClick={onDelete}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
            >
                <X size={12} />
            </button>

            {/* --- 1. Main Phrase Input & Kiai Toggle --- */}
            <div className="flex items-center gap-1 mb-1">
                <Type size={14} className="text-primary" />
                <input
                    type="text"
                    value={phrase.phrase}
                    onChange={(e) =>
                        onChange({ ...phrase, phrase: e.target.value })
                    }
                    className="bg-transparent border-b border-gray-500 focus:border-primary outline-none text-sm w-full font-medium"
                    placeholder="Text"
                />
                {/* Kiai Toggle Button */}
                <button
                    onClick={() => onChange({ ...phrase, kiai: !phrase.kiai })}
                    className={`ml-1 p-1 rounded-full transition-colors ${
                        phrase.kiai
                            ? "text-yellow-400 bg-yellow-400/20"
                            : "text-gray-500 hover:text-gray-300"
                    }`}
                    title="Toggle Kiai (Climax)"
                >
                    <Zap
                        size={12}
                        fill={phrase.kiai ? "currentColor" : "none"}
                    />
                </button>
            </div>

            {/* --- 2. Pronunciation Input & Pncat Forced Toggle --- */}
            <div className="flex items-center gap-1 mb-1">
                <Mic size={14} className="text-orange-400" />
                <input
                    type="text"
                    value={phrase.pronounciation || ""}
                    onChange={(e) =>
                        onChange({ ...phrase, pronounciation: e.target.value })
                    }
                    className={`bg-transparent border-b outline-none text-xs w-full transition-colors ${
                        phrase.pncat_forced
                            ? "border-blue-400 text-blue-200"
                            : "border-gray-500 focus:border-orange-400 text-gray-300"
                    }`}
                    placeholder="Pronunciation"
                />
                {/* Pncat Forced Toggle Button */}
                <button
                    onClick={() =>
                        onChange({
                            ...phrase,
                            pncat_forced: !phrase.pncat_forced,
                        })
                    }
                    className={`ml-1 p-1 rounded-full transition-colors ${
                        phrase.pncat_forced
                            ? "text-blue-400 bg-blue-400/20"
                            : "text-gray-500 hover:text-gray-300"
                    }`}
                    title="Force Pronunciation (pncat_forced)"
                >
                    <Pin
                        size={12}
                        fill={phrase.pncat_forced ? "currentColor" : "none"}
                    />
                </button>
            </div>

            {/* --- 3. Duration Input --- */}
            <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Dur
                </span>
                <input
                    type="number"
                    value={phrase.duration}
                    onChange={(e) =>
                        onChange({
                            ...phrase,
                            duration: parseInt(e.target.value) || 0,
                        })
                    }
                    className="bg-black/20 rounded px-1 text-right text-xs w-12 border border-transparent focus:border-primary outline-none text-teal-300 font-mono"
                />
            </div>
        </div>
    );
};
