// components/SongMetaEditorModal.tsx
import { X } from "lucide-react";
import React, { useEffect, useRef } from "react";

export const varColorPrimary = "var(--color-primary, #7c3aed)";

interface SongMetaEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon: React.ReactNode;
    /**
     * CSS color value used for the left accent stripe + icon glow.
     * e.g. "#4ade80"  |  "rgb(168,85,247)"  |  "var(--color-primary)"
     * Defaults to "var(--color-primary, #7c3aed)"
     */
    accentColor?: string;
    /** Right-side action buttons rendered next to the close button */
    actions?: React.ReactNode;
    /** Footer note / hint text */
    footer?: React.ReactNode;
    /** Max width Tailwind class, default "max-w-3xl" */
    maxWidthClass?: string;
    children: React.ReactNode;
}

export const SongMetaEditorModal: React.FC<SongMetaEditorModalProps> = ({
    isOpen,
    onClose,
    title,
    icon,
    accentColor = varColorPrimary,
    actions,
    footer,
    maxWidthClass = "max-w-3xl",
    children,
}) => {
    const overlayRef = useRef<HTMLDivElement>(null);

    /* Close on Escape */
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-51 flex items-center justify-center p-4">
            {/* ── Backdrop ───────────────────────────────────────────────── */}
            <div
                ref={overlayRef}
                className="absolute inset-0 bg-black/75"
                style={{ backdropFilter: "blur(6px) saturate(0.6)" }}
                onClick={onClose}
            />

            {/* ── Panel ──────────────────────────────────────────────────── */}
            <div
                className={`
                    relative w-full ${maxWidthClass}
                    animate-in zoom-in-[0.97] fade-in duration-200 ease-out
                `}
                style={{
                    /* layered shadow: soft ambient + sharp bottom edge + accent glow */
                    filter: `drop-shadow(0 32px 64px rgba(0,0,0,0.7))`,
                }}
            >
                {/* Accent glow bloom behind the panel */}
                <div
                    className="absolute -inset-px rounded-2xl opacity-30 blur-lg pointer-events-none"
                    style={{ background: accentColor }}
                />

                {/* Main shell */}
                <div
                    className="relative rounded-2xl overflow-hidden"
                    style={{
                        background:
                            "linear-gradient(160deg, #1e2535 0%, #181e2c 60%, #141824 100%)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: `
                            inset 0 1px 0 rgba(255,255,255,0.07),
                            inset 0 -1px 0 rgba(0,0,0,0.4),
                            0 0 0 1px rgba(0,0,0,0.5)
                        `,
                    }}
                >
                    {/* Left accent stripe */}
                    <div
                        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
                        style={{
                            background: `linear-gradient(to bottom, transparent 0%, ${accentColor} 20%, ${accentColor} 80%, transparent 100%)`,
                            opacity: 0.9,
                        }}
                    />

                    {/* ── Header ─────────────────────────────────────────── */}
                    <div
                        className="relative flex items-center justify-between pl-8 pr-5 py-4"
                        style={{
                            background:
                                "linear-gradient(to bottom, rgba(255,255,255,0.04) 0%, transparent 100%)",
                            borderBottom: "1px solid rgba(255,255,255,0.06)",
                        }}
                    >
                        {/* Corner grid decoration */}
                        <div className="absolute top-0 right-0 w-32 h-full overflow-hidden opacity-[0.04] pointer-events-none select-none">
                            <svg
                                width="128"
                                height="100%"
                                viewBox="0 0 128 64"
                                preserveAspectRatio="xMaxYMid slice"
                            >
                                {Array.from({ length: 9 }).map((_, i) => (
                                    <line
                                        key={`v${i}`}
                                        x1={i * 16}
                                        y1="0"
                                        x2={i * 16}
                                        y2="64"
                                        stroke="white"
                                        strokeWidth="0.5"
                                    />
                                ))}
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <line
                                        key={`h${i}`}
                                        x1="0"
                                        y1={i * 16}
                                        x2="128"
                                        y2={i * 16}
                                        stroke="white"
                                        strokeWidth="0.5"
                                    />
                                ))}
                            </svg>
                        </div>

                        {/* Left: icon + title */}
                        <div className="flex items-center gap-3.5">
                            {/* Icon container with inner ring */}
                            <div
                                className="relative flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                                style={{
                                    background: `radial-gradient(circle at 35% 35%, ${accentColor}33 0%, ${accentColor}11 100%)`,
                                    boxShadow: `0 0 0 1px ${accentColor}44, inset 0 1px 0 rgba(255,255,255,0.1)`,
                                    color: accentColor,
                                }}
                            >
                                {icon}
                                {/* inner shimmer */}
                                <div className="absolute inset-0 rounded-xl bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
                            </div>

                            <div>
                                <div
                                    className="text-[10px] font-bold uppercase tracking-[0.18em]"
                                    style={{ color: `${accentColor}99` }}
                                >
                                    Song Editor
                                </div>
                                <h3
                                    className="text-[15px] font-black tracking-tight text-gray-300 leading-none"
                                    style={{ letterSpacing: "-0.01em" }}
                                >
                                    {title}
                                </h3>
                            </div>
                        </div>

                        {/* Right: actions + close */}
                        <div className="flex items-center gap-3">
                            {actions}

                            {/* Close button — circular with border */}
                            <button
                                onClick={onClose}
                                className="
                                    group flex items-center justify-center
                                    w-8 h-8 rounded-full
                                    border border-white/10
                                    bg-white/5
                                    text-gray-500
                                    hover:text-white hover:border-white/25 hover:bg-white/10
                                    active:scale-95
                                    transition-all duration-150
                                "
                            >
                                <X size={15} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>

                    {/* ── Body ───────────────────────────────────────────── */}
                    <div
                        className="pl-8 pr-5 py-6 max-h-[65vh] overflow-y-auto custom-scrollbar"
                        style={{ scrollbarGutter: "stable" }}
                    >
                        {children}
                    </div>

                    {/* ── Footer ─────────────────────────────────────────── */}
                    {footer && (
                        <div
                            className="pl-8 pr-5 py-3 flex items-center gap-2"
                            style={{
                                borderTop: "1px solid rgba(255,255,255,0.05)",
                                background: "rgba(0,0,0,0.2)",
                            }}
                        >
                            {/* small dot indicator */}
                            <div
                                className="w-1 h-1 rounded-full shrink-0"
                                style={{
                                    background: accentColor,
                                    opacity: 0.6,
                                }}
                            />
                            <p className="text-[10px] text-gray-400 italic leading-relaxed">
                                {footer}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Re-export under the old name so existing imports don't break
export { SongMetaEditorModal as EditorModal };
