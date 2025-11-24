
import React, { useState, useRef, useEffect } from 'react';
import { Layout, Code2, Eye, Cpu, Globe, ArrowRight, RotateCw, Sparkles, Download, Copy, Check, Settings, ChevronDown, AlertTriangle, ExternalLink, MessageSquare, X, Menu, Upload, FileUp, HelpCircle, Package, Trash2, RefreshCw, Plus } from 'lucide-react';
import JSZip from 'jszip';
import { EditorTab, CodeState } from './types';
import { INITIAL_HTML, INITIAL_CSS, INITIAL_JS, BLANK_HTML, BLANK_CSS, BLANK_JS } from './constants';
import Editor from './components/Editor';
import Preview from './components/Preview';
import ChatPanel, { ChatPanelRef } from './components/ChatPanel';
import SettingsModal from './components/SettingsModal';
import HelpModal from './components/HelpModal';
import NewProjectModal from './components/NewProjectModal';
import Logo from './components/Logo';
import { fetchWebsite, parseHtmlContent } from './services/scraper';
import { analyzeAndModifyCode } from './services/gemini';

type MobileTab = 'code' | 'preview' | 'chat';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<EditorTab>(EditorTab.HTML);
  
  // Initialize code from localStorage or fallback to defaults
  const [code, setCode] = useState<CodeState>(() => {
    try {
      const savedCode = localStorage.getItem('codelens_project_code');
      if (savedCode) {
        return JSON.parse(savedCode);
      }
    } catch (e) {
      console.error("Failed to load saved code", e);
    }
    return {
      html: INITIAL_HTML,
      css: INITIAL_CSS,
      js: INITIAL_JS
    };
  });

  const [urlInput, setUrlInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [model, setModel] = useState("gemini-2.5-flash"); // Default model
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showApiKeyError, setShowApiKeyError] = useState(false);
  
  // Mobile specific states
  const [mobileTab, setMobileTab] = useState<MobileTab>('code');
  const [showMobileUrlBar, setShowMobileUrlBar] = useState(false);
  
  const chatRef = useRef<ChatPanelRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem('codelens_project_code', JSON.stringify(code));
  }, [code]);

  // Check for API key and Tutorial on mount
  useEffect(() => {
    const checkKey = async () => {
        const manualKey = localStorage.getItem('codelens_api_key');
        const provider = localStorage.getItem('codelens_provider');
        // If google provider and no manual key, check env. If siliconflow, strictly check manual key.
        if (provider !== 'siliconflow' && !manualKey && (!process.env.API_KEY || process.env.API_KEY === 'undefined')) {
             setShowApiKeyError(true);
        }
    }
    checkKey();

    // Check tutorial seen
    const hasSeenTutorial = localStorage.getItem('codelens_tutorial_seen');
    if (!hasSeenTutorial) {
        setIsHelpOpen(true);
        localStorage.setItem('codelens_tutorial_seen', 'true');
    }
  }, []);

  const handleCodeChange = (type: EditorTab, value: string) => {
    setCode(prev => {
      switch (type) {
        case EditorTab.HTML: return { ...prev, html: value };
        case EditorTab.CSS: return { ...prev, css: value };
        case EditorTab.JS: return { ...prev, js: value };
        default: return prev;
      }
    });
  };

  const handleApplyAIChanges = (updates: Partial<CodeState>) => {
    setCode(prev => ({
      ...prev,
      html: updates.html ?? prev.html,
      css: updates.css ?? prev.css,
      js: updates.js ?? prev.js
    }));
  };

  const handleCreateProject = async (type: 'ai' | 'blank' | 'template', prompt?: string) => {
    if (type === 'blank') {
      setCode({ html: BLANK_HTML, css: BLANK_CSS, js: BLANK_JS });
      setUrlInput('');
      setIsNewProjectOpen(false);
      chatRef.current?.addMessage('model', '已创建新的空白项目。');
    } else if (type === 'template') {
      setCode({ html: INITIAL_HTML, css: INITIAL_CSS, js: INITIAL_JS });
      setUrlInput('');
      setIsNewProjectOpen(false);
      chatRef.current?.addMessage('model', '已加载标准落地页模板。');
    } else if (type === 'ai' && prompt) {
      // AI Generation Logic
      setIsGenerating(true);
      try {
        const blankCode = { html: BLANK_HTML, css: BLANK_CSS, js: BLANK_JS };
        // We use the analyze function but with a specific creation prompt
        const response = await analyzeAndModifyCode(
          blankCode, 
          `Create a brand new website based on this request: "${prompt}". Write the full HTML, CSS, and JS from scratch. Do not assume any existing code.`, 
          model
        );

        if (response.codeUpdates) {
          handleApplyAIChanges(response.codeUpdates);
          setUrlInput('');
          setIsNewProjectOpen(false);
          chatRef.current?.addMessage('model', `已为您生成项目：${prompt}\n\n${response.analysis}`);
        } else {
          alert("AI 生成未能返回代码，请重试。");
        }
      } catch (e: any) {
        console.error(e);
        alert(`生成失败: ${e.message}`);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleImportWebsite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsImporting(true);
    try {
      const importedCode = await fetchWebsite(urlInput);
      setCode(importedCode);
      setShowMobileUrlBar(false); // Close bar on mobile after import
      
      // Notify Chat
      if (chatRef.current) {
        chatRef.current.triggerAnalysis(`我已成功导入 ${urlInput} 的源代码。请详细分析这个网页的代码逻辑、页面结构和功能实现，并指出可以优化的地方。`);
        // On mobile, switch to chat to see the analysis starting
        if (window.innerWidth < 768) {
            setMobileTab('chat');
        }
      }
    } catch (error: any) {
      if (chatRef.current) {
        chatRef.current.addMessage('model', `导入失败: ${error.message}`);
         if (window.innerWidth < 768) {
            setMobileTab('chat');
        }
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
            try {
                const parsedCode = parseHtmlContent(content);
                setCode(parsedCode);
                setShowMobileUrlBar(false);
                if (chatRef.current) {
                    chatRef.current.triggerAnalysis("我已上传了一个本地 HTML 文件。请分析其结构和代码。");
                    if (window.innerWidth < 768) {
                        setMobileTab('chat');
                    }
                }
            } catch (error) {
                console.error("Parse error", error);
                alert("解析 HTML 文件失败");
            }
        }
    };
    reader.readAsText(file);
    // Reset input so same file can be uploaded again if needed
    e.target.value = '';
  };

  const handleManualAnalysis = () => {
    if (chatRef.current) {
      chatRef.current.triggerAnalysis("请分析当前的 HTML、CSS 和 JS 代码。检查是否有逻辑错误、样式冲突，并给出改进建议。");
      if (window.innerWidth < 768) {
        setMobileTab('chat');
      }
    }
  };

  const generateFullSource = () => {
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>CodeLens Export</title>
<style>
/* CSS Styles */
${code.css}
</style>
</head>
<body>

${code.html}

<script>
/* JavaScript Logic */
${code.js}
</script>
</body>
</html>`;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generateFullSource());
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadCode = () => {
    const fullSource = generateFullSource();
    const blob = new Blob([fullSource], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-website.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportZip = async () => {
    try {
        const zip = new JSZip();
        
        // 1. HTML File (Clean, linking to external files)
        const cleanHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My CodeLens Project</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

${code.html}

    <script src="script.js"></script>
</body>
</html>`;

        zip.file("index.html", cleanHtml);
        zip.file("style.css", code.css);
        zip.file("script.js", code.js);
        zip.file("README.md", `# CodeLens Export Project\n\nGenerated by CodeLens AI.\n\n## How to run\nSimply open index.html in your browser.`);

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = "my-website-project.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (e) {
        console.error("ZIP Generation failed", e);
        alert("打包失败，请重试。");
    }
  };

  const handleResetProject = () => {
     if(confirm("确定要重置项目吗？所有未保存的更改将丢失。")) {
         setCode({ html: INITIAL_HTML, css: INITIAL_CSS, js: INITIAL_JS });
         localStorage.removeItem('codelens_project_code');
         chatRef.current?.addMessage('model', '项目已重置为默认模板。');
     }
  };

  return (
    // Root container: 100dvh handles mobile browser bars correctly.
    // Safe areas are handled by spacer divs to keep logic clean.
    <div className="fixed inset-0 w-full h-[100dvh] flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* Top Safe Area Spacer - matches device notch/status bar */}
      <div className="h-[env(safe-area-inset-top)] bg-slate-900 w-full shrink-0 z-50"></div>

      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".html,.htm" 
        className="hidden" 
      />

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      <HelpModal 
        isOpen={isHelpOpen} 
        onClose={() => setIsHelpOpen(false)} 
      />

      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreate={handleCreateProject}
        isLoading={isGenerating}
      />

      {/* API Key Missing Overlay */}
      {showApiKeyError && !isSettingsOpen && !isHelpOpen && (
          <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-6">
              <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">配置 AI 密钥</h2>
                  <p className="text-slate-400 mb-6 leading-relaxed text-sm">
                      要使用 AI 分析和高级模型，您需要配置 Gemini API Key。<br/>
                      <span className="opacity-70">支持 Google 官方 Key 或 硅基流动/DeepSeek 等 OpenAI 兼容接口。</span>
                  </p>
                  
                  <div className="space-y-3">
                    <button 
                        onClick={() => {
                            setShowApiKeyError(false);
                            setIsSettingsOpen(true);
                        }}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                    >
                        立即配置
                    </button>
                    <a 
                        href="https://ai.google.dev/gemini-api/docs/billing" 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center justify-center space-x-1 text-xs text-slate-500 hover:text-blue-400 transition-colors py-2"
                    >
                        <span>如何获取 Google Key?</span>
                        <ExternalLink size={12} />
                    </a>
                  </div>
              </div>
          </div>
      )}

      {/* Header */}
      <header className="flex flex-col border-b border-slate-800 bg-slate-900 shrink-0 z-40 relative">
        <div className="h-14 flex items-center justify-between px-3 md:px-6">
          
          {/* Left: New Project & Model Selector */}
          <div className="flex items-center space-x-2 md:space-x-4 max-w-[65%]">
             <button
               onClick={() => setIsNewProjectOpen(true)}
               className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/20 transition-all shrink-0 active:scale-95"
               title="新建项目"
            >
               <Plus size={18} strokeWidth={2.5} />
            </button>

            {/* Desktop Logo */}
            <div className="flex items-center space-x-2 hidden md:flex">
               <Logo size={24} className="mr-1" />
               <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  CodeLens AI
               </span>
            </div>

            {/* Model Selector */}
            <div className="relative group shrink-1 min-w-[100px] max-w-[180px]">
                <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full appearance-none bg-slate-800 border border-slate-700/50 text-slate-300 text-[11px] md:text-xs font-medium rounded-lg pl-7 md:pl-8 pr-6 md:pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-slate-700 transition-colors truncate"
                >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-2.5-flash-thinking">Gemini 2.5 Thinking</option>
                    <option value="gemini-2.5-flash-lite-latest">Gemini 2.5 Lite</option>
                    <option value="gemini-3-pro-preview">Gemini 3.0 Pro</option>
                </select>
                <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${model.includes('pro') ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : model.includes('thinking') ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'} animate-pulse pointer-events-none`}></div>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
            </div>
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center space-x-1 md:space-x-2">
             
             {/* Mobile: Toggle URL Bar */}
             <button 
                onClick={() => setShowMobileUrlBar(!showMobileUrlBar)}
                className={`md:hidden p-2 rounded-lg transition-all active:scale-95 ${showMobileUrlBar ? 'bg-slate-700 text-blue-400' : 'text-slate-400 hover:bg-slate-800'}`}
             >
                 <Globe className="w-5 h-5" />
             </button>

             {/* File Upload (Icon Only) */}
             <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-all active:scale-95"
                title="上传 HTML"
             >
                 <FileUp className="w-5 h-5 md:w-4 md:h-4" />
             </button>

             {/* Desktop Export Group */}
             <div className="hidden md:flex items-center bg-slate-800 rounded-lg border border-slate-700/50 mr-2 p-0.5">
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-colors rounded-md"
                  title="复制"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <div className="w-px h-3 bg-slate-700 mx-1"></div>
                <button
                  onClick={handleDownloadCode}
                  className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-blue-400 transition-colors rounded-md"
                  title="下载 HTML"
                >
                  <Download className="w-4 h-4" />
                </button>
                <div className="w-px h-3 bg-slate-700 mx-1"></div>
                <button
                  onClick={handleExportZip}
                  className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-purple-400 transition-colors rounded-md"
                  title="导出 ZIP"
                >
                  <Package className="w-4 h-4" />
                </button>
             </div>

             {/* Smart Analysis (Icon on Mobile, Text on Desktop) */}
             <button
                onClick={handleManualAnalysis}
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2.5 md:px-4 py-1.5 rounded-lg text-sm font-medium transition-all shadow-md active:scale-95"
                title="智能分析"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden md:inline">分析</span>
              </button>
             
             {/* Settings */}
             <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-all active:scale-95"
                title="设置"
             >
               <Settings className="w-5 h-5 md:w-4 md:h-4" />
             </button>

              {/* Desktop Help/Reset */}
              <button
                onClick={() => setIsHelpOpen(true)}
                className="hidden md:flex p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition-all"
                title="帮助"
             >
                <HelpCircle className="w-4 h-4" />
             </button>
          </div>
        </div>
        
        {/* URL Bar - Collapsible */}
        <div className={`
            bg-slate-950 border-t border-slate-800 flex items-center px-4 space-x-2 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${showMobileUrlBar ? 'h-14 opacity-100 border-b border-slate-800' : 'h-0 md:h-12 opacity-0 md:opacity-100 md:border-t'}
        `}>
          <div className="flex-1 max-w-3xl flex items-center relative">
            <Globe className="absolute left-3 w-4 h-4 text-slate-500" />
            <form onSubmit={handleImportWebsite} className="flex-1 flex w-full">
              <input 
                type="text" 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="输入网址 (例如: example.com) 导入..."
                className="w-full bg-slate-900 text-slate-200 text-sm rounded-l-lg border border-r-0 border-slate-700 pl-9 pr-4 py-2 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
              <button 
                type="submit"
                disabled={isImporting || !urlInput}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-sm font-medium rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[70px] justify-center"
              >
                {isImporting ? <RotateCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
          {/* Mobile Export Buttons shown inside URL bar area for space efficiency */}
          <div className="flex md:hidden items-center space-x-1 ml-2 border-l border-slate-800 pl-2">
             <button onClick={handleExportZip} className="p-2 text-purple-400 bg-slate-900 rounded-lg border border-slate-700">
                <Package size={16} />
             </button>
             <button onClick={handleResetProject} className="p-2 text-red-400 bg-slate-900 rounded-lg border border-slate-700">
                <Trash2 size={16} />
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Left Column: Code Editor */}
        <div className={`
            w-full md:w-1/2 flex-col border-r border-slate-800 absolute md:relative inset-0 bg-slate-950 z-20 md:z-auto transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${mobileTab === 'code' ? 'flex translate-x-0' : 'translate-x-[-100%] md:translate-x-0 md:flex hidden'}
        `}>
          {/* Editor Tabs */}
          <div className="flex bg-slate-900 border-b border-slate-800 shrink-0">
            {Object.values(EditorTab).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-2 md:px-6 py-3 text-xs font-bold tracking-wide transition-colors border-r border-slate-800 ${
                  activeTab === tab 
                    ? 'bg-slate-800 text-blue-400 border-b-2 border-b-blue-500' 
                    : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex-1 relative overflow-hidden bg-slate-900/50">
            <Editor language="html" code={code.html} isActive={activeTab === EditorTab.HTML} onChange={(val) => handleCodeChange(EditorTab.HTML, val)} />
            <Editor language="css" code={code.css} isActive={activeTab === EditorTab.CSS} onChange={(val) => handleCodeChange(EditorTab.CSS, val)} />
            <Editor language="javascript" code={code.js} isActive={activeTab === EditorTab.JS} onChange={(val) => handleCodeChange(EditorTab.JS, val)} />
          </div>
        </div>

        {/* Right Column: Preview & AI */}
        <div className={`
            w-full md:w-1/2 flex-col bg-slate-950 absolute md:relative inset-0 z-20 md:z-auto transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${mobileTab !== 'code' ? 'flex translate-x-0' : 'translate-x-[100%] md:translate-x-0 md:flex hidden'}
        `}>
          
          {/* Preview Section */}
          <div className={`
             flex flex-col transition-all duration-300 relative
             ${mobileTab === 'preview' ? 'h-full flex-1' : 'hidden md:flex md:h-1/2'}
          `}>
            <Preview code={code} sourceUrl={urlInput || 'http://localhost:3000'} />
          </div>

          {/* Chat Section */}
          <div className={`
             flex flex-col transition-all duration-300 border-t border-slate-800
             ${mobileTab === 'chat' ? 'h-full flex-1' : 'hidden md:flex md:h-1/2'}
          `}>
            <ChatPanel 
              ref={chatRef}
              currentCode={code} 
              onApplyChanges={handleApplyAIChanges} 
              model={model}
            />
          </div>

        </div>
      </main>

      {/* Mobile Bottom Navigation - Glassmorphism */}
      <nav className="md:hidden bg-slate-900/90 backdrop-blur-md border-t border-slate-800/50 flex justify-around items-center h-[3.5rem] shrink-0 z-50 pb-[env(safe-area-inset-bottom)] box-content">
        <button 
          onClick={() => setMobileTab('code')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${mobileTab === 'code' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Code2 size={22} strokeWidth={mobileTab === 'code' ? 2.5 : 2} />
        </button>
        <button 
          onClick={() => setMobileTab('preview')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${mobileTab === 'preview' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Eye size={22} strokeWidth={mobileTab === 'preview' ? 2.5 : 2} />
        </button>
        <button 
          onClick={() => setMobileTab('chat')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${mobileTab === 'chat' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <div className="relative">
             <MessageSquare size={22} strokeWidth={mobileTab === 'chat' ? 2.5 : 2} />
             {isGenerating && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"></span>}
          </div>
        </button>
      </nav>
      
    </div>
  );
};

export default App;
