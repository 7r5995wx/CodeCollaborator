'use client';

import React from 'react';
import { ShieldAlert, Check, X, Clock, UserCheck } from 'lucide-react';
import { UserSession } from '@/lib/types';

interface WaitingRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  waitingUsers: UserSession[];
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
}

export const WaitingRoomModal: React.FC<WaitingRoomModalProps> = ({
  isOpen,
  onClose,
  waitingUsers,
  onApprove,
  onReject,
}) => {
  if (!isOpen) return null;

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
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Join Approvals Required</h2>
            <p className="text-xs text-slate-400">Approve or deny guests waiting to enter this session</p>
          </div>
        </div>

        {waitingUsers.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No guests currently waiting in queue.
          </div>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {waitingUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-xl bg-dark-850 border border-white/10"
              >
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-white block">{user.name}</span>
                    <span className="text-[10px] text-amber-400 font-mono">Waiting for Host Approval...</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onApprove(user.id)}
                    className="p-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                    title="Approve User"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => onReject(user.id)}
                    className="p-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 rounded-lg text-xs font-bold transition-all"
                    title="Deny Access"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
