'use client';

import React, { useState } from 'react';
import { 
  Terminal as TerminalIcon, 
  Trash2, 
  Share2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  Keyboard,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { ExecutionResult } from '@/lib/types';

interface OutputConsoleProps {
  result: ExecutionResult | null;
  isExecuting: boolean;
  onClear: () => void;
  onBroadcastOutput?: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  stdin: string;
  onStdinChange: (val: string) => void;
  codeContent?: string;
}

export const OutputConsole: React.FC<OutputConsoleProps> = ({
  result,
  isExecuting,
  onClear,
  onBroadcastOutput,
  isExpanded,
  onToggleExpand,
  stdin,
  onStdinChange,
  codeContent = '',
}) => {
  const [activeTab, setActiveTab] = useState<'output' | 'stdin'>('output');

  // Detect if code requires interactive input (cin, input(), Scanner, scanf)
  const requiresInput = /cin\s*>>|input\s*\(|Scanner|scanf\s*\(|readline\s*\(/i.test(codeContent);

  return (
    <div className={`bg-dark-900 border-t border-white/10 flex flex-col transition-all duration-300 ${
      isExpanded ? 'h-64 sm:h-72' : 'h-10'
    }`}>
      {/* Console Header Bar */}
      <div 
        onClick={onToggleExpand}
        className="h-10 bg-dark-850 border-b border-white/5 px-4 flex items-center justify-between cursor-pointer select-none hover:bg-dark-800 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-dark-950 p-0.5 rounded-lg border border-white/10" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => { setActiveTab('output'); if (!isExpanded) onToggleExpand(); }}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'output' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              <span>Terminal Output</span>
            </button>

            <button
              onClick={() => { setActiveTab('stdin'); if (!isExpanded) onToggleExpand(); }}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-all relative ${
                activeTab === 'stdin' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Program Input (stdin)</span>
              {stdin.trim() && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>
          </div>

          {/* Stdin required notification badge */}
          {requiresInput && (
            <span className="animate-pulse bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-medium hidden md:flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-amber-400" />
              <span>Code expects input (cin/input)</span>
            </span>
          )}

          {/* Status Badge */}
          {result && activeTab === 'output' && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
              result.code === 0
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {result.code === 0 ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              {result.code === 0 ? 'Exit 0' : `Exit ${result.code}`}
            </span>
          )}

          {result?.executionTime !== undefined && activeTab === 'output' && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono hidden sm:flex">
              <Clock className="w-3 h-3 text-slate-500" />
              {result.executionTime}ms
            </span>
          )}
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Broadcast Output button */}
          {result && onBroadcastOutput && activeTab === 'output' && (
            <button
              onClick={onBroadcastOutput}
              className="px-2.5 py-1 bg-brand-600/20 hover:bg-brand-600/40 text-brand-300 border border-brand-500/30 rounded text-xs font-medium flex items-center gap-1 transition-all"
              title="Broadcast execution results to room"
            >
              <Share2 className="w-3 h-3" />
              <span className="hidden sm:inline">Broadcast</span>
            </button>
          )}

          {/* Clear Console */}
          {activeTab === 'output' && (
            <button
              onClick={onClear}
              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all"
              title="Clear output"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Toggle Expand / Collapse */}
          <button
            onClick={onToggleExpand}
            className="p-1 text-slate-400 hover:text-white rounded transition-all"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      {isExpanded && (
        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto bg-dark-950/90 text-slate-200 select-text leading-relaxed">
          {activeTab === 'output' ? (
            isExecuting ? (
              <div className="flex items-center gap-2 text-brand-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping"></span>
                <span>Compiling and executing code with provided stdin input...</span>
              </div>
            ) : result ? (
              <div className="space-y-2">
                {result.stdout && (
                  <div>
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">STDOUT:</div>
                    <pre className="text-emerald-400 whitespace-pre-wrap font-mono">{result.stdout}</pre>
                  </div>
                )}

                {result.stderr && (
                  <div>
                    <div className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider mb-1">STDERR:</div>
                    <pre className="text-rose-400 whitespace-pre-wrap font-mono">{result.stderr}</pre>
                  </div>
                )}

                {!result.stdout && !result.stderr && (
                  <div className="text-slate-500 italic">Code executed successfully with no output returned.</div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 flex flex-col items-center justify-center h-full gap-2 text-center">
                <span>Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-slate-300">Run Code</kbd> to compile.</span>
                {requiresInput && (
                  <p className="text-amber-400 text-xs flex items-center gap-1 font-sans">
                    <Sparkles className="w-3.5 h-3.5" />
                    Tip: Enter input values in the <strong>Program Input (stdin)</strong> tab before running!
                  </p>
                )}
              </div>
            )
          ) : (
            /* Program Stdin Input Tab */
            <div className="h-full flex flex-col space-y-2 font-sans">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Keyboard className="w-4 h-4 text-brand-cyan" />
                  <span>Program Standard Input (stdin)</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  Enter inputs line-by-line for program statements like <code className="text-brand-400">cin &gt;&gt; x</code>, <code className="text-brand-400">input()</code>, or <code className="text-brand-400">Scanner</code>
                </span>
              </div>

              <textarea
                value={stdin}
                onChange={(e) => onStdinChange(e.target.value)}
                placeholder={`Example inputs:\n5\n10 20\n30`}
                rows={6}
                className="w-full flex-1 bg-dark-900 border border-white/10 rounded-xl p-3 text-xs font-mono text-slate-100 focus:border-brand-500 outline-none placeholder:text-slate-600 resize-none"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
