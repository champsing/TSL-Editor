// --- New Component: JSON Modal (從 App.tsx 移出) ---
import React, { useState, useCallback } from "react"; // <-- 引入 useState 和 useCallback
import { Check } from "lucide-react"; // <-- 引入 Check (如果有使用 lucide-react 的話)

interface JsonModalProps {
    jsonContent: string;
    onClose: () => void;
    onCopy: () => void;
}

export const JsonModal: React.FC<JsonModalProps> = ({
    jsonContent,
    onClose,
    onCopy,
}) => {
    const [isCopied, setIsCopied] = useState(false); // <-- 新增狀態

    // 處理複製並顯示成功狀態
    const handleCopy = useCallback(() => {
        onCopy(); // 執行實際的複製操作
        setIsCopied(true); // 設定複製成功狀態

        // 數秒後恢復
        const timer = setTimeout(() => {
            setIsCopied(false);
        }, 2000); // 2000 毫秒 (2 秒)

        return () => clearTimeout(timer);
    }, [onCopy]);

    return (
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
                    className="flex-1 bg-[#1e1e1e] text-green-400 p-4 text-sm resize-none outline-none"
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
                        onClick={handleCopy} // <-- 使用新的處理函數
                        className={`
                            ${
                                isCopied
                                    ? "bg-green-500 hover:bg-green-400 text-white" // 複製成功狀態
                                    : "bg-primary hover:bg-teal-300 text-dark" // 原始狀態
                            }
                            font-bold px-6 py-2 rounded shadow flex items-center gap-2 transition
                        `}
                    >
                        {isCopied && <Check size={20} />}{" "}
                        {/* <-- 根據狀態顯示打勾 */}
                        {isCopied ? "Copied!" : "Copy to Clipboard"}{" "}
                        {/* <-- 根據狀態切換文字 */}
                    </button>
                </div>
            </div>
        </div>
    );
};
