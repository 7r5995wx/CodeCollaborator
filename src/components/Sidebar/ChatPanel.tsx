'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Info } from 'lucide-react';
import { ChatMessage } from '@/lib/types';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  currentUserId: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  currentUserId,
}) => {
  const [text, setText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  return (
    <div className="flex-1 flex flex-col bg-dark-900/50 h-full overflow-hidden">
      {/* Messages Feed */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
        {messages.map((msg) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="flex items-center gap-1.5 justify-center my-2">
                <div className="bg-white/5 text-slate-400 text-[10px] px-2.5 py-1 rounded-full border border-white/5 flex items-center gap-1">
                  <Info className="w-3 h-3 text-brand-400" />
                  <span>{msg.text}</span>
                </div>
              </div>
            );
          }

          const isMe = msg.senderId === currentUserId;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <span className="text-[10px] text-slate-400 font-medium px-1 mb-0.5">
                {msg.senderName}
              </span>

              <div
                className={`max-w-[85%] p-2.5 rounded-xl text-xs leading-relaxed shadow-sm ${
                  isMe
                    ? 'bg-brand-600 text-white rounded-br-none'
                    : 'bg-dark-850 text-slate-200 border border-white/5 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-2.5 bg-dark-850 border-t border-white/10 flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Send message to session..."
          className="flex-1 bg-dark-950 text-slate-200 text-xs px-3 py-2 rounded-lg border border-white/10 focus:border-brand-500 outline-none transition-all placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="p-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-all"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
