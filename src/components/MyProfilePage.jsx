import React, { useMemo, useRef, useState } from 'react';
import {
  Check,
  Plus,
  BookOpen,
  RotateCcw,
  Flame,
  Target,
  Pencil,
  Download,
  Upload,
  FileText,
  SlidersHorizontal,
  Moon,
  Sun,
  Trash2,
  X,
  ExternalLink,
  UserCheck,
} from 'lucide-react';

const STAGES = [
  'Ciclo Básico',
  'Ciclo Clínico',
  'Internato',
  'Residência / R+',
  'Generalista',
  'Especialista',
];

const AVATAR_COLORS = [
  '#0095f6',
  '#10b981',
  '#8b5cf6',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#0ea5e9',
  '#334155',
];

const DAILY_GOALS = [5, 10, 15, 20];

export default function MyProfilePage({
  account,
  accountInitials,
  todayCount,
  streak,
  profiles,
  posts,
  postsCountByProfile,
  followingHandles,
  savedCount,
  likedCount,
  quizAnswers,
  notesMap,
  correctQuizzesCount,
  answeredQuizzesCount,
  seenCount,
  totalPostsCount,
  dark,
  onToggleDark,
  onUpdateAccount,
  onToggleFollow,
  onFollowAll,
  onUnfollowAll,
  onResetSeen,
  onOpenProfile,
  onOpenPostFicha,
  onGoToSaved,
  onExportBackup,
  onImportBackup,
  onResetAllData,
}) {
  const [subTab, setSubTab] = useState('assuntos'); // 'assuntos' | 'notas' | 'conta'
  const [editOpen, setEditOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: account.name,
    handle: account.handle,
    stage: account.stage,
    bio: account.bio,
    dailyGoal: account.dailyGoal || 10,
    avatarColor: account.avatarColor || '#0095f6',
  });

  const openEditModal = () => {
    setForm({
      name: account.name,
      handle: account.handle,
      stage: account.stage,
      bio: account.bio,
      dailyGoal: account.dailyGoal || 10,
      avatarColor: account.avatarColor || '#0095f6',
    });
    setEditOpen(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const cleanHandle = form.handle.trim().replace(/^@+/, '').toLowerCase() || 'residente.med';
    onUpdateAccount({
      name: form.name.trim() || 'Meu Perfil',
      handle: cleanHandle,
      stage: form.stage,
      bio: form.bio.trim(),
      dailyGoal: Number(form.dailyGoal) || 10,
      avatarColor: form.avatarColor,
    });
    setEditOpen(false);
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ''));
        const ok = onImportBackup(parsed);
        setImportStatus(ok ? 'ok' : 'error');
      } catch {
        setImportStatus('error');
      }
      setTimeout(() => setImportStatus(null), 3500);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const borderCol = dark ? 'border-[#262626]' : 'border-[#dbdbdb]';
  const mutedText = dark ? 'text-[#a8a8a8]' : 'text-[#737373]';
  const cardBg = dark ? 'bg-[#121212]' : 'bg-[#fafafa]';
  const btnSecondary = dark
    ? 'bg-[#262626] text-white hover:bg-[#363636]'
    : 'bg-[#efefef] text-[#262626] hover:bg-[#e2e2e2]';

  const accuracy =
    answeredQuizzesCount > 0
      ? Math.round((correctQuizzesCount / answeredQuizzesCount) * 100)
      : null;

  const dailyGoal = account.dailyGoal || 10;
  const dailyPct = Math.min(100, Math.round((todayCount / dailyGoal) * 100));

  const notedPosts = useMemo(() => {
    const postMap = {};
    posts.forEach((p) => {
      postMap[p.id] = p;
    });
    return Object.entries(notesMap || {})
      .filter(([, text]) => Boolean(text && text.trim()))
      .map(([postId, text]) => ({
        postId,
        text: text.trim(),
        post: postMap[postId] || null,
      }))
      .filter((item) => item.post !== null);
  }, [notesMap, posts]);

  const quizStatsByProfile = useMemo(() => {
    const stats = {};
    posts.forEach((post) => {
      if (post.format !== 'quiz') return;
      const ans = quizAnswers[post.id];
      if (!ans) return;
      if (!stats[post.profile]) stats[post.profile] = { total: 0, correct: 0 };
      stats[post.profile].total += 1;
      const rightOpt = post.slides?.[0]?.options?.find((o) => o.isCorrect);
      if (rightOpt && rightOpt.id === ans) stats[post.profile].correct += 1;
    });
    return stats;
  }, [posts, quizAnswers]);

  return (
    <div className={`min-h-screen pb-20 ${dark ? 'bg-black text-[#f5f5f5]' : 'bg-white text-[#262626]'}`}>
      {/* Top Personal Handle Bar */}
      <div className={`flex items-center justify-between border-b px-4 py-2.5 ${borderCol}`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="truncate text-[15px] font-bold">@{account.handle}</span>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${
              dark ? 'bg-[#1f1f1f] text-[#d4d4d4]' : 'bg-[#efefef] text-[#525252]'
            }`}
          >
            {account.stage}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleDark}
            className={`rounded-lg p-1.5 transition ${dark ? 'hover:bg-[#1c1c1c]' : 'hover:bg-[#f2f2f2]'}`}
            title={dark ? 'Modo claro' : 'Modo escuro'}
            aria-label="Alternar tema"
          >
            {dark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
          <button
            type="button"
            onClick={openEditModal}
            className={`rounded-lg p-1.5 transition ${dark ? 'hover:bg-[#1c1c1c]' : 'hover:bg-[#f2f2f2]'}`}
            title="Editar perfil"
            aria-label="Editar perfil"
          >
            <Pencil className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Header */}
      <div className={`px-4 pt-4 pb-4 border-b ${borderCol}`}>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={openEditModal}
            className="flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-full text-[22px] font-bold text-white shadow-sm transition hover:opacity-90"
            style={{ backgroundColor: account.avatarColor || '#0095f6' }}
            title="Editar avatar e perfil"
          >
            {accountInitials}
          </button>

          <div className="grid flex-1 grid-cols-3 text-center">
            <button type="button" onClick={() => setSubTab('assuntos')} className="hover:opacity-75">
              <div className="text-[17px] font-bold">{followingHandles.length}</div>
              <div className={`text-[12px] ${mutedText}`}>Seguindo</div>
            </button>
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

        {/* Name & Bio */}
        <div className="mt-3 text-[13.5px]">
          <div className="font-bold">{account.name}</div>
          {account.bio && (
            <p className={`mt-0.5 text-[12.5px] leading-snug ${mutedText}`}>{account.bio}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-3.5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={openEditModal}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[12.5px] font-semibold transition ${btnSecondary}`}
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Editar perfil</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('conta')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[12.5px] font-semibold transition ${btnSecondary}`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Conta & Backup</span>
          </button>
        </div>

        {!account.configured && (
          <button
            type="button"
            onClick={openEditModal}
            className={`mt-3 flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-[12px] transition ${
              dark
                ? 'border-[#0095f6]/40 bg-[#0095f6]/10 text-[#60a5fa]'
                : 'border-[#0095f6]/30 bg-[#0095f6]/5 text-[#0074cc]'
            }`}
          >
            <span className="flex items-center gap-2 font-medium">
              <UserCheck className="h-4 w-4 shrink-0" />
              Personalize seu nome, fase na medicina e meta diária
            </span>
            <span className="font-bold">Configurar →</span>
          </button>
        )}

        {/* Daily Goal & Streak */}
        <div className={`mt-3.5 rounded-xl border p-3 text-[12px] ${borderCol} ${cardBg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-semibold">
              <Target className="h-3.5 w-3.5 text-[#0095f6]" />
              <span>
                Meta de hoje: {todayCount} / {dailyGoal} cards
              </span>
            </div>
            <div className="flex items-center gap-1 font-semibold text-amber-500">
              <Flame className="h-3.5 w-3.5" />
              <span>
                {streak} {streak === 1 ? 'dia' : 'dias'}
              </span>
            </div>
          </div>

          <div className={`mt-2 h-1.5 w-full overflow-hidden rounded-full ${dark ? 'bg-[#262626]' : 'bg-[#e5e5e5]'}`}>
            <div
              className={`h-full rounded-full transition-all ${
                dailyPct >= 100 ? 'bg-emerald-500' : 'bg-[#0095f6]'
              }`}
              style={{ width: `${dailyPct}%` }}
            />
          </div>

          <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-current/10">
            <div>
              <span className="font-semibold">
                {seenCount} / {totalPostsCount}
              </span>{' '}
              <span className={mutedText}>cards já vistos no ciclo</span>
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
      </div>

      {/* 3 Sub-Tabs */}
      <div className={`grid grid-cols-3 border-b text-[12.5px] font-semibold ${borderCol}`}>
        <button
          type="button"
          onClick={() => setSubTab('assuntos')}
          className={`flex items-center justify-center gap-1.5 py-2.5 border-b-2 transition ${
            subTab === 'assuntos'
              ? dark
                ? 'border-white text-white'
                : 'border-[#262626] text-[#262626]'
              : `border-transparent ${mutedText}`
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          <span>Assuntos</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('notas')}
          className={`flex items-center justify-center gap-1.5 py-2.5 border-b-2 transition ${
            subTab === 'notas'
              ? dark
                ? 'border-white text-white'
                : 'border-[#262626] text-[#262626]'
              : `border-transparent ${mutedText}`
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Notas ({notedPosts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('conta')}
          className={`flex items-center justify-center gap-1.5 py-2.5 border-b-2 transition ${
            subTab === 'conta'
              ? dark
                ? 'border-white text-white'
                : 'border-[#262626] text-[#262626]'
              : `border-transparent ${mutedText}`
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Conta</span>
        </button>
      </div>

      {/* Sub-tab 1: Assuntos */}
      {subTab === 'assuntos' && (
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
              const qStat = quizStatsByProfile[prof.handle];

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
                        {prof.name} · {postCount} posts
                        {qStat ? ` · ${qStat.correct}/${qStat.total} quiz` : ''}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleFollow(prof.handle)}
                    className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-3.5 py-1.5 text-[12.5px] font-semibold transition ${
                      isFollowing
                        ? btnSecondary
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
        </div>
      )}

      {/* Sub-tab 2: Minhas Notas */}
      {subTab === 'notas' && (
        <div className="px-4 pt-4">
          {notedPosts.length === 0 ? (
            <div className={`rounded-xl border p-6 text-center ${borderCol} ${cardBg}`}>
              <FileText className={`mx-auto h-8 w-8 mb-2 ${mutedText}`} />
              <div className="text-[14px] font-semibold">Nenhuma anotação ainda</div>
              <p className={`mt-1 text-[12.5px] ${mutedText}`}>
                Abra qualquer ficha clínica no feed e salve lembretes pessoais de conduta ou macetes de prova.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notedPosts.map(({ postId, text, post }) => (
                <div
                  key={postId}
                  className={`rounded-xl border p-3.5 ${borderCol} ${cardBg}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className={`text-[11px] font-semibold ${mutedText}`}>
                        @{post.profile} · {post.tag}
                      </div>
                      <div className="text-[13.5px] font-bold leading-snug mt-0.5">
                        {post.fullCard?.title || post.caption}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenPostFicha(post)}
                      className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-[#0095f6]/15 px-2.5 py-1 text-[11.5px] font-semibold text-[#0095f6] hover:bg-[#0095f6]/25"
                    >
                      <span>Abrir ficha</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                  <p
                    className={`mt-2 whitespace-pre-wrap rounded-lg border px-2.5 py-2 text-[12.5px] ${
                      dark
                        ? 'border-[#262626] bg-black/50 text-[#e5e5e5]'
                        : 'border-[#e5e5e5] bg-white text-[#262626]'
                    }`}
                  >
                    {text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 3: Conta & Backup */}
      {subTab === 'conta' && (
        <div className="px-4 pt-4 space-y-4">
          {/* Resumo da conta */}
          <div className={`rounded-xl border p-3.5 space-y-2 ${borderCol} ${cardBg}`}>
            <div className="text-[13.5px] font-bold">Resumo da conta local</div>
            <div className={`grid grid-cols-2 gap-2 text-[12px] ${mutedText}`}>
              <div>Curtidos: <strong className={dark ? 'text-white' : 'text-[#262626]'}>{likedCount}</strong></div>
              <div>Salvos: <strong className={dark ? 'text-white' : 'text-[#262626]'}>{savedCount}</strong></div>
              <div>Notas: <strong className={dark ? 'text-white' : 'text-[#262626]'}>{notedPosts.length}</strong></div>
              <div>Meta diária: <strong className={dark ? 'text-white' : 'text-[#262626]'}>{dailyGoal} cards/dia</strong></div>
            </div>
          </div>

          {/* Aparência */}
          <div className={`flex items-center justify-between rounded-xl border p-3.5 ${borderCol} ${cardBg}`}>
            <div>
              <div className="text-[13.5px] font-semibold">Aparência</div>
              <div className={`text-[12px] ${mutedText}`}>
                {dark ? 'Modo escuro ativado' : 'Modo claro ativado'}
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleDark}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition ${btnSecondary}`}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>{dark ? 'Claro' : 'Escuro'}</span>
            </button>
          </div>

          {/* Export / Import */}
          <div className={`rounded-xl border p-3.5 space-y-3 ${borderCol} ${cardBg}`}>
            <div>
              <div className="text-[13.5px] font-semibold">Backup dos seus dados</div>
              <p className={`mt-0.5 text-[12px] ${mutedText}`}>
                Como seus dados ficam salvos localmente neste navegador, exporte um backup JSON para levar suas notas, salvos e progresso para outro celular ou computador.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExportBackup}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-[#0095f6] py-2 text-[12.5px] font-semibold text-white hover:bg-[#1877f2]"
              >
                <Download className="h-4 w-4" />
                <span>Exportar JSON</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[12.5px] font-semibold transition ${btnSecondary}`}
              >
                <Upload className="h-4 w-4" />
                <span>Importar JSON</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleFileImport}
                className="hidden"
              />
            </div>

            {importStatus === 'ok' && (
              <div className="rounded-lg bg-emerald-500/15 px-3 py-2 text-[12px] font-medium text-emerald-500">
                Backup restaurado com sucesso!
              </div>
            )}
            {importStatus === 'error' && (
              <div className="rounded-lg bg-red-500/15 px-3 py-2 text-[12px] font-medium text-red-400">
                Arquivo inválido. Selecione um backup JSON exportado pelo MedScrolling.
              </div>
            )}
          </div>

          {/* Zona de reset */}
          <div className={`rounded-xl border p-3.5 ${borderCol} ${cardBg}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[13.5px] font-semibold text-red-500">Zerar progresso de estudo</div>
                <div className={`text-[12px] ${mutedText}`}>
                  Limpa vistos, quizzes, curtidas, salvos e notas deste dispositivo.
                </div>
              </div>
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="shrink-0 rounded-lg border border-red-500/40 px-3 py-1.5 text-[12px] font-semibold text-red-500 hover:bg-red-500/10"
                >
                  Zerar
                </button>
              ) : (
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onResetAllData();
                      setConfirmReset(false);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Confirmar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className={`rounded-lg px-2.5 py-1.5 text-[12px] font-semibold ${btnSecondary}`}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4"
          onClick={() => setEditOpen(false)}
        >
          <form
            onSubmit={handleSaveProfile}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-[440px] rounded-t-2xl sm:rounded-2xl border p-4 space-y-4 ${
              dark ? 'border-[#262626] bg-[#121212] text-white' : 'border-[#dbdbdb] bg-white text-[#262626]'
            }`}
          >
            <div className="flex items-center justify-between border-b border-current/10 pb-3">
              <h3 className="text-[15px] font-bold">Editar conta pessoal</h3>
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="rounded-lg p-1 hover:bg-current/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div>
                <label className={`block text-[11.5px] font-semibold mb-1 ${mutedText}`}>
                  Nome de exibição
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Davi Bezerra"
                  maxLength={40}
                  className={`w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#0095f6] ${
                    dark ? 'border-[#363636] bg-black text-white' : 'border-[#dbdbdb] bg-[#fafafa]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11.5px] font-semibold mb-1 ${mutedText}`}>
                  @usuário
                </label>
                <input
                  type="text"
                  value={form.handle}
                  onChange={(e) => setForm((f) => ({ ...f, handle: e.target.value }))}
                  placeholder="davi.med"
                  maxLength={30}
                  className={`w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#0095f6] ${
                    dark ? 'border-[#363636] bg-black text-white' : 'border-[#dbdbdb] bg-[#fafafa]'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-[11.5px] font-semibold mb-1.5 ${mutedText}`}>
                  Fase na Medicina
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STAGES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, stage: st }))}
                      className={`rounded-full px-3 py-1 text-[11.5px] font-semibold transition ${
                        form.stage === st
                          ? 'bg-[#0095f6] text-white'
                          : btnSecondary
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={`block text-[11.5px] font-semibold mb-1 ${mutedText}`}>
                  Bio / Foco atual
                </label>
                <textarea
                  rows={2}
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  maxLength={140}
                  className={`w-full resize-none rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#0095f6] ${
                    dark ? 'border-[#363636] bg-black text-white' : 'border-[#dbdbdb] bg-[#fafafa]'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <label className={`block text-[11.5px] font-semibold mb-1.5 ${mutedText}`}>
                    Meta diária (cards)
                  </label>
                  <div className="flex gap-1.5">
                    {DAILY_GOALS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, dailyGoal: g }))}
                        className={`rounded-lg px-2.5 py-1 text-[12px] font-semibold transition ${
                          form.dailyGoal === g ? 'bg-[#0095f6] text-white' : btnSecondary
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-[11.5px] font-semibold mb-1.5 ${mutedText}`}>
                    Cor do avatar
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {AVATAR_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, avatarColor: col }))}
                        className={`h-6 w-6 rounded-full transition ${
                          form.avatarColor === col ? 'ring-2 ring-[#0095f6] ring-offset-2 ring-offset-black' : ''
                        }`}
                        style={{ backgroundColor: col }}
                        aria-label={`Cor ${col}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className={`rounded-lg px-4 py-2 text-[13px] font-semibold ${btnSecondary}`}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#0095f6] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#1877f2]"
              >
                Salvar conta
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
