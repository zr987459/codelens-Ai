import React, { useState, useEffect } from 'react';
import { X, BookOpen, Rocket, Key, Code, FileCode, CheckCircle, ExternalLink, Package } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'start' | 'api' | 'features' | 'deploy'>('start');

  if (!isOpen) return null;

  const tabs = [
    { id: 'start', label: '快速开始', icon: Rocket },
    { id: 'api', label: '配置 API', icon: Key },
    { id: 'features', label: '核心功能', icon: Code },
    { id: 'deploy', label: '导出与部署', icon: Package },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10">
          <div className="flex items-center space-x-2 text-slate-100">
            <BookOpen className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-lg">CodeLens 使用指南</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-40 bg-slate-950 border-r border-slate-800 flex-col hidden sm:flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors border-l-2 ${
                    activeTab === tab.id 
                      ? 'bg-slate-800 text-blue-400 border-blue-500' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border-transparent'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-900 text-slate-300">
            
            {/* Mobile Tabs */}
            <div className="flex sm:hidden overflow-x-auto space-x-2 mb-6 pb-2 border-b border-slate-800">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                      activeTab === tab.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Icon size={12} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Sections */}
            <div className="space-y-6">
              
              {/* --- START --- */}
              {activeTab === 'start' && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <h3 className="text-xl font-bold text-white mb-4">欢迎使用 CodeLens AI</h3>
                  <p className="leading-relaxed">
                    CodeLens 是一个 AI 驱动的网页代码编辑器。您可以使用它来编写 HTML/CSS/JS，或者让 AI 帮您修改现有的网站。
                  </p>
                  
                  <div className="grid gap-4 mt-6">
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                      <h4 className="font-bold text-blue-400 mb-2 flex items-center"><CheckCircle size={16} className="mr-2"/> 1. 编写或导入</h4>
                      <p className="text-sm">在编辑器中手动写代码，或者在顶部输入网址导入现有网页。</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                      <h4 className="font-bold text-purple-400 mb-2 flex items-center"><CheckCircle size={16} className="mr-2"/> 2. AI 交互</h4>
                      <p className="text-sm">点击底部的 AI 助手，告诉它："把背景改成星空风格" 或 "帮我写一个贪吃蛇游戏"。</p>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                      <h4 className="font-bold text-emerald-400 mb-2 flex items-center"><CheckCircle size={16} className="mr-2"/> 3. 实时预览</h4>
                      <p className="text-sm">右侧（或移动端切换标签）可实时查看代码的运行效果。</p>
                    </div>
                  </div>
                </div>
              )}

              {/* --- API --- */}
              {activeTab === 'api' && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <h3 className="text-xl font-bold text-white mb-2">配置 AI 能力</h3>
                  <p className="text-sm text-slate-400 mb-4">CodeLens 需要连接大模型 API 才能工作。点击右上角的齿轮图标 <Rocket className="inline w-3 h-3"/> 进行配置。</p>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-blue-400 mb-2">方案 A：Google Gemini (官方/推荐)</h4>
                      <ul className="list-disc list-inside space-y-2 text-sm ml-2">
                        <li>访问 <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-blue-400 hover:underline">Google AI Studio</a> 获取 API Key。</li>
                        <li>在设置中选择 "Google 官方"，填入 Key。</li>
                        <li>支持 Gemini 2.5 Flash (速度快) 和 Gemini 3.0 Pro (能力强)。</li>
                      </ul>
                    </div>

                    <div className="border-t border-slate-800 pt-4">
                      <h4 className="font-semibold text-purple-400 mb-2">方案 B：硅基流动 / DeepSeek (国内直连)</h4>
                      <ul className="list-disc list-inside space-y-2 text-sm ml-2">
                        <li>注册 <a href="https://cloud.siliconflow.cn/" target="_blank" className="text-purple-400 hover:underline">硅基流动 (SiliconFlow)</a> 账号。</li>
                        <li>创建一个新的 API Key。</li>
                        <li>在设置中选择 "硅基流动 / 自定义"。</li>
                        <li>填入 Key，Base URL 保持默认即可。</li>
                        <li>自定义模型 ID 可填：<code className="bg-slate-800 px-1 rounded">deepseek-ai/DeepSeek-V3</code></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* --- FEATURES --- */}
              {activeTab === 'features' && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <h3 className="text-xl font-bold text-white mb-4">核心功能技巧</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-900/30 text-blue-400 rounded-lg"><Code size={20} /></div>
                      <div>
                        <h4 className="font-bold text-slate-200">网站导入分析</h4>
                        <p className="text-sm text-slate-400 mt-1">在顶部输入 URL（需支持跨域访问），点击导入。AI 会自动分析代码结构。如果导入失败，尝试上传 HTML 文件。</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-amber-900/30 text-amber-400 rounded-lg"><FileCode size={20} /></div>
                      <div>
                        <h4 className="font-bold text-slate-200">文件上传</h4>
                        <p className="text-sm text-slate-400 mt-1">点击顶部的文件夹图标 <FileCode className="inline w-3 h-3"/>，上传本地的 .html 文件，程序会自动分离 CSS 和 JS 以便编辑。</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                        <div className="p-2 bg-emerald-900/30 text-emerald-400 rounded-lg"><Package size={20} /></div>
                        <div>
                        <h4 className="font-bold text-slate-200">Thinking 模型</h4>
                        <p className="text-sm text-slate-400 mt-1">在模型下拉框选择 "Gemini 2.5 (Thinking)"。这是最新的推理模型，适合解决复杂的逻辑 bug 或生成复杂的算法代码。</p>
                        </div>
                    </div>
                  </div>
                </div>
              )}

               {/* --- DEPLOY --- */}
               {activeTab === 'deploy' && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <h3 className="text-xl font-bold text-white mb-4">导出与部署</h3>
                  <p className="text-sm text-slate-400">将您的作品发布到互联网上。</p>

                  <div className="space-y-4 mt-4">
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <h4 className="font-bold text-white flex items-center mb-3">
                            <Package className="w-5 h-5 mr-2 text-blue-400" />
                            1. 打包项目
                        </h4>
                        <p className="text-sm text-slate-300 mb-3">
                            点击顶部工具栏的 <b>打包下载 (ZIP)</b> 按钮。您将获得一个压缩包，解压后包含：
                        </p>
                        <ul className="list-disc list-inside text-xs text-slate-400 space-y-1 font-mono bg-slate-900 p-3 rounded-lg">
                            <li>index.html (网页结构)</li>
                            <li>style.css (样式表)</li>
                            <li>script.js (脚本逻辑)</li>
                        </ul>
                    </div>

                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                        <h4 className="font-bold text-white flex items-center mb-3">
                            <Rocket className="w-5 h-5 mr-2 text-green-400" />
                            2. 免费部署
                        </h4>
                        <p className="text-sm text-slate-300 mb-2">
                            推荐使用以下免费服务托管您的静态网站：
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                             <a href="https://app.netlify.com/drop" target="_blank" className="block p-3 bg-slate-900 hover:bg-slate-950 border border-slate-700 hover:border-blue-500 rounded-lg transition-colors group">
                                <div className="font-bold text-blue-400 mb-1 flex items-center">Netlify Drop <ExternalLink size={12} className="ml-1 opacity-50 group-hover:opacity-100"/></div>
                                <div className="text-xs text-slate-500">最简单。直接把解压后的文件夹拖进去即可生成的网站链接。</div>
                             </a>
                             <a href="https://vercel.com/new" target="_blank" className="block p-3 bg-slate-900 hover:bg-slate-950 border border-slate-700 hover:border-white rounded-lg transition-colors group">
                                <div className="font-bold text-white mb-1 flex items-center">Vercel <ExternalLink size={12} className="ml-1 opacity-50 group-hover:opacity-100"/></div>
                                <div className="text-xs text-slate-500">专业级。需要安装 CLI 或连接 GitHub 仓库。速度极快。</div>
                             </a>
                        </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;