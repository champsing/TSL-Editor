import React from 'react';
import { LyricLine, LyricPhrase } from '../types';
import { PhraseEditor } from './PhraseEditor';
import { Clock, Plus, Trash2, MoveRight, Mic2, XCircle } from 'lucide-react';

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

  // --- Main Text Handlers ---
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

  // --- Background Voice Handlers ---
  const toggleBackgroundVoice = () => {
    if (line.background_voice) {
        // Remove it
        if (window.confirm("Remove background voice track?")) {
            const { background_voice, ...rest } = line;
            onUpdate(index, rest);
        }
    } else {
        // Add it
        onUpdate(index, { 
            ...line, 
            background_voice: { 
                time: line.time, // default to same time as line
                text: [{ phrase: '', duration: 20 }] 
            } 
        });
    }
  };

  const updateBgVoiceTime = (newTime: string) => {
      if (!line.background_voice) return;
      onUpdate(index, {
          ...line,
          background_voice: { ...line.background_voice, time: newTime }
      });
  };

  const handleBgPhraseChange = (pIndex: number, updatedPhrase: LyricPhrase) => {
      if (!line.background_voice) return;
      const newText = [...line.background_voice.text];
      newText[pIndex] = updatedPhrase;
      onUpdate(index, {
          ...line,
          background_voice: { ...line.background_voice, text: newText }
      });
  };

  const addBgPhrase = () => {
      if (!line.background_voice) return;
      const newPhrase: LyricPhrase = { phrase: '', duration: 20 };
      const newText = [...line.background_voice.text, newPhrase];
      onUpdate(index, {
          ...line,
          background_voice: { ...line.background_voice, text: newText }
      });
  };

  const deleteBgPhrase = (pIndex: number) => {
      if (!line.background_voice) return;
      const newText = line.background_voice.text.filter((_, i) => i !== pIndex);
      onUpdate(index, {
          ...line,
          background_voice: { ...line.background_voice, text: newText }
      });
  };


  const isSpecialType = !!line.type && line.type !== 'normal';

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

        {/* Toggle Background Voice Button */}
        <button 
            onClick={toggleBackgroundVoice}
            className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-bold transition-colors mr-2 ${
                line.background_voice 
                ? 'bg-purple-900/40 text-purple-300 border border-purple-500/50' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
        >
            <Mic2 size={14} />
            {line.background_voice ? 'Has BG Voice' : 'Add BG Voice'}
        </button>

        <button 
            onClick={() => onDelete(index)}
            className="text-red-400 hover:bg-red-400/10 p-2 rounded transition-colors"
            title="Delete Line"
        >
            <Trash2 size={18} />
        </button>
      </div>

      {/* Main Lyric Content */}
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

      {/* Marker Content */}
      {isSpecialType && (
        <div className="text-gray-500 italic text-center py-2 border border-dashed border-gray-700 rounded bg-black/20 mb-3">
            {line.type?.toUpperCase()} MARKER
        </div>
      )}

      {/* Background Voice Section */}
      {line.background_voice && (
          <div className="mt-4 p-3 bg-purple-900/10 border border-purple-500/20 rounded-lg relative">
              <div className="absolute top-0 left-0 bg-purple-500/20 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-br">
                  BACKGROUND VOICE
              </div>
              
              <div className="flex items-start gap-4 mt-4">
                  {/* BG Voice Time Control */}
                  <div className="flex flex-col gap-1 pt-2">
                      <div className="flex items-center bg-black/40 rounded border border-purple-500/30 overflow-hidden">
                          <input 
                              type="text"
                              value={line.background_voice.time}
                              onChange={(e) => updateBgVoiceTime(e.target.value)}
                              className="w-20 bg-transparent text-xs text-center p-1 outline-none font-mono text-purple-200"
                          />
                      </div>
                      <div className="flex justify-between">
                        <button 
                            onClick={() => onSeek(line.background_voice!.time)}
                            className="text-gray-500 hover:text-purple-300"
                            title="Seek to BG time"
                        >
                            <MoveRight size={12} />
                        </button>
                        <button
                            onClick={toggleBackgroundVoice}
                            className="text-red-400/50 hover:text-red-400"
                            title="Remove BG Voice"
                        >
                            <XCircle size={12} />
                        </button>
                      </div>
                  </div>

                  {/* BG Phrases */}
                  <div className="flex flex-wrap gap-2 items-start flex-1">
                      {line.background_voice.text.map((phrase, pIndex) => (
                          <PhraseEditor 
                              key={`bg-${pIndex}`} 
                              phrase={phrase} 
                              onChange={(up) => handleBgPhraseChange(pIndex, up)}
                              onDelete={() => deleteBgPhrase(pIndex)}
                          />
                      ))}
                      <button 
                          onClick={addBgPhrase}
                          className="h-[82px] w-8 flex items-center justify-center border border-dashed border-purple-500/30 rounded-md text-purple-500/50 hover:text-purple-300 hover:border-purple-400 hover:bg-purple-500/10 transition-all"
                      >
                          <Plus size={16} />
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};