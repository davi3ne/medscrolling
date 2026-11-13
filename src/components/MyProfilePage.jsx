import React from 'react';
import { Check, Plus, BookOpen, RotateCcw } from 'lucide-react';

export default function MyProfilePage({
  profiles,
  postsCountByProfile,
  followingHandles,
  savedCount,
  correctQuizzesCount,
  answeredQuizzesCount,
  seenCount,
  totalPostsCount,
  dark,
  onToggleFollow,
  onFollowAll,
  onUnfollowAll,
  onResetSeen,
  onOpenProfile,
  onGoToSaved,
}) {
  const borderCol = dark ? 'border-[#262626]' : 'border-[#dbdbdb]';
  const mutedText = dark ? 'text-[#a8a8a8]' : 'text-[#737373]';

  const accuracy =
    answeredQuizzesCount > 0
      ? Math.round((correctQuizzesCount / answeredQuizzesCount) * 100)
      : null;

  return (
    <div className={`min-h-screen pb-20 ${dark ? 'bg-black text-[#f5f5f5]' : 'bg-white text-[#262626]'}`}>
      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-current/10">
        <div className="flex items-center gap-5">
          <div
            className={`flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-full border text-[20px] font-bold ${
              dark
                ? 'border-[#363636] bg-[#1c1c1c] text-white'
                : 'border-[#dbdbdb] bg-[#efefef] text-[#262626]'
            }`}
          >
            MD
          </div>

          <div className="grid flex-1 grid-cols-3 text-center">
            <div>
              <div className="text-[17px] font-bold">{followingHandles.length}</div>
              <div className={`text-[12px] ${mutedText}`}>Seguindo</div>
            </div>
            <button type="button" onClick={onGoToSaved} className="hover:opacity-75">
              <div className="text-[17px] font-bold">{savedCount}</div>
              <div className={`text-[12px] ${mutedText}`}>Salvos</div>
            </button>
            <div>
              <div className="text-[17px] font-bold">
                {accuracy !== null ? `${accuracy}%` : '—'}
              </div>
              <div className={`text-[12px] ${mutedText}`}>
                {answeredQuizzesCount > 0
                  ? `${correctQuizzesCount}/${answeredQuizzesCount} quizzes`
                  : 'Quizzes'}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 text-[13.5px]">
          <div className="font-bold">Meu Plano de Estudos</div>
          <p className={`mt-0.5 text-[12.5px] ${mutedText}`}>
            O seu Feed diário exibe apenas os assuntos que você está seguindo abaixo.
          </p>
        </div>

        {/* Seen Cards Progress + Reset */}
        <div
          className={`mt-3.5 flex items-center justify-between rounded-xl border px-3 py-2.5 text-[12px] ${borderCol} ${
            dark ? 'bg-[#121212]' : 'bg-[#fafafa]'
          }`}
        >
          <div>
            <span className="font-semibold">
              {seenCount} / {totalPostsCount}
            </span>{' '}
            <span className={mutedText}>cards já vistos no feed</span>
          </div>
          {seenCount > 0 && (
            <button
              type="button"
              onClick={onResetSeen}
              className="inline-flex items-center gap-1 font-semibold text-[#0095f6] hover:underline"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Resetar ciclo</span>
            </button>
          )}
        </div>
      </div>

      {/* Following / Subjects Manager */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-bold">Assuntos disponíveis ({profiles.length})</h3>
          <div className="flex items-center gap-3 text-[12px] font-semibold">
            <button
              type="button"
              onClick={onFollowAll}
              className="text-[#0095f6] hover:underline"
            >
              Seguir todos
            </button>
            {followingHandles.length > 0 && (
              <button
                type="button"
                onClick={onUnfollowAll}
                className={`${mutedText} hover:underline`}
              >
                Pausar todos
              </button>
            )}
          </div>
        </div>

        <div className={`divide-y rounded-xl border ${borderCol} ${dark ? 'divide-[#262626]' : 'divide-[#efefef]'}`}>
          {profiles.map((prof) => {
            const isFollowing = followingHandles.includes(prof.handle);
            const postCount = postsCountByProfile[prof.handle] || 0;

            return (
              <div
                key={prof.handle}
                className="flex items-center justify-between gap-3 p-3"
              >
                <button
                  type="button"
                  onClick={() => onOpenProfile(prof.handle)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white"
                    style={{ backgroundColor: prof.avatarBg }}
                  >
                    {prof.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[13.5px] font-semibold">@{prof.handle}</div>
                    <div className={`truncate text-[12px] ${mutedText}`}>
                      {prof.name} · {postCount} posts · {prof.microtemasCount} fichas
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleFollow(prof.handle)}
                  className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold transition ${
                    isFollowing
                      ? dark
                        ? 'bg-[#262626] text-white hover:bg-[#363636]'
                        : 'bg-[#efefef] text-[#262626] hover:bg-[#e2e2e2]'
                      : 'bg-[#0095f6] text-white hover:bg-[#1877f2]'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Seguindo</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Seguir</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Quick stats card */}
        <div
          className={`mt-5 rounded-xl border p-3.5 text-[12.5px] space-y-2 ${borderCol} ${
            dark ? 'bg-[#121212]' : 'bg-[#fafafa]'
          }`}
        >
          <div className="font-semibold flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-[#0095f6]" />
            Como funciona na prática
          </div>
          <p className={mutedText}>
            Está em semana de prova de Estabilizadores e Sedativos? Deixe apenas{' '}
            <strong className={dark ? 'text-white' : 'text-[#262626]'}>@estabilizadores_do_humor</strong> e{' '}
            <strong className={dark ? 'text-white' : 'text-[#262626]'}>@sedativos_e_ansioliticos</strong> em{' '}
            <em>Seguindo</em>. Seu Feed principal fica focado só no que você precisa estudar agora.
          </p>
        </div>
      </div>
    </div>
  );
}
