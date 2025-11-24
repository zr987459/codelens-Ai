import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Send, Sparkles, Loader2, Image as ImageIcon, X, Square, BrainCircuit, ChevronDown, ChevronRight, Clock, FileText } from 'lucide-react';
import { ChatMessage, CodeState } from '../types';
import { analyzeAndModifyCode } from '../services/gemini';
import LogViewer from './LogViewer';

interface ChatPanelProps {
  currentCode: CodeState;
  onApplyChanges: (updates: Partial<CodeState>) => void;
  model: string;
}

export interface ChatPanelRef {
  addMessage: (role: 'user' | 'model', text: string) => void;
  triggerAnalysis: (prompt: string) => void;
}

const ChatPanel = forwardRef<ChatPanelRef, ChatPanelProps>(({ currentCode, onApplyChanges, model }, ref) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: "你好！我是 CodeLens AI。您可以输入网址导入网站，或者上传截图让我帮您修改代码。",
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<string | undefined>(undefined);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<number, boolean>>({});
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  
  // Log Viewer State
  const [logContent, setLogContent] = useState<string>('');
  const [isLogOpen, setIsLogOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timerRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, expandedThoughts]);

  // Timer Logic
  useEffect(() => {
    if (isLoading) {
        const start = Date.now();
        timerRef.current = window.setInterval(() => {
            setElapsedTime((Date.now() - start) / 1000);
        }, 100);
    } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setElapsedTime(0);
    }
    return () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading]);

  const toggleThoughts = (index: number) => {
    setExpandedThoughts(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setAttachment(evt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Clear input
    e.target.value = '';
  };

  const clearAttachment = () => {
    setAttachment(undefined);
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "*已停止生成*",
        timestamp: Date.now(),
        isError: true
      }]);
    }
  };

  const openLog = (content?: string) => {
    if (content) {
        setLogContent(content);
        setIsLogOpen(true);
    }
  };

  const performAnalysis = async (promptText: string, image?: string) => {
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      const response = await analyzeAndModifyCode(
          currentCode, 
          promptText, 
          model, 
          image, 
          abortControllerRef.current.signal
      );
      
      setMessages(prev => [...prev, {
        role: 'model',
        text: response.analysis,
        thoughts: response.thoughts,
        thinkingDuration: response.thinkingDuration,
        rawLog: response.rawLog,
        timestamp: Date.now()
      }]);

      if (response.codeUpdates) {
         if (response.codeUpdates.html || response.codeUpdates.css || response.codeUpdates.js) {
             onApplyChanges(response.codeUpdates);
             setMessages(prev => [...prev, {
                 role: 'model',
                 text: "**✅ 已为您应用代码更改。**",
                 timestamp: Date.now() + 1
             }]);
         }
      }
    } catch (error: any) {
      if (error.message === 'Request aborted') return; // Handled by stop

      setMessages(prev => [...prev, {
        role: 'model',
        text: `抱歉，遇到错误: ${error.message}`,
        isError: true,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  useImperativeHandle(ref, () => ({
    addMessage: (role, text) => {
      setMessages(prev => [...prev, { role, text, timestamp: Date.now() }]);
    },
    triggerAnalysis: (prompt) => {
      setMessages(prev => [...prev, { role: 'user', text: prompt, timestamp: Date.now() }]);
      performAnalysis(prompt);
    }
  }));

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !attachment) || isLoading) return;

    const text = input;
    const img = attachment;
    
    // Clear State
    setInput('');
    setAttachment(undefined);

    setMessages(prev => [...prev, { 
        role: 'user', 
        text: text, 
        image: img,
        timestamp: Date.now() 
    }]);
    
    await performAnalysis(text || (img ? "请分析这张图片并修改代码以匹配它。" : "开始分析"), img);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-t border-slate-700">
      
      <LogViewer 
        isOpen={isLogOpen} 
        onClose={() => setIsLogOpen(false)} 
        content={logContent} 
      />

      {/* Header */}
      <div className="flex items-center px-4 py-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-sm justify-between sticky top-0 z-10 shrink-0">
        <div className="flex items-center">
            <div className="p-1.5 bg-blue-500/10 rounded-lg mr-2 border border-blue-500/20">
               <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">AI 智能助手</h3>
              <div className="text-[10px] text-slate-500 font-mono leading-none mt-0.5">
                  Powered by {model}
              </div>
            </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scroll-smooth overscroll-contain pb-20">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} group animate-in slide-in-from-bottom-2 duration-300`}
          >
            {/* User uploaded image */}
            {msg.image && (
                <div className="mb-2 max-w-[85%]">
                    <img src={msg.image} alt="User upload" className="rounded-2xl border border-slate-700 max-h-48 object-contain bg-slate-950 shadow-md" />
                </div>
            )}

            <div 
              className={`max-w-[90%] md:max-w-[85%] relative rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm shadow-blue-900/10' 
                  : msg.isError 
                    ? 'bg-red-900/30 text-red-200 border border-red-800/50 rounded-tl-sm'
                    : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-sm'
              }`}
            >
              {/* Log Button */}
              {msg.rawLog && (
                  <button 
                    onClick={() => openLog(msg.rawLog)}
                    className="absolute -top-6 right-0 p-1 text-slate-600 hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 rounded"
                    title="查看原始响应日志"
                  >
                      <FileText size={12} />
                  </button>
              )}

              {/* Thinking Process Accordion */}
              {msg.thoughts && (
                  <div className="mb-3 border border-slate-700/50 rounded-xl overflow-hidden bg-slate-900/30">
                      <button 
                        onClick={() => toggleThoughts(idx)}
                        className="flex items-center justify-between text-xs font-bold text-slate-400 hover:text-blue-400 transition-colors w-full px-3 py-2.5 bg-slate-900/50 hover:bg-slate-800/50"
                      >
                          <div className="flex items-center space-x-2">
                            <BrainCircuit size={14} className={expandedThoughts[idx] ? "text-amber-400" : "text-slate-500"} />
                            <span>思维链</span>
                            {msg.thinkingDuration && (
                                <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 opacity-80">
                                    {(msg.thinkingDuration / 1000).toFixed(1)}s
                                </span>
                            )}
                          </div>
                          {expandedThoughts[idx] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                      {expandedThoughts[idx] && (
                          <div className="text-xs text-slate-400 font-mono p-3 border-t border-slate-700/50 whitespace-pre-wrap bg-slate-950/30 leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
                              {msg.thoughts}
                          </div>
                      )}
                  </div>
              )}

              {msg.role === 'model' && !msg.isError ? (
                <div className="prose prose-invert prose-sm max-w-none break-words">
                    {msg.text.split('\n').map((line, i) => (
                        <p key={i} className="mb-2 last:mb-0 min-h-[1em]">{line}</p>
                    ))}
                </div>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
            <div className="flex justify-start animate-pulse">
                <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-5 py-4 border border-slate-700 flex items-center space-x-4 max-w-[85%] shadow-md">
                    <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-md"></div>
                        <Loader2 className="w-5 h-5 text-blue-400 animate-spin relative z-10" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-slate-200 text-xs font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent truncate">
                            AI 正在分析与生成...
                        </span>
                        <div className="flex items-center text-[10px] text-slate-500 font-mono mt-1">
                             <Clock size={10} className="mr-1.5" />
                             {elapsedTime.toFixed(1)}s
                        </div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-slate-900 border-t border-slate-800/80 backdrop-blur-sm z-20 pb-[calc(env(safe-area-inset-bottom)+12px)] md:pb-4 transition-all">
        
        {/* Attachment Preview */}
        {attachment && (
            <div className="mb-3 flex items-center bg-slate-800 w-fit px-3 py-1.5 rounded-full border border-slate-700 animate-in slide-in-from-bottom-2 shadow-lg">
                <div className="w-5 h-5 rounded bg-slate-700 mr-2 flex items-center justify-center overflow-hidden border border-slate-600">
                    <img src={attachment} className="w-full h-full object-cover" alt="thumb" />
                </div>
                <span className="text-xs text-slate-300 max-w-[150px] truncate mr-2 font-medium">图片已添加</span>
                <button onClick={clearAttachment} className="text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-slate-600 transition-colors">
                    <X size={14} />
                </button>
            </div>
        )}

        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileSelect}
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-3 mb-0.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-xl transition-all disabled:opacity-50 active:scale-95 bg-slate-800/50 border border-slate-700/50"
            title="上传图片"
          >
            <ImageIcon size={20} />
          </button>

          <div className="flex-1 relative">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={attachment ? "描述修改需求..." : "输入指令..."}
                rows={1}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                    }
                    // Auto-grow
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
                className="w-full bg-slate-800 text-white rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-slate-700 text-sm shadow-inner transition-all placeholder:text-slate-500 resize-none min-h-[46px] max-h-[120px]"
                disabled={isLoading}
            />
            
            {isLoading ? (
                <button
                    type="button"
                    onClick={handleStop}
                    className="absolute right-2 bottom-2 p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all animate-in zoom-in duration-200"
                    title="停止生成"
                >
                    <Square size={16} fill="currentColor" />
                </button>
            ) : (
                <button
                    type="submit"
                    disabled={!input.trim() && !attachment}
                    className="absolute right-2 bottom-2 p-2 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg disabled:text-slate-600 disabled:hover:bg-transparent transition-all active:scale-90"
                >
                    <Send size={18} />
                </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
});

export default ChatPanel;