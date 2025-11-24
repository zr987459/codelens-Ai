import React, { useState } from 'react';
import { X, Sparkles, FileCode, LayoutTemplate, Loader2, ArrowRight } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (type: 'ai' | 'blank' | 'template', prompt?: string) => void;
  isLoading?: boolean;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onCreate, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'blank' | 'template'>('ai');
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center space-x-2 text-slate-100">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-lg">新建项目</h2>
          </div>
          {!isLoading && (
            <button 
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-full"
            >
                <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-3 mb-6">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                activeTab === 'ai' 
                  ? 'bg-blue-600/10 border-blue-500 text-blue-400 ring-1 ring-blue-500/50' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-6 h-6 mb-2" />
              <span className="text-xs font-bold">AI 智能生成</span>
            </button>
            <button
              onClick={() => setActiveTab('template')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                activeTab === 'template' 
                  ? 'bg-purple-600/10 border-purple-500 text-purple-400 ring-1 ring-purple-500/50' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <LayoutTemplate className="w-6 h-6 mb-2" />
              <span className="text-xs font-bold">使用模板</span>
            </button>
            <button
              onClick={() => setActiveTab('blank')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                activeTab === 'blank' 
                  ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 ring-1 ring-emerald-500/50' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <FileCode className="w-6 h-6 mb-2" />
              <span className="text-xs font-bold">空白项目</span>
            </button>
          </div>

          <div className="min-h-[150px]">
            {activeTab === 'ai' && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">你想做什么网站？</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="例如：帮我做一个赛博朋克风格的个人博客，包含英雄区域和作品展示网格..."
                    className="w-full h-32 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={() => onCreate('ai', prompt)}
                  disabled={!prompt.trim() || isLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-semibold shadow-lg shadow-blue-900/20 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      正在生成...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      开始生成
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === 'template' && (
              <div className="space-y-4 animate-in fade-in duration-300 flex flex-col h-full justify-between">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                  <h4 className="font-bold text-white mb-2">现代落地页模板</h4>
                  <p className="text-sm text-slate-400">包含响应式导航栏、Hero 区域、特性卡片网格和页脚的完整着陆页。</p>
                </div>
                <button
                  onClick={() => onCreate('template')}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold shadow-lg shadow-purple-900/20 flex items-center justify-center transition-all mt-4"
                >
                  使用模板创建
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            )}

            {activeTab === 'blank' && (
              <div className="space-y-4 animate-in fade-in duration-300 flex flex-col h-full justify-between">
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                  <h4 className="font-bold text-white mb-2">空白画布</h4>
                  <p className="text-sm text-slate-400">仅包含最基础的 HTML5 结构、CSS Reset 和一个空的 JS 文件。适合从零开始手写代码。</p>
                </div>
                <button
                  onClick={() => onCreate('blank')}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-lg shadow-emerald-900/20 flex items-center justify-center transition-all mt-4"
                >
                  创建空白项目
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default NewProjectModal;