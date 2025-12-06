import TenbyouMapping from "./original.json";

export const VERSION_NUMBER = import.meta.env.VITE_APP_VERSION || "1.0.0";

export const timeToSeconds = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [minutes, rest] = timeStr.split(":");
    const [seconds, ms] = rest.split(".");
    if (!ms) return parseInt(minutes) * 60 + parseInt(seconds);
    return parseInt(minutes) * 60 + parseInt(seconds) + parseInt(ms) / 100;
};

export const secondsToTime = (
    totalSeconds: number,
    decimal: number,
): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const ms = Math.round((totalSeconds - Math.floor(totalSeconds)) * 100);

    const pad = (num: number) => num.toString().padStart(2, "0");
    if (decimal === 1) return `${pad(minutes)}:${pad(seconds)}.${pad(ms)}`;
    else return `${pad(minutes)}:${pad(seconds)}`;
};

export const formatDuration = (val: number) => `${val}`;

// Default YouTube Video ID
export const DEFAULT_VIDEO_ID = "sL-yJIyuEaM"; // Mrs Green Apple, Sonoko Inoue - Tenbyouno Uta

// Default Initial Data
export const INITIAL_JSON_DATA = TenbyouMapping;
