import React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// ToggleItem
// Fix: 外層 div 統一處理 onClick，子元素全部 pointer-events-none
// 避免原 <label> 版本事件冒泡導致 onChange 被呼叫兩次
// ─────────────────────────────────────────────────────────────────────────────
export const ToggleItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
    color: string;
}> = ({ icon, label, checked, onChange, color }) => (
    <div
        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer select-none transition-all ${
            checked ? "bg-white/5" : "hover:bg-white/5"
        }`}
        onClick={() => onChange(!checked)}
    >
        {/* pointer-events-none 讓子元素不攔截事件，由外層 div 統一處理 */}
        <div
            className={`flex items-center gap-3 pointer-events-none ${
                checked ? color : "text-gray-400"
            }`}
        >
            {icon}
            <span className="text-sm font-bold">{label}</span>
        </div>
        <div
            className={`w-10 h-5 rounded-full relative transition-colors duration-300 pointer-events-none ${
                checked ? "bg-primary" : "bg-gray-700"
            }`}
        >
            <div
                className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300 ${
                    checked ? "left-6" : "left-1"
                }`}
            />
        </div>
    </div>
);
