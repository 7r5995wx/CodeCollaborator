'use client';

import React, { useState } from 'react';
import { Copy, Check, X, QrCode, Shield, Sparkles } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  sessionTitle: string;
  passcode?: string;
  approvalRequired: boolean;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  sessionTitle,
  passcode,
  approvalRequired,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  if (!isOpen) return null;

  const joinUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/?join=${roomCode}` 
    : '';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Invite Collaborators</h2>
            <p className="text-xs text-slate-400">Share room code or direct link to join session</p>
          </div>
        </div>

        {/* Room Code Card */}
        <div className="bg-dark-850 border border-white/10 rounded-xl p-4 mb-4">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Session Code
          </label>
          <div className="flex items-center justify-between bg-dark-950 p-3 rounded-lg border border-white/5">
            <span className="font-mono text-xl font-bold tracking-widest text-brand-400">
              {roomCode}
            </span>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Direct Link */}
        <div className="bg-dark-850 border border-white/10 rounded-xl p-4 mb-4">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Direct Share URL
          </label>
          <div className="flex items-center justify-between bg-dark-950 p-2.5 rounded-lg border border-white/5 gap-2">
            <span className="font-mono text-xs text-slate-300 truncate">
              {joinUrl}
            </span>
            <button
              onClick={handleCopyUrl}
              className="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 text-slate-200 border border-white/10 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copied!' : 'Copy URL'}</span>
            </button>
          </div>
        </div>

        {/* Session Security Badges */}
        <div className="bg-dark-950/80 border border-white/5 rounded-xl p-3 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-cyan" />
            <span>Host Approval: <strong className={approvalRequired ? 'text-amber-400' : 'text-emerald-400'}>{approvalRequired ? 'Required' : 'Open'}</strong></span>
          </div>
          {passcode && (
            <span className="font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded">PIN: {passcode}</span>
          )}
        </div>
      </div>
    </div>
  );
};
