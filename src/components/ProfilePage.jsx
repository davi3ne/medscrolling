import React, { useState } from 'react';
import {
  ArrowLeft,
  Grid3X3,
  List,
  Layers,
  HelpCircle,
  AlertTriangle,
  MessageSquare,
  ArrowLeftRight,
  Play,
} from 'lucide-react';
import PostCard from './PostCard';

function VerifiedBadge() {
  return (
    <svg className="inline-block h-4 w-4 text-[#0095f6]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.25 14.5l-3.75-3.75 1.41-1.41L10.75 13.67l5.34-5.34 1.41 1.41-6.75 6.76z" />
    </svg>
  );
}

function FormatIcon({ format }) {
  const cls = 'h-3.5 w-3.5';
  if (format === 'carrossel') return <Layers className={cls} />;
  if (format === 'quiz') return <HelpCircle className={cls} />;
  if (format === 'red_flag') return <AlertTriangle className={cls} />;
  if (format === 'cena_real') return <MessageSquare className={cls} />;
  if (format === 'comparativo') return <ArrowLeftRight className={cls} />;
  return null;
}

function getGridTitle(post) {
  if (post.format === 'carrossel') return post.content.slides[0]?.title || post.fullCard.title;
  if (post.format === 'comparativo') return post.content.title;
  if (post.format === 'red_flag') return post.content.headline;
  if (post.format === 'quiz') return post.fullCard.title.replace(`${post.id} — `, '');
  if (post.format === 'cena_real') return post.content.context;
  return post.fullCard.title;
}

export default function ProfilePage({
  profile,
  posts,
  dark,
  isFollowing,
  hasViewedStory,
  likedIds,
  savedIds,
  notesMap,
  quizAnswers,
  onBack,
  onToggleFollow,
  onOpenStory,
  onToggleLike,
  onDoubleTapLike,
  onToggleSave,
  onSelectQuizOption,
  onResetQuizOption,
  onOpenFicha,
  onFilterTag,
}) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [focusedPostId, setFocusedPostId] = useState(null);

  if (!profile) return null;

  const borderCol = dark ? 'border-[#262626]' : 'border-[#dbdbdb]';
  const mutedText = dark ? 'text-[#a8a8a8]' : 'text-[#737373]';

  const handleOpenGridItem = (postId) => {
    setFocusedPostId(postId);
    setViewMode('list');
    setTimeout(() => {
      const el = document.getElementById(`profile-post-${postId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div className={`min-h-screen pb-16 ${dark ? 'bg-black text-[#f5f5f5]' : 'bg-white text-[#262626]'}`}>
      {/* Sticky Top Profile Bar */}
      <div
        className={`sticky top-0 z-30 flex h-[50px] items-center justify-between border-b px-3 ${borderCol} ${
          dark ? 'bg-black/95' : 'bg-white/95'
        } backdrop-blur-sm`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-1 rounded-full hover:opacity-70"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="truncate text-[16px] font-bold">{profile.handle}</span>
            {profile.verified && <VerifiedBadge />}
          </div>
        </div>
      </div>

      {/* Profile Header Info */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-6">
          {/* Avatar with Story Ring */}
          <button
            type="button"
            onClick={() => onOpenStory(profile.handle)}
            className={`shrink-0 rounded-full p-[3px] ${
              hasViewedStory
                ? dark
                  ? 'bg-[#363636]'
                  : 'bg-[#dbdbdb]'
                : 'ig-story-ring'
            }`}
            title="Abrir Stories deste assunto"
          >
            <div
              className={`flex h-[76px] w-[76px] items-center justify-center rounded-full border-[3px] text-[22px] font-bold text-white ${
                dark ? 'border-black' : 'border-white'
              }`}
              style={{ backgroundColor: profile.avatarBg }}
            >
              {profile.initials}
            </div>
          </button>

          {/* 3 Stat Columns */}
          <div className="grid flex-1 grid-cols-3 text-center">
            <div>
              <div className="text-[17px] font-bold leading-tight">{posts.length}</div>
              <div className={`text-[12px] ${mutedText}`}>Posts</div>
            </div>
            <div>
              <div className="text-[17px] font-bold leading-tight">{profile.microtemasCount}</div>
              <div className={`text-[12px] ${mutedText}`}>Fichas</div>
            </div>
            <div>
              <div className="text-[17px] font-bold leading-tight">100%</div>
              <div className={`text-[12px] ${mutedText}`}>Catalogado</div>
            </div>
          </div>
        </div>

        {/* Name & Bio */}
        <div className="mt-3 text-[13.5px] leading-snug">
          <div className="font-bold">{profile.name}</div>
          <p className={`mt-0.5 ${dark ? 'text-[#e5e5e5]' : 'text-[#262626]'}`}>{profile.bio}</p>
        </div>

        {/* Action Buttons: Seguir/Seguindo + Ver Stories */}
        <div className="mt-3.5 flex gap-2">
          <button
            type="button"
            onClick={() => onToggleFollow(profile.handle)}
            className={`flex-1 rounded-lg py-1.5 text-[13.5px] font-semibold transition ${
              isFollowing
                ? dark
                  ? 'bg-[#262626] text-white hover:bg-[#363636]'
                  : 'bg-[#efefef] text-[#262626] hover:bg-[#e2e2e2]'
                : 'bg-[#0095f6] text-white hover:bg-[#1877f2]'
            }`}
          >
            {isFollowing ? 'Seguindo' : 'Seguir'}
          </button>

          <button
            type="button"
            onClick={() => onOpenStory(profile.handle)}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-4 py-1.5 text-[13.5px] font-semibold transition ${
              dark
                ? 'bg-[#262626] text-white hover:bg-[#363636]'
                : 'bg-[#efefef] text-[#262626] hover:bg-[#e2e2e2]'
            }`}
          >
            <Play className="h-3.5 w-3.5" />
            <span>Stories</span>
          </button>
        </div>

        {/* Highlights Row */}
        {profile.highlights && (
          <div className="mt-4 flex gap-4 overflow-x-auto pb-1 no-scrollbar">
            {profile.highlights.map((hl) => (
              <button
                key={hl}
                type="button"
                onClick={() => onOpenStory(profile.handle)}
                className="flex w-[60px] shrink-0 flex-col items-center gap-1"
              >
                <div
                  className={`flex h-[54px] w-[54px] items-center justify-center rounded-full border p-1 ${
                    dark ? 'border-[#363636] bg-[#121212]' : 'border-[#dbdbdb] bg-[#fafafa]'
                  }`}
                >
                  <span className="text-[11px] font-bold text-[#0095f6] truncate px-1">
                    {hl}
                  </span>
                </div>
                <span className={`w-full truncate text-center text-[11px] ${mutedText}`}>
                  {hl}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid / List Tab Switcher */}
      <div className={`grid grid-cols-2 border-y ${borderCol}`}>
        <button
          type="button"
          onClick={() => setViewMode('grid')}
          className={`flex items-center justify-center py-2.5 border-b-2 transition ${
            viewMode === 'grid'
              ? dark
                ? 'border-white text-white'
                : 'border-[#262626] text-[#262626]'
              : `border-transparent ${mutedText}`
          }`}
          aria-label="Visualização em grade"
        >
          <Grid3X3 className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => setViewMode('list')}
          className={`flex items-center justify-center py-2.5 border-b-2 transition ${
            viewMode === 'list'
              ? dark
                ? 'border-white text-white'
                : 'border-[#262626] text-[#262626]'
              : `border-transparent ${mutedText}`
          }`}
          aria-label="Visualização em lista"
        >
          <List className="h-5 w-5" />
        </button>
      </div>

      {/* 3x3 Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-3 gap-[2px] pt-[2px]">
          {posts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => handleOpenGridItem(post.id)}
              className="relative aspect-square p-2.5 text-left flex flex-col justify-between overflow-hidden text-white transition hover:opacity-90"
            >
              <img
                src={profile.bgImage || '/images/bg-pharma.jpg'}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(155deg, ${profile.avatarBg}d9 0%, #09090be8 100%)`,
                }}
              />
              <div className="relative z-10 flex items-center justify-between w-full">
                <span className="rounded bg-black/35 px-1.5 py-0.5 text-[9.5px] font-bold text-white">
                  {post.id}
                </span>
                <span className="text-white/90">
                  <FormatIcon format={post.format} />
                </span>
              </div>
              <div className="relative z-10 text-[11.5px] font-bold leading-tight line-clamp-3 drop-shadow-sm">
                {getGridTitle(post)}
              </div>
              <div className="relative z-10 text-[9.5px] truncate text-white/75">{post.tag}</div>
            </button>
          ))}
        </div>
      ) : (
        <div>
          {posts.map((post) => (
            <div key={post.id} id={`profile-post-${post.id}`}>
              <PostCard
                post={post}
                profile={profile}
                dark={dark}
                liked={likedIds.includes(post.id)}
                saved={savedIds.includes(post.id)}
                isFollowing={isFollowing}
                hasNote={Boolean(notesMap?.[post.id]?.trim())}
                quizAnswer={quizAnswers[post.id]}
                onToggleLike={onToggleLike}
                onDoubleTapLike={() => onDoubleTapLike(post.id)}
                onToggleSave={onToggleSave}
                onToggleFollow={onToggleFollow}
                onSelectQuizOption={onSelectQuizOption}
                onResetQuizOption={onResetQuizOption}
                onOpenFicha={onOpenFicha}
                onFilterProfile={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                onFilterTag={onFilterTag}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
