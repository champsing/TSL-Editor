export interface LyricPhrase {
    phrase: string;
    duration: number;
    pronounciation?: string;
    kiai?: boolean;
    pncat_forced?: boolean; // 新增此行
}

export interface BackgroundVoiceLine {
    time: string;
    text: LyricPhrase[];
}

export interface LyricLine {
    time: string;
    type?: "prelude" | "interlude" | "end" | "normal";
    text?: LyricPhrase[];
    translation?: string;
    background_voice?: BackgroundVoiceLine; // 新增
}

export type LyricData = LyricLine[];
