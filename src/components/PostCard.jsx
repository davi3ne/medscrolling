import React, { useState, useEffect, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  MoreHorizontal,
  BookOpen,
  UserMinus,
  UserPlus,
  Copy,
  ExternalLink,
  StickyNote,
} from 'lucide-react';
import PostMedia from './PostMedia';

function VerifiedBadge() {
  return (
    <svg className="inline-block h-3.5 w-3.5 text-[#0095f6]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.25 14.5l-3.75-3.75 1.41-1.41L10.75 13.67l5.34-5.34 1.41 1.41-6.75 6.76z" />
    </svg>
  );
}

function copyTextFallback(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
  return Promise.resolve();
}

export default function PostCard({
  post,
  profile,
  dark,
  liked,
  saved,
  isFollowing,
  hasNote,
  quizAnswer,
  onToggleLike,
  onDoubleTapLike,
  onToggleSave,
  onToggleFollow,
  onSelectQuizOption,
  onResetQuizOption,
  onOpenFicha,
  onFilterProfile,
  onFilterTag,
  onSeen,
}) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [expandedCaption, setExpandedCaption] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cardRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!onSeen || !cardRef.current) return;
    let timer = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          timer = setTimeout(() => {
            onSeen(post.id);
          }, 900);
        } else if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: 0.55 }
    );
    observer.observe(cardRef.current);
    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [post.id, onSeen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const buildShareText = () =>
    `[${post.id}] @${post.profile} — ${post.fullCard.title}\n\n${post.caption}\n\nFonte: ${post.fullCard.source}`;

  const handleCopy = async () => {
    await copyTextFallback(buildShareText());
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleShare = async () => {
    const text = buildShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.fullCard.title,
          text,
        });
        return;
      } catch {
        // User cancelled or share failed; fallback to copy
      }
    }
    await handleCopy();
  };

  const totalLikes = post.likes + (liked ? 1 : 0);
  const slideCount = post.format === 'carrossel' ? post.content.slides.length : 0;
  const mutedText = dark ? 'text-[#a8a8a8]' : 'text-[#737373]';
  const borderCol = dark ? 'border-[#262626]' : 'border-[#dbdbdb]';

  const shouldTruncate = post.caption.length > 135 && !expandedCaption;
  const displayCaption = shouldTruncate ? post.caption.slice(0, 135).trimEnd() : post.caption;

  return (
    <article
      ref={cardRef}
      className={`border-b ${borderCol} ${dark ? 'bg-black text-[#f5f5f5]' : 'bg-white text-[#262626]'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => onFilterProfile(post.profile)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ring-1 ring-black/10"
            style={{ backgroundColor: profile?.avatarBg || '#1e293b' }}
            title={`Abrir perfil @${post.profile}`}
          >
            {profile?.initials || 'MF'}
          </button>
          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onFilterProfile(post.profile)}
                className="truncate text-[13.5px] font-semibold hover:opacity-75"
              >
                {post.profile}
              </button>
              {profile?.verified && <VerifiedBadge />}
              <span className={`text-[12px] ${mutedText}`}>• {post.timeAgo}</span>
            </div>
            <div className={`truncate text-[11px] ${mutedText}`}>{post.location}</div>
          </div>
        </div>

        {/* ••• Context Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className={`p-1.5 rounded-full hover:opacity-70 ${dark ? 'text-[#f5f5f5]' : 'text-[#262626]'}`}
            aria-label="Mais opções"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div
              className={`absolute right-0 top-9 z-40 w-56 rounded-xl border shadow-xl overflow-hidden text-[13px] ${
                dark
                  ? 'border-[#303030] bg-[#1c1c1c] text-[#f5f5f5]'
                  : 'border-[#dbdbdb] bg-white text-[#262626]'
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenFicha(post);
                }}
                className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-current/5`}
              >
                <BookOpen className="h-4 w-4 text-[#0095f6]" />
                <span>Ver ficha &amp; fonte exata</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onFilterProfile(post.profile);
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left border-t border-current/10 hover:bg-current/5"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Ir para @{post.profile}</span>
              </button>

              {onToggleFollow && (
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleFollow(post.profile);
                  }}
                  className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left border-t border-current/10 hover:bg-current/5 ${
                    isFollowing ? 'text-red-500' : 'text-[#0095f6]'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4" />
                      <span>Deixar de seguir assunto</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Seguir assunto</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  handleCopy();
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left border-t border-current/10 hover:bg-current/5"
              >
                <Copy className="h-4 w-4" />
                <span>Copiar resumo clínico</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Media */}
      <PostMedia
        post={post}
        profile={profile}
        dark={dark}
        activeSlide={activeSlide}
        onSlideChange={setActiveSlide}
        onDoubleTapLike={onDoubleTapLike}
        quizAnswer={quizAnswer}
        onSelectQuizOption={onSelectQuizOption}
        onResetQuizOption={onResetQuizOption}
      />

      {/* Action Bar */}
      <div className="relative flex items-center justify-between px-3 pt-2.5 pb-1.5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onToggleLike(post.id)}
            className="transition-transform active:scale-125"
            aria-label="Curtir"
          >
            <Heart
              className={`h-6 w-6 ${
                liked
                  ? 'fill-[#ff3040] text-[#ff3040]'
                  : dark
                  ? 'text-[#f5f5f5] hover:text-[#a8a8a8]'
                  : 'text-[#262626] hover:text-[#737373]'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => onOpenFicha(post)}
            className={`relative ${dark ? 'text-[#f5f5f5] hover:text-[#a8a8a8]' : 'text-[#262626] hover:text-[#737373]'}`}
            aria-label="Abrir ficha e anotações"
            title="Ver ficha completa e anotações"
          >
            <MessageCircle className="h-6 w-6" />
            {hasNote && (
              <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#0095f6]" />
            )}
          </button>

          <button
            type="button"
            onClick={handleShare}
            className={`relative ${dark ? 'text-[#f5f5f5] hover:text-[#a8a8a8]' : 'text-[#262626] hover:text-[#737373]'}`}
            aria-label="Compartilhar ou copiar resumo"
            title="Compartilhar / copiar resumo clínico"
          >
            <Send className="h-6 w-6" />
            {copied && (
              <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-0.5 text-[10px] font-medium text-white shadow">
                Copiado!
              </span>
            )}
          </button>
        </div>

        {/* Centered Instagram Carousel Dots */}
        {slideCount > 1 && (
          <div className="pointer-events-none absolute left-1/2 flex -translate-x-1/2 items-center gap-1">
            {Array.from({ length: slideCount }).map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  idx === activeSlide
                    ? 'bg-[#0095f6] scale-110'
                    : dark
                    ? 'bg-[#525252]'
                    : 'bg-[#d4d4d4]'
                }`}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => onToggleSave(post.id)}
          className="transition-transform active:scale-110"
          aria-label="Salvar para revisão"
          title="Salvar para revisão"
        >
          <Bookmark
            className={`h-6 w-6 ${
              saved
                ? dark
                  ? 'fill-white text-white'
                  : 'fill-[#262626] text-[#262626]'
                : dark
                ? 'text-[#f5f5f5] hover:text-[#a8a8a8]'
                : 'text-[#262626] hover:text-[#737373]'
            }`}
          />
        </button>
      </div>

      {/* Likes & Caption */}
      <div className="px-3 pb-3.5 text-[13.5px] leading-[1.4]">
        <div className="font-semibold mb-1">{totalLikes} curtidas</div>

        <div>
          <button
            type="button"
            onClick={() => onFilterProfile(post.profile)}
            className="font-semibold mr-1.5 hover:underline"
          >
            {post.profile}
          </button>
          <span>{displayCaption}</span>
          {shouldTruncate && (
            <>
              <span>... </span>
              <button
                type="button"
                onClick={() => setExpandedCaption(true)}
                className={`${mutedText} font-medium`}
              >
                mais
              </button>
            </>
          )}
          {' '}
          <button
            type="button"
            onClick={() => onFilterTag(post.tag)}
            className="text-[#0095f6] hover:underline"
          >
            {post.tag}
          </button>
        </div>

        <div className="mt-1.5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onOpenFicha(post)}
            className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${mutedText} hover:underline`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Ver ficha completa &amp; fonte ({post.id})
          </button>

          {hasNote && (
            <button
              type="button"
              onClick={() => onOpenFicha(post)}
              className="inline-flex items-center gap-1 text-[11.5px] font-medium text-[#0095f6] hover:underline"
            >
              <StickyNote className="h-3 w-3" />
              Sua nota
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
