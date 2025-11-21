export interface LyricPhrase {
  phrase: string;
  duration: number;
  pronounciation?: string;
  pncat_forced?: boolean;
}

export interface LyricLine {
  time: string;
  type?: 'prelude' | 'end' | 'interlude';
  text?: LyricPhrase[];
  translation?: string;
}

export type LyricData = LyricLine[];