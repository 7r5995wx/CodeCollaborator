'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Code2, 
  Sparkles, 
  Users, 
  Zap, 
  ShieldCheck, 
  Terminal, 
  ArrowRight, 
  Lock, 
  Globe, 
  CheckCircle2,
  Copy
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/lib/piston';
import { LanguageId } from '@/lib/types';

function LandingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab mode
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');

  // Create Form State
  const [createTitle, setCreateTitle] = useState('Collaborative Session');
  const [hostName, setHostName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageId>('javascript');
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [passcode, setPasscode] = useState('');

  // Join Form State
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [guestName, setGuestName] = useState('');
  const [joinPasscode, setJoinPasscode] = useState('');

  // Check URL params for direct join
  useEffect(() => {
    const directJoinCode = searchParams.get('join');
    if (directJoinCode) {
      setJoinRoomCode(directJoinCode.toUpperCase());
      setActiveTab('join');
    }
  }, [searchParams]);

  // Generate 6-char Room Code
  const generateRoomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'CODE-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostName.trim()) return;

    const roomCode = generateRoomCode();
    
    // Store session config in sessionStorage
    const sessionConfig = {
      code: roomCode,
      title: createTitle.trim() || 'CodeCollaborator Session',
      hostName: hostName.trim(),
      approvalRequired,
      passcode: passcode.trim(),
      language: selectedLanguage,
      isHost: true,
    };

    sessionStorage.setItem(`config_${roomCode}`, JSON.stringify(sessionConfig));
    sessionStorage.setItem(`user_${roomCode}`, JSON.stringify({
      name: hostName.trim(),
      isHost: true,
    }));

    router.push(`/session/${roomCode}`);
  };

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinRoomCode.trim() || !guestName.trim()) return;

    const formattedCode = joinRoomCode.trim().toUpperCase();

    sessionStorage.setItem(`user_${formattedCode}`, JSON.stringify({
      name: guestName.trim(),
      isHost: false,
      passcode: joinPasscode.trim(),
    }));

    router.push(`/session/${formattedCode}`);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-brand-cyan/10 rounded-full blur-[160px] pointer-events-none"></div>

      {/* Header */}
      <header className="p-6 flex items-center justify-between max-w-7xl w-full mx-auto z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-brand-cyan flex items-center justify-center shadow-glow-brand">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            Code<span className="text-brand-400">Collaborator</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Vercel Serverless Ready
          </span>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">
        {/* Left Column: Hero Text */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-brand-300">
            <Sparkles className="w-4 h-4 text-brand-cyan" />
            <span>Real-Time Multiplayer IDE & Multi-Language Execution</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Code Together in Real Time.{' '}
            <span className="bg-gradient-to-r from-brand-400 via-brand-cyan to-brand-purple bg-clip-text text-transparent">
              Compile & Run Instantly.
            </span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl leading-relaxed">
            Create a live coding room, invite your team, manage join approvals, edit code synchronously with live cursors, and execute code across 40+ programming languages on serverless infrastructure.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-dark-900/80 border border-white/5">
              <Zap className="w-5 h-5 text-brand-cyan mb-2" />
              <h4 className="text-xs font-bold text-white mb-1">Host Approval</h4>
              <p className="text-[11px] text-slate-400">Waiting Room queue keeps sessions secure</p>
            </div>

            <div className="p-4 rounded-xl bg-dark-900/80 border border-white/5">
              <Users className="w-5 h-5 text-brand-purple mb-2" />
              <h4 className="text-xs font-bold text-white mb-1">Live Cursors</h4>
              <p className="text-[11px] text-slate-400">Multiplayer editor powered by Monaco</p>
            </div>

            <div className="p-4 rounded-xl bg-dark-900/80 border border-white/5 col-span-2 sm:col-span-1">
              <Terminal className="w-5 h-5 text-emerald-400 mb-2" />
              <h4 className="text-xs font-bold text-white mb-1">40+ Languages</h4>
              <p className="text-[11px] text-slate-400">Piston engine code execution</p>
            </div>
          </div>
        </div>

        {/* Right Column: Card for Create / Join Session */}
        <div className="lg:col-span-5">
          <div className="bg-dark-900/90 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative">
            {/* Tabs */}
            <div className="flex bg-dark-850 p-1 rounded-2xl border border-white/5 mb-6">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'create'
                    ? 'bg-brand-600 text-white shadow-glow-brand'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Session
              </button>
              <button
                onClick={() => setActiveTab('join')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'join'
                    ? 'bg-brand-600 text-white shadow-glow-brand'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Join Session
              </button>
            </div>

            {/* CREATE SESSION FORM */}
            {activeTab === 'create' && (
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Your Name (Host)
                  </label>
                  <input
                    type="text"
                    required
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="e.g. Alex Dev"
                    className="w-full bg-dark-950 text-slate-100 text-sm px-4 py-3 rounded-xl border border-white/10 focus:border-brand-500 outline-none transition-all placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Session Title
                  </label>
                  <input
                    type="text"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="e.g. Algorithms Pair Programming"
                    className="w-full bg-dark-950 text-slate-100 text-sm px-4 py-3 rounded-xl border border-white/10 focus:border-brand-500 outline-none transition-all placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Primary Language
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value as LanguageId)}
                    className="w-full bg-dark-950 text-slate-100 text-sm px-4 py-3 rounded-xl border border-white/10 focus:border-brand-500 outline-none transition-all"
                  >
                    {Object.values(SUPPORTED_LANGUAGES).map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>

                {/* Host Access Control Toggle */}
                <div className="bg-dark-850 p-4 rounded-xl border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-brand-cyan" />
                      <span className="text-xs font-semibold text-slate-200">Require Host Approval</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={approvalRequired}
                      onChange={(e) => setApprovalRequired(e.target.checked)}
                      className="w-4 h-4 accent-brand-500 cursor-pointer"
                    />
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Guests entering the session code must be approved by you in real-time before entering the editor.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-cyan hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-glow-brand flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>Create Session & Open IDE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* JOIN SESSION FORM */}
            {activeTab === 'join' && (
              <form onSubmit={handleJoinSession} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Session Code
                  </label>
                  <input
                    type="text"
                    required
                    value={joinRoomCode}
                    onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                    placeholder="e.g. CODE-8492"
                    className="w-full bg-dark-950 font-mono tracking-wider text-brand-400 font-bold text-base px-4 py-3 rounded-xl border border-white/10 focus:border-brand-500 outline-none transition-all placeholder:font-sans placeholder:text-sm placeholder:font-normal placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Your Username
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Taylor"
                    className="w-full bg-dark-950 text-slate-100 text-sm px-4 py-3 rounded-xl border border-white/10 focus:border-brand-500 outline-none transition-all placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Session Passcode (If required)
                  </label>
                  <input
                    type="password"
                    value={joinPasscode}
                    onChange={(e) => setJoinPasscode(e.target.value)}
                    placeholder="Optional passcode"
                    className="w-full bg-dark-950 text-slate-100 text-sm px-4 py-3 rounded-xl border border-white/10 focus:border-brand-500 outline-none transition-all placeholder:text-slate-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-brand-cyan via-brand-500 to-brand-purple hover:opacity-95 text-slate-950 font-extrabold text-sm rounded-xl shadow-glow-cyan flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>Join Live Session</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-slate-500 border-t border-white/5 max-w-7xl w-full mx-auto z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>© 2026 CodeCollaborator Engine. Real-Time Serverless Code Execution.</span>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-300 cursor-pointer">40+ Languages Supported</span>
          <span className="hover:text-slate-300 cursor-pointer">Monaco Editor</span>
          <span className="hover:text-slate-300 cursor-pointer">Vercel Deployable</span>
        </div>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-950 flex items-center justify-center text-slate-400">Loading CodeCollaborator...</div>}>
      <LandingPageContent />
    </Suspense>
  );
}
