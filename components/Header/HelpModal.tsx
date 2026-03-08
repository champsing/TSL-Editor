import React from "react";
import { MoveRight, Clock, X } from "lucide-react";

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-52 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] border border-gray-800 w-3xl max-h-100 overflow-y-scroll p-6 rounded-xl shadow-2xl">
                <div className="flex justify-between mb-6">
                    <h3 className="text-primary font-bold text-2xl border-b border-primary/20">
                        快捷鍵與提示 (Shortcuts & Tips)
                    </h3>
                    <button
                        onClick={onClose}
                        className=" text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                <ul className="space-y-3 list-none text-gray-300 mb-6">
                    <li className="flex items-start gap-2">
                        <span className="text-white font-bold bg-white/10 p-1 rounded">
                            <MoveRight size={14} />
                        </span>
                        <span>將影片跳轉到該時間。</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-white font-bold bg-white/10 p-1 rounded">
                            <Clock size={14} />
                        </span>
                        <span>將該行起始時間設置為影片當前時間。</span>
                    </li>
                </ul>

                <h3 className="text-primary font-bold mb-3 text-lg">
                    編輯後可以點擊：
                </h3>
                <ul className="space-y-2 mb-6 border-l-2 border-gray-800 pl-4">
                    <li>
                        <strong className="text-blue-400">Diff</strong>{" "}
                        按鈕查看變更內容。
                    </li>
                    <li>
                        <strong className="text-green-400">Commit</strong>{" "}
                        按鈕提交變更。
                    </li>
                    <li>
                        <strong className="text-red-400">Discard</strong>{" "}
                        按鈕還原。
                    </li>
                </ul>

                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg text-blue-200 text-sm">
                    <p className="mb-1">
                        <strong>注意:</strong> 時間格式為 <code>MM:SS.mm</code>
                        。
                    </p>
                    <p>只有當影片暫停時才能新增行。</p>
                </div>
            </div>
        </div>
    );
};
