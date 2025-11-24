
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CodeState } from '../types';
import { 
  RefreshCw, Loader2, Maximize2, Minimize2, 
  Smartphone, Tablet, Monitor, Layout, Lock
} from 'lucide-react';

interface PreviewProps {
  code: CodeState;
  sourceUrl?: string; // Optional URL to show in fake address bar
}

type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'responsive';

const Preview: React.FC<PreviewProps> = ({ code, sourceUrl = 'http://localhost:3000' }) => {
  const [srcDoc, setSrcDoc] = useState('');
  const [key, setKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [device, setDevice] = useState<DeviceType>('responsive');
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  // Check window size for responsive toolbar
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Debounce code updates to prevent flashing
  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => {
      const doc = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              /* Reset for preview consistency */
              body { margin: 0; padding: 0; }
              ${code.css}
            </style>
          </head>
          <body>
            ${code.html}
            <script>
              // Error Catching
              window.onerror = function(msg, url, line, col, error) {
                 document.body.innerHTML += '<div style="color:#ef4444; background: #fee2e2; padding: 12px; font-family: sans-serif; border-bottom: 1px solid #fecaca; font-size: 14px;"><strong>Runtime Error:</strong> ' + msg + '</div>';
                 return false;
              };
              
              try {
                ${code.js}
              } catch (err) {
                console.error(err);
              }
            </script>
          </body>
        </html>
      `;
      setSrcDoc(doc);
      setIsLoading(false);
    }, 600); // 600ms debounce for smoother typing experience

    return () => clearTimeout(timeout);
  }, [code]);

  const handleRefresh = () => {
    setKey(prev => prev + 1);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Helper to get width class based on device
  const getContainerStyle = () => {
    // On mobile, always responsive width (full)
    if (isMobileView) return { width: '100%', height: '100%' };

    switch (device) {
      case 'mobile': return { width: '375px', height: '100%' };
      case 'tablet': return { width: '768px', height: '100%' };
      case 'desktop': return { width: '100%', maxWidth: '1280px', height: '100%' };
      case 'responsive': default: return { width: '100%', height: '100%' };
    }
  };

  const previewContent = (
    <div 
      className={`flex flex-col bg-slate-900 transition-all duration-300 ease-in-out ${
        isFullscreen 
          ? 'fixed inset-0 z-[200] h-[100dvh] w-screen' 
          : 'h-full w-full relative'
      }`}
    >
      {/* --- Toolbar --- */}
      <div className={`flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 shrink-0 ${isFullscreen ? 'pt-[env(safe-area-inset-top)]' : ''}`}>
        
        {/* Device Toggles (Hidden on Mobile) */}
        {!isMobileView ? (
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
            <button 
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded transition-all ${device === 'mobile' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
              title="手机视图 (375px)"
            >
              <Smartphone size={16} />
            </button>
            <button 
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded transition-all ${device === 'tablet' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
              title="平板视图 (768px)"
            >
              <Tablet size={16} />
            </button>
            <button 
              onClick={() => setDevice('desktop')}
              className={`hidden sm:block p-1.5 rounded transition-all ${device === 'desktop' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
              title="桌面视图"
            >
              <Monitor size={16} />
            </button>
            <div className="w-px h-4 bg-slate-700 mx-1"></div>
            <button 
              onClick={() => setDevice('responsive')}
              className={`p-1.5 rounded transition-all ${device === 'responsive' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
              title="自适应宽度"
            >
              <Layout size={16} />
            </button>
          </div>
        ) : (
          <div className="text-sm font-semibold text-slate-300 flex items-center">
             <Layout className="w-4 h-4 mr-2 text-blue-400" />
             实时预览
          </div>
        )}

        {/* Resolution Label (Hidden on small mobile) */}
        <div className="hidden md:flex text-xs font-mono text-slate-500">
            {device === 'mobile' ? '375px' : device === 'tablet' ? '768px' : device === 'desktop' ? '1280px' : 'Responsive'}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
           <button 
              onClick={handleRefresh}
              className={`p-2 text-slate-400 hover:text-blue-400 transition-colors ${isLoading ? 'animate-spin text-blue-500' : ''}`}
              title="刷新"
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={toggleFullscreen}
              className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
              title={isFullscreen ? "退出全屏" : "全屏模式"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
        </div>
      </div>

      {/* --- Canvas Area --- */}
      <div className={`flex-1 relative overflow-hidden flex items-center justify-center ${isMobileView ? 'bg-white p-0' : 'bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] bg-slate-950 p-2 md:p-6'}`}>
        
        {/* Device Frame */}
        <div 
            className={`
                flex flex-col bg-white shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] overflow-hidden
                ${!isMobileView && device !== 'responsive' ? 'rounded-xl border-[8px] border-slate-800 ring-1 ring-white/10' : 'w-full h-full border-none rounded-none'}
            `}
            style={getContainerStyle()}
        >
            {/* Fake Browser Chrome (Address Bar) - Only show on Desktop simulation */}
            {!isMobileView && (
              <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex items-center space-x-3 shrink-0">
                  <div className="flex space-x-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                  </div>
                  
                  <div className="flex-1 flex items-center bg-white border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-600 shadow-sm relative">
                      <Lock size={10} className="mr-1.5 text-slate-400" />
                      <span className="truncate max-w-[150px] md:max-w-xs">{sourceUrl.replace(/^https?:\/\//, '')}</span>
                      {isLoading && (
                          <div className="absolute right-2">
                              <Loader2 size={12} className="animate-spin text-blue-500" />
                          </div>
                      )}
                  </div>
              </div>
            )}

            {/* Iframe Content */}
            <iframe
                key={key}
                title="Live Preview"
                srcDoc={srcDoc}
                className="flex-1 w-full h-full bg-white"
                sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                style={{ border: 'none' }}
            />
        </div>
      </div>
    </div>
  );

  // Use Portal to render outside of parent containers when in fullscreen mode
  if (isFullscreen) {
    return createPortal(previewContent, document.body);
  }

  return previewContent;
};

export default Preview;
