import React from 'react';
import { X, FileText, Check, Copy } from 'lucide-react';

interface LogViewerProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

const LogViewer: React.FC<LogViewerProps> = ({ isOpen, onClose, content }) => {
  const [isCopied, setIsCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 rounded-t-xl">
          <div className="flex items-center space-x-2 text-slate-100">
            <FileText className="w-5 h-5 text-slate-400" />
            <h2 className="font-semibold text-lg">API 原始响应日志</h2>
          </div>
          <div className="flex items-center space-x-2">
             <button
                onClick={handleCopy}
                className="p-2 text-slate-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-800"
                title="复制内容"
             >
                {isCopied ? <Check size={18} className="text-emerald-500"/> : <Copy size={18} />}
             </button>
             <button 
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-full"
             >
                <X size={20} />
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-slate-950 p-4 font-mono text-xs text-slate-300">
            <pre className="whitespace-pre-wrap break-all">
                {content}
            </pre>
        </div>
      </div>
    </div>
  );
};

export default LogViewer;