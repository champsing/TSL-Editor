import { useAuth } from "@composables/useAuth";
import { FileJson2, Upload } from "lucide-react";
import React from "react";

interface JsonButtonsProps {
    activeModal: "upload" | "json" | null;
    onViewJson: () => void;
    onUpload: () => void;
}

export const JsonButtons: React.FC<JsonButtonsProps> = ({
    activeModal,
    onViewJson,
    onUpload,
}) => {
    const { user } = useAuth();
    const isLoggedIn = !!user;

    const viewClass = {
        base: `
        group relative flex items-center gap-2
        px-3 py-2 rounded-lg
        bg-white/5 hover:bg-primary/10
        border border-white/10 hover:border-primary/40
        text-gray-400 hover:text-primary
        text-sm font-semibold
        transition-all duration-200
        overflow-hidden
        `,
        glow: `
        absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
        bg-[radial-gradient(ellipse_at_bottom,rgba(167,139,250,0.08)_0%,transparent_70%)]
        transition-opacity duration-300 pointer-events-none
        `,
    };

    const uploadClass = {
        base: `
        group relative flex items-center gap-2
        px-3 py-2 rounded-lg
        bg-primary/[0.06] hover:bg-primary/[0.12]
        text-white hover:text-violet-200
        text-sm font-bold
        transition-all duration-200
        overflow-hidden
        `,
        glow: `
        absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100
        bg-[radial-gradient(ellipse_at_top,rgba(244,114,182,0.12)_0%,transparent_60%)]
        transition-opacity duration-300 pointer-events-none
        `,
    };

    // 登入後
    if (isLoggedIn) {
        return (
            <div
                style={{
                    padding: "1px",
                    borderRadius: "8px",
                    background:
                        "linear-gradient(135deg, #f472b6, #a78bfa, #38bdf8, #a78bfa, #f472b6)",
                    backgroundSize: "300% 300%",
                    animation: "gradient-shift 3s ease infinite",
                }}
            >
                <button
                    onClick={activeModal === "upload" ? onViewJson : onUpload}
                    className={uploadClass.base}
                    style={{ background: "#231f1f" }}
                >
                    <span className={uploadClass.glow} />
                    {activeModal === "upload" ? (
                        // 現在開著 Upload → 顯示切回 View JSON
                        <>
                            <FileJson2 size={15} />
                            <span className="tracking-wide uppercase text-xs">
                                View JSON
                            </span>
                        </>
                    ) : (
                        // 沒開或開著 JSON → 顯示 Upload JSON
                        <>
                            <Upload size={13} />

                            <span className="tracking-wide uppercase text-xs">
                                Upload JSON
                            </span>
                        </>
                    )}
                </button>
            </div>
        );
    }

    // 未登入
    return (
        <button onClick={onViewJson} className={viewClass.base}>
            <span className={viewClass.glow} />
            <FileJson2
                size={15}
                className="transition-transform duration-200 group-hover:scale-110 shrink-0"
            />
            <span className="tracking-wide uppercase text-xs">View JSON</span>
        </button>
    );
};
