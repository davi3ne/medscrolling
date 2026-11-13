import React, { useEffect, useState } from 'react';
import { X, BookOpen, CheckSquare, FileText, StickyNote, Check } from 'lucide-react';

export default function FichaModal({ post, dark, note, onSaveNote, onClose }) {
  const [draft, setDraft] = useState(note || '');
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    setDraft(note || '');
  }, [post?.id, note]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  if (!post) return null;

  const mutedText = dark ? 'text-[#a8a8a8]' : 'text-[#737373]';
  const borderCol = dark ? 'border-[#262626]' : 'border-[#dbdbdb]';

  const handleSave = () => {
    if (onSaveNote) {
      onSaveNote(post.id, draft);
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 1500);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 p-0 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-[470px] max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-xl border shadow-2xl overflow-hidden ${
          dark ? 'bg-[#121212] border-[#262626] text-[#f5f5f5]' : 'bg-white border-[#dbdbdb] text-[#262626]'
        }`}
      >
        {/* Drag handle on mobile */}
        <div className="flex justify-center pt-2.5 pb-1 sm:hidden">
          <div className={`h-1 w-10 rounded-full ${dark ? 'bg-[#363636]' : 'bg-[#d4d4d4]'}`} />
        </div>

        {/* Header */}
        <div className={`flex items-center justify-between border-b px-4 py-3 ${borderCol}`}>
          <div className="min-w-0 pr-3">
            <div className="flex items-center gap-2">
              <span className="rounded bg-[#0095f6]/15 px-1.5 py-0.5 text-[11px] font-bold text-[#0095f6]">
                {post.id}
              </span>
              <span className={`text-[12px] font-medium truncate ${mutedText}`}>@{post.profile}</span>
            </div>
            <h3 className="mt-1 text-[15px] font-bold leading-snug">{post.fullCard.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`rounded-full p-1.5 hover:opacity-70 ${dark ? 'bg-[#262626]' : 'bg-[#efefef]'}`}
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 space-y-4 text-[13.5px] leading-relaxed">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0095f6] mb-1">
              <BookOpen className="h-3.5 w-3.5" />
              Explicação Clínica
            </div>
            <p className={dark ? 'text-[#e5e5e5]' : 'text-[#262626]'}>{post.fullCard.explanation}</p>
          </div>

          <div
            className={`rounded-lg border p-3 ${
              dark ? 'border-[#262626] bg-[#1a1a1a]' : 'border-[#e5e5e5] bg-[#fafafa]'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0095f6] mb-1.5">
              <CheckSquare className="h-3.5 w-3.5" />
              Dados Duros &amp; Números Exatos
            </div>
            <div className="whitespace-pre-line text-[13px] leading-relaxed">
              {post.fullCard.hardData}
            </div>
          </div>

          {/* Personal Notes */}
          <div className={`border-t pt-3 ${borderCol}`}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0095f6]">
                <StickyNote className="h-3.5 w-3.5" />
                Minhas Anotações
              </div>
              {savedFeedback && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500">
                  <Check className="h-3 w-3" /> Salvo
                </span>
              )}
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={2}
              placeholder="Escreva um mnemônico, dúvida ou observação pessoal..."
              className={`w-full rounded-lg border p-2.5 text-[13px] outline-none resize-none ${
                dark
                  ? 'border-[#303030] bg-[#1a1a1a] text-white placeholder:text-[#737373]'
                  : 'border-[#dbdbdb] bg-[#fafafa] text-[#262626] placeholder:text-[#a3a3a3]'
              }`}
            />
            <div className="mt-1.5 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-[#0095f6] px-3 py-1 text-[12px] font-semibold text-white hover:bg-[#1877f2] transition"
              >
                Salvar anotação
              </button>
            </div>
          </div>

          <div className={`border-t pt-3 ${borderCol}`}>
            <div className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-1 ${mutedText}`}>
              <FileText className="h-3.5 w-3.5" />
              Fonte Exata
            </div>
            <p className={`text-[12.5px] italic ${mutedText}`}>{post.fullCard.source}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
