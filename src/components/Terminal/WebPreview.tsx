'use client';

import React, { useEffect, useRef } from 'react';
import { RefreshCw, Monitor, Smartphone, ExternalLink } from 'lucide-react';

interface WebPreviewProps {
  code: string;
}

export const WebPreview: React.FC<WebPreviewProps> = ({ code }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [deviceMode, setDeviceMode] = React.useState<'desktop' | 'mobile'>('desktop');

  const updateIframeContent = () => {
    if (!iframeRef.current) return;
    const document = iframeRef.current.contentDocument;
    if (!document) return;

    document.open();
    document.write(code);
    document.close();
  };

  useEffect(() => {
    updateIframeContent();
  }, [code]);

  return (
    <div className="flex-1 h-full bg-dark-950 flex flex-col overflow-hidden border-l border-white/10">
      {/* Top Bar */}
      <div className="h-10 bg-dark-850 border-b border-white/10 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-slate-200">Live HTML/CSS/JS View</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`p-1 rounded ${deviceMode === 'desktop' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Desktop View"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`p-1 rounded ${deviceMode === 'mobile' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}
            title="Mobile View"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={updateIframeContent}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-all"
            title="Refresh Preview"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* iframe Container */}
      <div className="flex-1 bg-slate-950 flex items-center justify-center p-2 overflow-auto">
        <div className={`h-full bg-white transition-all duration-300 rounded-lg shadow-2xl overflow-hidden ${
          deviceMode === 'mobile' ? 'w-[375px] h-[667px] border-8 border-slate-800 rounded-[2rem]' : 'w-full h-full'
        }`}>
          <iframe
            ref={iframeRef}
            title="Live Web Preview"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-modals allow-forms allow-popups"
          />
        </div>
      </div>
    </div>
  );
};
