import React, { useState, useRef, useEffect } from "react";
import { LogIn, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@composables/useAuth";
import { SiGithub } from "react-icons/si";
import { SlSocialGithub } from "react-icons/sl";
import { FaSquareGithub } from "react-icons/fa6";

// ─── Logout Confirmation Modal ────────────────────────────────────────────────
const LogoutConfirmModal: React.FC<{
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    userName: string;
}> = ({ isOpen, onConfirm, onCancel, userName }) => {
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onCancel}
            />
            <div className="relative bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in-95 fade-in duration-200">
                <div className="absolute -inset-px rounded-2xl opacity-20 blur-xl pointer-events-none bg-red-500" />
                <div className="relative flex flex-col items-center gap-4 text-center">
                    {/* GitHub avatar via unavatar */}
                    <img
                        src={`https://unavatar.io/github/${userName}`}
                        alt={userName}
                        className="w-16 h-16 rounded-full border-2 border-white/20 shadow-lg"
                    />
                    <div>
                        <h3 className="text-white font-bold text-lg leading-tight">
                            Confirm Logout
                        </h3>
                        <p className="text-gray-400 text-sm mt-1">
                            Are you sure you want to logout,{" "}
                            <span className="text-white font-semibold">
                                @{userName}
                            </span>
                            ?
                        </p>
                    </div>
                    <div className="flex gap-3 w-full mt-2">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-semibold text-sm transition-all"
                        >
                            CANCEL
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 font-semibold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut size={14} />
                            LOGOUT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Auth Button ──────────────────────────────────────────────────────────────
export const AuthButton: React.FC = () => {
    const { user, isLoading, login, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [logoutModalOpen, setLogoutModalOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target as Node)
            ) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleLogoutRequest = () => {
        setDropdownOpen(false);
        setLogoutModalOpen(true);
    };

    const handleLogoutConfirm = () => {
        setLogoutModalOpen(false);
        logout();
    };

    // ── Loading skeleton ──────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
        );
    }

    // ── Not logged in → Login button ──────────────────────────────────────────
    if (!user) {
        return (
            <button
                onClick={login}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-all group"
                title="Login via GitHub"
            >
                <SlSocialGithub
                    size={15}
                    className="text-gray-400 group-hover:text-white transition-colors"
                />
                <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors">
                    LOGIN
                </span>
                <LogIn
                    size={13}
                    className="text-gray-500 group-hover:text-primary transition-colors"
                />
            </button>
        );
    }

    // ── Logged in → Avatar + dropdown ────────────────────────────────────────
    const avatarUrl = `https://unavatar.io/github/${user.login}`;
    const githubUrl = `https://github.com/${user.login}`;

    return (
        <>
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-lg px-2 py-1.5 border border-white/10 hover:border-white/20 transition-all group"
                    title={`@${user.login}`}
                >
                    <img
                        src={avatarUrl}
                        alt={user.login}
                        className="w-7 h-7 rounded-full border border-white/20 shadow"
                    />
                    <span className="text-sm font-semibold text-gray-300 group-hover:text-white transition-colors max-w-[100px] truncate hidden sm:block">
                        {user.login}
                    </span>
                    <ChevronDown
                        size={13}
                        className={`text-gray-500 group-hover:text-gray-300 transition-all duration-200 ${
                            dropdownOpen ? "rotate-180" : ""
                        }`}
                    />
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-150 z-50">
                        <div className="px-4 py-3 border-b border-white/8">
                            <div className="flex items-center gap-3">
                                <img
                                    src={avatarUrl}
                                    alt={user.login}
                                    className="w-9 h-9 rounded-full border border-white/20"
                                />
                                <div className="min-w-0">
                                    <p className="text-white text-sm font-semibold truncate leading-tight">
                                        @{user.login}
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                        GitHub
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-1.5">
                            <a
                                href={githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/8 transition-all text-sm font-medium"
                                onClick={() => setDropdownOpen(false)}
                            >
                                <FaSquareGithub
                                    size={15}
                                    className="text-gray-500"
                                />
                                GitHub Profile
                            </a>
                            <button
                                onClick={handleLogoutRequest}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm font-medium"
                            >
                                <LogOut size={15} />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <LogoutConfirmModal
                isOpen={logoutModalOpen}
                onConfirm={handleLogoutConfirm}
                onCancel={() => setLogoutModalOpen(false)}
                userName={user.login}
            />
        </>
    );
};
