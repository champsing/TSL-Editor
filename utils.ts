export const timeToSeconds = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [minutes, rest] = timeStr.split(":");
    const [seconds, ms] = rest.split(".");
    if (!ms) return parseInt(minutes) * 60 + parseInt(seconds);
    return parseInt(minutes) * 60 + parseInt(seconds) + parseInt(ms) / 100;
};

export const secondsToTime = (totalSeconds: number, fmt: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const ms = Math.round((totalSeconds - Math.floor(totalSeconds)) * 100);

    const pad = (num: number) => num.toString().padStart(2, "0");
    if (fmt === 1) return `${pad(minutes)}:${pad(seconds)}.${pad(ms)}`;
    else return `${pad(minutes)}:${pad(seconds)}`;
};

export const formatDuration = (val: number) => `${val}`;

// Default YouTube Video ID
export const DEFAULT_VIDEO_ID = "NxRTkmu2l9g"; // yutori - Speed

// Default Initial Data
export const INITIAL_JSON_DATA = `[
    {
        "time": "00:01.34",
        "type": "prelude"
    },
{
        "time": "00:51.56",
        "text": [
            {
                "phrase": "最高到達点",
                "duration": 70,
                "pronounciation": "トップスピード",
                "pncat_forced": true
            },
            { "phrase": "超", "duration": 80, "kiai": true },
            { "phrase": "えて ", "duration": 50 },
            { "phrase": "今", "duration": 50 },
            { "phrase": "君", "duration": 50, "kiai": true },
            { "phrase": "の", "duration": 50 },
            { "phrase": "元", "duration": 50, "kiai": true },
            { "phrase": "へ", "duration": 50 }
        ],
        "translation": "我會突破最高速限　奔往你的身旁",
        "background_voice": {
            "time": "00:52:00",
            "text": [
                { "phrase": "超", "duration": 80 },
            { "phrase": "えて ", "duration": 50 },
            { "phrase": "今", "duration": 50 },
            { "phrase": "君", "duration": 50 },
            { "phrase": "の", "duration": 50, "kiai": true },
            { "phrase": "元", "duration": 50 },
            { "phrase": "へ", "duration": 50, "kiai": true }
            ]
        }
    },
    {
        "time": "00:13.00",
        "type": "interlude"
    },
    {
        "time": "03:33.14",
        "text": [
            { "phrase": "嘘", "duration": 40 },
            { "phrase": "じゃ", "duration": 40 },
            { "phrase": "ないと", "duration": 30 },
            { "phrase": "誓", "duration": 50 },
            { "phrase": "うから", "duration": 50 }
        ],
        "translation": "帶著真心立下誓言"
    },
    {
        "time": "03:35.75",
        "type": "end"
    }
]`;
