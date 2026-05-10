'use client';

import { useState, useRef, useEffect } from 'react';
import { useRoomStore } from '@/store/room';
import { useAuthStore } from '@/store/auth';
import ChatBubble from './ChatBubble';

interface ChatPanelProps {
  open: boolean;
  onToggle: () => void;
}

export default function ChatPanel({ open, onToggle }: ChatPanelProps) {
  const messages = useRoomStore((s) => s.messages);
  const sendMessage = useRoomStore((s) => s.sendMessage);
  const room = useRoomStore((s) => s.room);
  const user = useAuthStore((s) => s.user);
  const [text, setText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setText('');
  };

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={onToggle}
        className="fixed bottom-24 right-4 z-40 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10"
      >
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
        {messages.length > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent-sync)] flex items-center justify-center">
            <span className="text-[8px] text-white font-bold">{messages.length > 99 ? '99' : messages.length}</span>
          </div>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
          <div className="max-w-[476px] mx-auto">
            <div className="h-[50vh] bg-[var(--bg-primary)]/95 backdrop-blur-xl border-t border-white/8 flex flex-col rounded-t-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
                <span className="text-[13px] font-semibold text-white">Chat</span>
                <button onClick={onToggle} className="text-[var(--text-muted)] text-[12px]">Close</button>
              </div>

              {/* Messages */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-hide">
                {messages.length === 0 && (
                  <p className="text-[12px] text-[var(--text-muted)] text-center py-8">
                    No messages yet. Say something!
                  </p>
                )}
                {messages.map((msg) => (
                  <ChatBubble
                    key={msg.id}
                    userName={msg.userName}
                    text={msg.text}
                    mode={msg.mode}
                    isHost={msg.isHost}
                    isOwn={msg.userId === (user?.id || 'current-user')}
                    hostId={room?.hostId || ''}
                  />
                ))}
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 px-4 py-3 border-t border-white/6">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2.5 rounded-xl bg-white/8 text-white text-[13px] outline-none placeholder:text-[var(--text-muted)]"
                  maxLength={500}
                />
                <button
                  onClick={handleSend}
                  disabled={!text.trim()}
                  className="w-9 h-9 rounded-full bg-[var(--accent-sync)] flex items-center justify-center disabled:opacity-40"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
