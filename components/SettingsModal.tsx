import React, { useState, useEffect } from 'react';
import { X, Key, ExternalLink, Eye, EyeOff, Check, AlertCircle, Server, Globe } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ApiProvider = 'google' | 'siliconflow';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [provider, setProvider] = useState<ApiProvider>('google');
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.siliconflow.cn/v1');
  const [customModel, setCustomModel] = useState('');
  
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const storedProvider = (localStorage.getItem('codelens_provider') as ApiProvider) || 'google';
      const storedKey = localStorage.getItem('codelens_api_key') || '';
      const storedBaseUrl = localStorage.getItem('codelens_base_url') || 'https://api.siliconflow.cn/v1';
      const storedCustomModel = localStorage.getItem('codelens_custom_model') || '';
      
      setProvider(storedProvider);
      setApiKey(storedKey);
      setBaseUrl(storedBaseUrl);
      setCustomModel(storedCustomModel);
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('codelens_provider', provider);
    
    if (!apiKey.trim()) {
      localStorage.removeItem('codelens_api_key');
    } else {
      localStorage.setItem('codelens_api_key', apiKey.trim());
    }

    localStorage.setItem('codelens_base_url', baseUrl.trim());
    localStorage.setItem('codelens_custom_model', customModel.trim());

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const handleAIStudioSelect = async () => {
    if (window.aistudio?.openSelectKey) {
      try {
        await window.aistudio.openSelectKey();
        alert("已通过 AI Studio 选择 Key。请确保“API 提供商”选择为 Google 官方。");
        setProvider('google'); // Force switch back to google
      } catch (e) {
        console.error(e);
      }
    } else {
      alert("当前环境不支持 AI Studio Key 选择器。");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 sticky top-0 backdrop-blur-md z-10">
          <div className="flex items-center space-x-2 text-slate-100">
            <Key className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-lg">API 配置</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Provider Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              API 提供商
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setProvider('google')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                  provider === 'google' 
                    ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" className="w-6 h-6 mb-2" alt="Google" />
                <span className="text-xs font-bold">Google 官方</span>
              </button>
              <button
                onClick={() => setProvider('siliconflow')}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                  provider === 'siliconflow' 
                    ? 'bg-purple-600/10 border-purple-500 text-purple-400' 
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <Server className="w-6 h-6 mb-2" />
                <span className="text-xs font-bold">硅基流动 / 自定义</span>
              </button>
            </div>
          </div>
          
          {/* API Key Input */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">
              API Key <span className="text-slate-500 font-normal">(必填)</span>
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setSaved(false);
                }}
                placeholder={provider === 'google' ? "AIzaSy..." : "sk-..."}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-4 pr-12 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                type="button"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {provider === 'google' && (
               <p className="text-xs text-slate-500">
                  留空则尝试使用系统环境变量。
               </p>
            )}
          </div>

          {/* SiliconFlow / Custom Specific Settings */}
          {provider === 'siliconflow' && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300 pt-2 border-t border-slate-800">
               
               <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-300 flex items-center">
                    <Globe className="w-3.5 h-3.5 mr-1.5 text-purple-400" /> Base URL
                  </label>
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://api.siliconflow.cn/v1"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-mono"
                  />
                  <p className="text-xs text-slate-500">
                    兼容 OpenAI 格式的接口地址。硅基流动默认为: <code className="bg-slate-800 px-1 rounded">https://api.siliconflow.cn/v1</code>
                  </p>
               </div>

               <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-300">
                     自定义模型 ID (可选)
                  </label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="例如: google/gemini-2.0-flash-exp"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-mono"
                  />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    若填写，将强制使用此 ID，忽略顶部的模型选择器。<br/>
                    硅基流动示例: <span className="text-slate-400">deepseek-ai/DeepSeek-V3</span>
                  </p>
               </div>
            </div>
          )}

          {/* Google / AI Studio Helper */}
          {provider === 'google' && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
               <button
                onClick={handleAIStudioSelect}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700 flex items-center justify-center space-x-2"
               >
                  <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg" className="w-4 h-4" alt="Gemini" />
                  <span>使用 Google 账号选择 (AI Studio)</span>
               </button>
            </div>
          )}

          {/* Info Box */}
          <div className={`rounded-lg p-3 flex items-start space-x-3 border ${provider === 'google' ? 'bg-blue-900/20 border-blue-800/50' : 'bg-purple-900/20 border-purple-800/50'}`}>
            <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${provider === 'google' ? 'text-blue-400' : 'text-purple-400'}`} />
            <div className={`text-xs leading-relaxed ${provider === 'google' ? 'text-blue-200/80' : 'text-purple-200/80'}`}>
              {provider === 'google' 
                ? '使用 Google 官方 API，支持最新的 Gemini 3.0 Pro 和 Thinking 模型。' 
                : '使用硅基流动、DeepSeek 或其他兼容 OpenAI 协议的 API。请确保 Base URL 正确。'
              }
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={handleSave}
            className={`w-full py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
              saved 
                ? 'bg-emerald-600 text-white hover:bg-emerald-500' 
                : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-blue-500/25'
            }`}
          >
            {saved ? (
              <>
                <Check size={18} />
                <span>已保存</span>
              </>
            ) : (
              <span>保存配置</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;