'use client';

import React from 'react';
import { ShieldCheck, User, UserX, Crown, Circle } from 'lucide-react';
import { UserSession } from '@/lib/types';

interface ParticipantListProps {
  participants: UserSession[];
  currentUserId: string;
  isHost: boolean;
  onKickUser?: (userId: string) => void;
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  currentUserId,
  isHost,
  onKickUser,
}) => {
  return (
    <div className="flex-1 flex flex-col bg-dark-900/50 p-3 overflow-y-auto space-y-2">
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1">
        Active Collaborators ({participants.length})
      </div>

      {participants.map((user) => {
        const isMe = user.id === currentUserId;

        return (
          <div
            key={user.id}
            className="flex items-center justify-between p-2.5 rounded-xl bg-dark-850/80 border border-white/5 hover:border-white/10 transition-all group"
          >
            <div className="flex items-center gap-2.5">
              {/* Avatar dot with user's cursor color */}
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm relative"
                style={{ backgroundColor: user.color }}
              >
                {user.name.charAt(0).toUpperCase()}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-dark-900"></span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-200">
                    {user.name} {isMe && <span className="text-slate-400 font-normal">(You)</span>}
                  </span>
                  {user.isHost && (
                    <span title="Session Host">
                      <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {user.isHost ? 'Session Host' : 'Collaborator'}
                </span>
              </div>
            </div>

            {/* Kick Button for Host */}
            {isHost && !user.isHost && onKickUser && (
              <button
                onClick={() => onKickUser(user.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all"
                title="Remove from session"
              >
                <UserX className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
