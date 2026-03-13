import React, { useState } from "react";
import { HelpCircle, Music2, RefreshCcw } from "lucide-react";
import { VERSION_NUMBER } from "@composables/utils";
import { JsonButtons } from "./JsonButtons";
import { HelpModal } from "./HelpModal";
import { SiGithub } from "react-icons/si";
import { AuthButton } from "./AuthButton";

interface EditorHeaderProps {
    onOpenSongSelect: () => void;
    onViewJson: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
    onOpenSongSelect,
    onViewJson,
}) => {
    const [isHelpOpen, setIsHelpOpen] = useState(false); // 控制 Modal 狀態

    return (
        <header className="bg-dark shadow-lg px-6 py-3 flex items-center justify-between border-b-2 border-zinc-600">
            {/* --- 1. Logo --- */}
            <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg">
                    <Music2 className="text-dark" size={24} />
                </div>
                <h1 className="text-2xl font-playfair font-bold text-white">
                    <span className="text-primary">TSL</span>Editor
                </h1>
                <sup className="text-gray-400 ">Ver {VERSION_NUMBER}</sup>
                <button
                    onClick={onOpenSongSelect}
                    className="ml-4 flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-2 py-2 rounded-lg border border-white/10 transition-all group"
                >
                    <RefreshCcw
                        size={16}
                        className="text-primary group-hover:scale-110 transition-transform"
                    />
                    <span className="text-sm font-semibold">CHANGE SONG</span>
                </button>
            </div>

            <div className="flex items-center gap-4">
                {/* File/JSON Actions */}
                <JsonButtons onViewJson={onViewJson} />

                {/* 分隔線 */}
                <div className="w-px h-6 bg-white/10" />

                {/* GitHub Auth */}
                <AuthButton />

                {/* 幫助按鈕 */}
                <button
                    onClick={() => setIsHelpOpen(true)}
                    className="text-gray-400 hover:text-primary transition-colors p-1"
                    title="操作說明"
                >
                    <HelpCircle size={22} />
                </button>

                <a
                    href="https://github.com/champsing/TSL-Editor"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors p-1"
                    title="View Source on GitHub"
                >
                    <SiGithub size={20} />
                </a>
            </div>

            <HelpModal
                isOpen={isHelpOpen}
                onClose={() => setIsHelpOpen(false)}
            />
        </header>
    );
};
