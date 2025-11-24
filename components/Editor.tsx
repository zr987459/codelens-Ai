import React from 'react';

interface EditorProps {
  language: string;
  code: string;
  onChange: (value: string) => void;
  isActive: boolean;
}

const Editor: React.FC<EditorProps> = ({ language, code, onChange, isActive }) => {
  if (!isActive) return null;

  return (
    <div className="flex-1 relative h-full group">
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-full bg-slate-900 text-slate-100 font-mono text-sm p-4 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 border-none leading-relaxed"
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
      />
      <div className="absolute top-2 right-4 text-xs text-slate-500 font-bold bg-slate-800 px-2 py-1 rounded pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
        {language.toUpperCase()}
      </div>
    </div>
  );
};

export default Editor;