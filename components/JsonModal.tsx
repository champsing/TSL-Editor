// --- New Component: JSON Modal (從 App.tsx 移出) ---
import React from "react";

interface JsonModalProps {
    jsonContent: string;
    onClose: () => void;
    onCopy: () => void;
}

export const JsonModal: React.FC<JsonModalProps> = ({
    jsonContent,
    onClose,
    onCopy,
}) => (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-10 backdrop-blur-sm">
        <div className="bg-panel w-full max-w-3xl h-[80vh] rounded-xl shadow-2xl flex flex-col border border-gray-600">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {/* <FileJson className="text-primary" /> */}
                    Generated JSON
                </h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white"
                >
                    Close
                </button>
            </div>
            <textarea
                className="flex-1 bg-[#1e1e1e] text-green-400 font-mono p-4 text-sm resize-none outline-none"
                readOnly
                value={jsonContent}
            />
            <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-300 hover:text-white"
                >
                    Cancel
                </button>
                <button
                    onClick={onCopy}
                    className="bg-primary hover:bg-teal-300 text-dark font-bold px-6 py-2 rounded shadow"
                >
                    Copy to Clipboard
                </button>
            </div>
        </div>
    </div>
);
