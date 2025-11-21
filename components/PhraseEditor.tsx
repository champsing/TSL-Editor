import React from 'react';
import { LyricPhrase } from '../types';
import { X, Mic, Type } from 'lucide-react';

interface PhraseEditorProps {
  phrase: LyricPhrase;
  onChange: (updated: LyricPhrase) => void;
  onDelete: () => void;
}

export const PhraseEditor: React.FC<PhraseEditorProps> = ({ phrase, onChange, onDelete }) => {
  return (
    <div className="flex flex-col bg-gray-700/50 p-2 rounded-md border border-gray-600 min-w-[160px] relative group">
      <button 
        onClick={onDelete}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
      >
        <X size={12} />
      </button>
      
      {/* Main Phrase Input */}
      <div className="flex items-center gap-1 mb-1">
        <Type size={14} className="text-primary" />
        <input
          type="text"
          value={phrase.phrase}
          onChange={(e) => onChange({ ...phrase, phrase: e.target.value })}
          className="bg-transparent border-b border-gray-500 focus:border-primary outline-none text-sm w-full font-medium"
          placeholder="Text"
        />
      </div>

      {/* Pronunciation Input */}
      <div className="flex items-center gap-1 mb-1">
        <Mic size={14} className="text-orange-400" />
        <input
          type="text"
          value={phrase.pronounciation || ''}
          onChange={(e) => onChange({ ...phrase, pronounciation: e.target.value })}
          className="bg-transparent border-b border-gray-500 focus:border-orange-400 outline-none text-xs w-full text-gray-300"
          placeholder="Pronunciation"
        />
      </div>

      {/* Duration Input */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Dur</span>
        <input
          type="number"
          value={phrase.duration}
          onChange={(e) => onChange({ ...phrase, duration: parseInt(e.target.value) || 0 })}
          className="bg-black/20 rounded px-1 text-right text-xs w-12 border border-transparent focus:border-primary outline-none text-teal-300 font-mono"
        />
      </div>
    </div>
  );
};