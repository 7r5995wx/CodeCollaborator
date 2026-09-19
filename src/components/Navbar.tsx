'use client';

import React from 'react';
import { 
  Play, 
  Share2, 
  Users, 
  Code2, 
  LogOut, 
  ShieldCheck, 
  Clock, 
  Terminal, 
  Globe,
  Settings,
  Sparkles
} from 'lucide-react';
import { LanguageId, ThemeId } from '@/lib/types';
import { SUPPORTED_LANGUAGES } from '@/lib/piston';

interface NavbarProps {
  roomCode: string;
  sessionTitle: string;
  isHost: boolean;
  activeLanguage: LanguageId;
  activeTheme: ThemeId;
  onLanguageChange: (lang: LanguageId) => void;
  onThemeChange: (theme: ThemeId) => void;
  onRunCode: () => void;
  isExecuting: boolean;
  participantCount: number;
  waitingCount: number;
  onOpenInvite: () => void;
  onOpenWaitingRoom: () => void;
  onLeaveSession: () => void;
  activeTab: 'code' | 'web';
  onTabChange: (tab: 'code' | 'web') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  roomCode,
  sessionTitle,
  isHost,
  activeLanguage,
  activeTheme,
  onLanguageChange,
  onThemeChange,
  onRunCode,
  isExecuting,
  participantCount,
  waitingCount,
  onOpenInvite,
  onOpenWaitingRoom,
  onLeaveSession,
  activeTab,
  onTabChange,
}) => {
  return (
    <header className="h-16 bg-dark-900/90 backdrop-blur-md border-b border-white/10 px-4 flex items-center justify-between z-40 sticky top-0">
      {/* Brand & Room Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-cyan flex items-center justify-center shadow-glow-brand">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-2">
                {sessionTitle || 'CodeCollaborator'}
              </h1>
              {isHost && (
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-brand-500/20 text-brand-400 border border-brand-500/40 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> HOST
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>CODE: <strong className="text-brand-400 tracking-wider">{roomCode}</strong></span>
            </div>
          </div>
        </div>

        {/* Waiting Room Request Badge (For Host) */}
        {isHost && waitingCount > 0 && (
          <button
            onClick={onOpenWaitingRoom}
            className="animate-pulse bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-500/30 transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{waitingCount} Pending Approval{waitingCount > 1 ? 's' : ''}</span>
          </button>
        )}
      </div>

      {/* Center Controls: Language, View Mode Tabs */}
      <div className="flex items-center gap-3">
        {/* Code vs Live Web Preview toggle */}
        <div className="bg-dark-850 p-1 rounded-lg border border-white/5 flex items-center gap-1">
          <button
            onClick={() => onTabChange('code')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'code'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Editor & Console</span>
          </button>
          
          <button
            onClick={() => onTabChange('web')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'web'
                ? 'bg-brand-cyan text-slate-950 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Web Preview</span>
          </button>
        </div>

        {/* Language Selector */}
        <select
          value={activeLanguage}
          onChange={(e) => onLanguageChange(e.target.value as LanguageId)}
          className="bg-dark-850 text-slate-200 text-xs font-medium border border-white/10 rounded-lg px-3 py-1.5 outline-none focus:border-brand-500 hover:border-white/20 transition-all"
        >
          {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
            <option key={lang.id} value={lang.id} className="bg-dark-900 text-white">
              {lang.name}
            </option>
          ))}
        </select>

        {/* Theme Selector */}
        <select
          value={activeTheme}
          onChange={(e) => onThemeChange(e.target.value as ThemeId)}
          className="bg-dark-850 text-slate-200 text-xs font-medium border border-white/10 rounded-lg px-3 py-1.5 outline-none focus:border-brand-500 hover:border-white/20 transition-all hidden md:block"
        >
          <option value="vs-dark" className="bg-dark-900">VS Dark</option>
          <option value="one-dark" className="bg-dark-900">One Dark Pro</option>
          <option value="night-owl" className="bg-dark-900">Night Owl</option>
          <option value="cyberpunk" className="bg-dark-900">Cyberpunk Neon</option>
          <option value="monokai" className="bg-dark-900">Monokai</option>
        </select>

        {/* Run / Compile Code Button */}
        <button
          onClick={onRunCode}
          disabled={isExecuting}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-glow-emerald ${
            isExecuting
              ? 'bg-emerald-600/50 text-emerald-200 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-400 text-dark-950 hover:scale-105 active:scale-95'
          }`}
        >
          <Play className={`w-4 h-4 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
          <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
        </button>
      </div>

      {/* Right Actions: Invite Share, Active Users, Leave */}
      <div className="flex items-center gap-3">
        {/* Share / Invite Button */}
        <button
          onClick={onOpenInvite}
          className="px-3 py-1.5 bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 border border-brand-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Invite</span>
        </button>

        {/* Connected Members Indicator */}
        <div className="flex items-center gap-1.5 bg-dark-850 border border-white/10 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300">
          <Users className="w-3.5 h-3.5 text-brand-400" />
          <span>{participantCount}</span>
        </div>

        {/* Leave Session */}
        <button
          onClick={onLeaveSession}
          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
          title="Leave Session"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
