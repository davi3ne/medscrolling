import React, { useEffect, useRef, useState } from 'react';
import { X, Trash2, MessageCircle, Send } from 'lucide-react';

function formatRelativeTime(iso) {
  if (!iso) return 'agora';
  const diffSec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (diffSec < 60) return 'agora';
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  return `${days} d`;
}

export default function CommentsModal({
  post,
  comments,
  account,
  accountInitials,
  dark,
  onAddComment,
  onDeleteComment,
  onClose,
}) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!post) return;
    setText('');
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [post, onClose]);

  if (!post) return null;

  const borderCol = dark ? 'border-[#262626]' : 'border-[#dbdbdb]';
  const mutedText = dark ? 'text-[#a8a8a8]' : 'text-[#737373]';

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddComment(post.id, trimmed);
    setText('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex h-[78vh] sm:h-[560px] w-full max-w-[470px] flex-col rounded-t-2xl sm:rounded-2xl border overflow-hidden shadow-2xl ${
          dark
            ? 'border-[#262626] bg-[#121212] text-[#f5f5f5]'
            : 'border-[#dbdbdb] bg-white text-[#262626]'
        }`}
      >
        {/* Drag handle (mobile) + Header */}
        <div className={`border-b px-4 pt-2.5 pb-3 ${borderCol}`}>
          <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-current/20 sm:hidden" />
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h3 className="text-[15px] font-bold">Comentários</h3>
              <p className={`truncate text-[11.5px] ${mutedText}`}>
                {post.id} · @{post.profile}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 hover:bg-current/10"
              aria-label="Fechar comentários"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {comments.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center px-6">
              <MessageCircle className={`h-10 w-10 mb-2.5 opacity-45 ${mutedText}`} />
              <div className="text-[14px] font-semibold">Nenhum comentário ainda</div>
              <p className={`mt-1 text-[12.5px] ${mutedText}`}>
                Deixe um macete de prova, conduta de plantão ou dúvida rápida sobre este card.
              </p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex items-start gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ backgroundColor: c.avatarColor || account.avatarColor || '#0095f6' }}
                >
                  {c.initials || accountInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[13px] font-semibold">@{c.handle || account.handle}</span>
                    <span className={`text-[11px] ${mutedText}`}>
                      {formatRelativeTime(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-[13.5px] leading-snug">
                    {c.text}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onDeleteComment(post.id, c.id)}
                  className={`shrink-0 rounded p-1.5 opacity-60 hover:opacity-100 hover:text-red-500 transition ${mutedText}`}
                  title="Excluir comentário"
                  aria-label="Excluir comentário"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Bottom Sticky Input Bar */}
        <form
          onSubmit={handleSubmit}
          className={`flex items-center gap-2.5 border-t px-3 py-2.5 ${borderCol} ${
            dark ? 'bg-[#0a0a0a]' : 'bg-[#fafafa]'
          }`}
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ backgroundColor: account.avatarColor || '#0095f6' }}
          >
            {accountInitials}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Comentar como @${account.handle}...`}
            className={`min-w-0 flex-1 rounded-full border px-3.5 py-2 text-[13px] outline-none focus:border-[#0095f6] ${
              dark
                ? 'border-[#262626] bg-[#161616] text-white placeholder-[#737373]'
                : 'border-[#dbdbdb] bg-white text-[#262626] placeholder-[#8e8e8e]'
            }`}
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className={`inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition ${
              text.trim()
                ? 'bg-[#0095f6] text-white hover:bg-[#1877f2]'
                : dark
                  ? 'bg-[#262626] text-[#737373]'
                  : 'bg-[#efefef] text-[#a3a3a3]'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Publicar</span>
          </button>
        </form>
      </div>
    </div>
  );
}
