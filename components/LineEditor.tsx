import React from 'react';
import { LyricLine, LyricPhrase } from '../types';
import { PhraseEditor } from './PhraseEditor';
import { Clock, Plus, Trash2, MoveRight } from 'lucide-react';

interface LineEditorProps {
  index: number;
  line: LyricLine;
  isCurrent: boolean;
  onUpdate: (index: number, newLine: LyricLine) => void;
  onDelete: (index: number) => void;
  onStampTime: (index: number) => void;
  onSeek: (timeStr: string) => void;
}

export const LineEditor: React.FC<LineEditorProps> = ({ 
  index, 
  line, 
  isCurrent,
  onUpdate, 
  onDelete,
  onStampTime,
  onSeek
}) => {

  const handlePhraseChange = (pIndex: number, updatedPhrase: LyricPhrase) => {
    if (!line.text) return;
    const newText = [...line.text];
    newText[pIndex] = updatedPhrase;
    onUpdate(index, { ...line, text: newText });
  };

  const addPhrase = () => {
    const newPhrase: LyricPhrase = { phrase: '', duration: 20 };
    const newText = line.text ? [...line.text, newPhrase] : [newPhrase];
    onUpdate(index, { ...line, text: newText });
  };

  const deletePhrase = (pIndex: number) => {
    if (!line.text) return;
    const newText = line.text.filter((_, i) => i !== pIndex);
    onUpdate(index, { ...line, text: newText });
  };

  const isSpecialType = !!line.type;

  return (
    <div className={`mb-4 p-4 rounded-lg border transition-all duration-300 ${isCurrent ? 'is-current bg-dark/80 border-primary shadow-[0_0_15px_rgba(74,194,215,0.3)] transform scale-[1.01]' : 'bg-panel border-gray-700 hover:border-gray-500'}`}>
      
      {/* Toolbar Header */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="bg-black/30 rounded p-1 flex items-center gap-2 border border-gray-600">
          <button 
            onClick={() => onStampTime(index)}
            className="p-1.5 hover:bg-primary hover:text-black rounded text-primary transition-colors"
            title="Stamp current player time"
          >
            <Clock size={16} />
          </button>
          <input 
            type="text" 
            value={line.time}
            onChange={(e) => onUpdate(index, { ...line, time: e.target.value })}
            className="bg-transparent w-20 text-center font-mono text-lg text-white outline-none focus:text-primary"
          />
          <button 
            onClick={() => onSeek(line.time)}
            className="p-1.5 hover:bg-white/20 rounded text-gray-400 transition-colors"
            title="Seek player to this time"
          >
            <MoveRight size={16} />
          </button>
        </div>

        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 uppercase font-bold">Type:</span>
            <select 
                value={line.type || 'normal'} 
                onChange={(e) => onUpdate(index, { ...line, type: e.target.value === 'normal' ? undefined : e.target.value as any })}
                className="bg-black/30 border border-gray-600 rounded px-2 py-1 text-sm outline-none focus:border-primary"
            >
                <option value="normal">Lyrics</option>
                <option value="prelude">Prelude</option>
                <option value="interlude">Interlude</option>
                <option value="end">End</option>
            </select>
        </div>

        <div className="flex-grow"></div>

        <button 
            onClick={() => onDelete(index)}
            className="text-red-400 hover:bg-red-400/10 p-2 rounded transition-colors"
            title="Delete Line"
        >
            <Trash2 size={18} />
        </button>
      </div>

      {/* Lyric Content - Show when NOT special type */}
      {!isSpecialType && (
        <div className="space-y-3">
            {/* Phrases Flow */}
            <div className="flex flex-wrap gap-2 items-start">
                {line.text?.map((phrase, pIndex) => (
                    <PhraseEditor 
                        key={pIndex} 
                        phrase={phrase} 
                        onChange={(up) => handlePhraseChange(pIndex, up)}
                        onDelete={() => deletePhrase(pIndex)}
                    />
                ))}
                <button 
                    onClick={addPhrase}
                    className="h-[82px] w-10 flex items-center justify-center border border-dashed border-gray-500 rounded-md text-gray-500 hover:text-primary hover:border-primary hover:bg-primary/10 transition-all"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Translation */}
            <div className="flex items-center gap-3 bg-black/20 p-2 rounded border border-white/5">
                <span className="text-xs text-green-400 font-bold px-2">TL</span>
                <input 
                    type="text" 
                    value={line.translation || ''}
                    onChange={(e) => onUpdate(index, { ...line, translation: e.target.value })}
                    className="w-full bg-transparent outline-none text-gray-300 placeholder-gray-600"
                    placeholder="Translation..."
                />
            </div>
        </div>
      )}

      {/* Marker Content - Show when special type */}
      {isSpecialType && (
        <div className="text-gray-500 italic text-center py-2 border border-dashed border-gray-700 rounded bg-black/20">
            {line.type?.toUpperCase()} MARKER
        </div>
      )}

    </div>
  );
};