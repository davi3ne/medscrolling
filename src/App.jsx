import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import {
  Home,
  Search,
  Bookmark,
  User,
  Sun,
  Moon,
  RefreshCw,
  CheckCircle2,
  X,
  Users,
} from 'lucide-react';
import profilesData from './data/profiles.json';
import postsData from './data/posts.json';
import storiesData from './data/stories.json';
import PostCard from './components/PostCard';
import FichaModal from './components/FichaModal';
import StoryViewer from './components/StoryViewer';
import ProfilePage from './components/ProfilePage';
import MyProfilePage from './components/MyProfilePage';

const FORMAT_LABELS = [
  { id: 'all', label: 'Todos' },
  { id: 'carrossel', label: 'Carrossel' },
  { id: 'quiz', label: 'Mini-Quiz' },
  { id: 'comparativo', label: 'Comparativo Vs' },
  { id: 'red_flag', label: 'Red Flag' },
  { id: 'cena_real', label: 'Cena Real' },
];

const ALL_HANDLES = profilesData.map((p) => p.handle);

function shuffleArray(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('medfeed_dark') === 'true');
  const [tab, setTab] = useState('feed'); // 'feed' | 'explore' | 'saved' | 'me'
  const [viewingProfile, setViewingProfile] = useState(null); // handle string | null
  const [selectedFormat, setSelectedFormat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedSeed, setFeedSeed] = useState(() => Math.random());
  const [refreshing, setRefreshing] = useState(false);
  const [activeFichaPost, setActiveFichaPost] = useState(null);
  const [storyViewerState, setStoryViewerState] = useState(null); // { handles: string[], index: number } | null

  const [seenIds, setSeenIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('medfeed_seen') || '[]');
    } catch {
      return [];
    }
  });
  // Snapshot of seenIds at the moment the current feed batch was drawn
  const seenSnapshotRef = useRef(seenIds);

  const [followingHandles, setFollowingHandles] = useState(() => {
    try {
      const saved = localStorage.getItem('medfeed_following');
      return saved ? JSON.parse(saved) : ALL_HANDLES;
    } catch {
      return ALL_HANDLES;
    }
  });

  const [viewedStories, setViewedStories] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('medfeed_viewed_stories') || '[]');
    } catch {
      return [];
    }
  });

  const [likedIds, setLikedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('medfeed_likes') || '[]');
    } catch {
      return [];
    }
  });

  const [savedIds, setSavedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('medfeed_saves') || '[]');
    } catch {
      return [];
    }
  });

  const [quizAnswers, setQuizAnswers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('medfeed_quizzes') || '{}');
    } catch {
      return {};
    }
  });

  const [notesMap, setNotesMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('medfeed_notes') || '{}');
    } catch {
      return {};
    }
  });

  const defaultAccount = {
    name: 'Meu Perfil',
    handle: 'residente.med',
    stage: 'Internato / Residência',
    bio: 'Trocando o doomscrolling por revisão clínica diária.',
    dailyGoal: 10,
    avatarColor: '#0095f6',
    configured: false,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  const [account, setAccount] = useState(() => {
    try {
      const raw = localStorage.getItem('medscrolling_account');
      return raw ? { ...defaultAccount, ...JSON.parse(raw) } : defaultAccount;
    } catch {
      return defaultAccount;
    }
  });

  const [dailyActivity, setDailyActivity] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('medscrolling_activity') || '{}');
    } catch {
      return {};
    }
  });

  useEffect(() => localStorage.setItem('medfeed_dark', String(dark)), [dark]);
  useEffect(() => localStorage.setItem('medfeed_following', JSON.stringify(followingHandles)), [followingHandles]);
  useEffect(() => localStorage.setItem('medfeed_viewed_stories', JSON.stringify(viewedStories)), [viewedStories]);
  useEffect(() => localStorage.setItem('medfeed_likes', JSON.stringify(likedIds)), [likedIds]);
  useEffect(() => localStorage.setItem('medfeed_saves', JSON.stringify(savedIds)), [savedIds]);
  useEffect(() => localStorage.setItem('medfeed_quizzes', JSON.stringify(quizAnswers)), [quizAnswers]);
  useEffect(() => localStorage.setItem('medfeed_seen', JSON.stringify(seenIds)), [seenIds]);
  useEffect(() => localStorage.setItem('medfeed_notes', JSON.stringify(notesMap)), [notesMap]);
  useEffect(() => localStorage.setItem('medscrolling_account', JSON.stringify(account)), [account]);
  useEffect(() => localStorage.setItem('medscrolling_activity', JSON.stringify(dailyActivity)), [dailyActivity]);

  const profileMap = useMemo(() => {
    const map = {};
    profilesData.forEach((p) => {
      map[p.handle] = p;
    });
    return map;
  }, []);

  const postsCountByProfile = useMemo(() => {
    const counts = {};
    postsData.forEach((p) => {
      counts[p.profile] = (counts[p.profile] || 0) + 1;
    });
    return counts;
  }, []);

  // Randomized feed: unseen posts first (shuffled), then previously seen posts (shuffled)
  const { feedUnseen, feedSeen } = useMemo(() => {
    const allowed = postsData.filter((post) => followingHandles.includes(post.profile));
    const snapshot = seenSnapshotRef.current;
    const unseen = shuffleArray(allowed.filter((p) => !snapshot.includes(p.id)));
    const seen = shuffleArray(allowed.filter((p) => snapshot.includes(p.id)));
    return { feedUnseen: unseen, feedSeen: seen };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followingHandles, feedSeed]);

  const feedPosts = useMemo(() => [...feedUnseen, ...feedSeen], [feedUnseen, feedSeen]);

  const explorePosts = useMemo(() => {
    return postsData.filter((post) => {
      if (selectedFormat !== 'all' && post.format !== selectedFormat) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${post.id} ${post.profile} ${post.tag} ${post.location} ${post.caption} ${post.fullCard.title}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [selectedFormat, searchQuery]);

  const savedPosts = useMemo(() => {
    return postsData.filter((post) => savedIds.includes(post.id));
  }, [savedIds]);

  const getTodayKey = () => new Date().toISOString().slice(0, 10);

  const recordTodayActivity = useCallback(() => {
    const key = getTodayKey();
    setDailyActivity((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  }, []);

  const markPostSeen = useCallback(
    (id) => {
      setSeenIds((prev) => {
        if (prev.includes(id)) return prev;
        recordTodayActivity();
        return [...prev, id];
      });
    },
    [recordTodayActivity]
  );

  const todayCount = dailyActivity[getTodayKey()] || 0;

  const streak = useMemo(() => {
    let count = 0;
    const d = new Date();
    const todayStr = d.toISOString().slice(0, 10);
    if (!dailyActivity[todayStr]) {
      d.setDate(d.getDate() - 1);
    }
    while (true) {
      const key = d.toISOString().slice(0, 10);
      if (dailyActivity[key] > 0) {
        count += 1;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [dailyActivity]);

  const exportBackup = () => {
    const payload = {
      app: 'MedScrolling',
      version: 1,
      exportedAt: new Date().toISOString(),
      account,
      followingHandles,
      likedIds,
      savedIds,
      quizAnswers,
      seenIds,
      notesMap,
      dailyActivity,
      dark,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medscrolling-backup-${getTodayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackup = (data) => {
    if (!data || typeof data !== 'object') return false;
    if (data.account) setAccount({ ...defaultAccount, ...data.account });
    if (Array.isArray(data.followingHandles)) setFollowingHandles(data.followingHandles);
    if (Array.isArray(data.likedIds)) setLikedIds(data.likedIds);
    if (Array.isArray(data.savedIds)) setSavedIds(data.savedIds);
    if (data.quizAnswers && typeof data.quizAnswers === 'object') setQuizAnswers(data.quizAnswers);
    if (Array.isArray(data.seenIds)) {
      setSeenIds(data.seenIds);
      seenSnapshotRef.current = data.seenIds;
    }
    if (data.notesMap && typeof data.notesMap === 'object') setNotesMap(data.notesMap);
    if (data.dailyActivity && typeof data.dailyActivity === 'object') setDailyActivity(data.dailyActivity);
    if (typeof data.dark === 'boolean') setDark(data.dark);
    setFeedSeed(Math.random());
    return true;
  };

  const resetAllData = () => {
    setLikedIds([]);
    setSavedIds([]);
    setQuizAnswers({});
    setSeenIds([]);
    seenSnapshotRef.current = [];
    setNotesMap({});
    setDailyActivity({});
    setViewedStories([]);
    setFollowingHandles(ALL_HANDLES);
    setFeedSeed(Math.random());
  };

  const accountInitials = useMemo(() => {
    const parts = (account.name || account.handle || 'MS').trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (parts[0] || 'MS').slice(0, 2).toUpperCase();
  }, [account.name, account.handle]);

  const refreshFeed = () => {
    setRefreshing(true);
    seenSnapshotRef.current = seenIds;
    setFeedSeed(Math.random());
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setRefreshing(false), 450);
  };

  const storyProfiles = useMemo(() => {
    const followed = profilesData.filter((p) => followingHandles.includes(p.handle));
    return followed.length > 0 ? followed : profilesData;
  }, [followingHandles]);

  const toggleFollow = (handle) => {
    setFollowingHandles((prev) =>
      prev.includes(handle) ? prev.filter((h) => h !== handle) : [...prev, handle]
    );
  };

  const toggleLike = (id) => {
    setLikedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const doubleTapLike = (id) => {
    setLikedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const toggleSave = (id) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectQuizOption = (postId, optionId) => {
    setQuizAnswers((prev) => ({ ...prev, [postId]: optionId }));
  };

  const resetQuizOption = (postId) => {
    setQuizAnswers((prev) => {
      const next = { ...prev };
      delete next[postId];
      return next;
    });
  };

  const saveNote = (postId, text) => {
    setNotesMap((prev) => ({ ...prev, [postId]: text }));
  };

  const resetSeen = () => {
    setSeenIds([]);
    seenSnapshotRef.current = [];
    setFeedSeed(Math.random());
  };

  const correctQuizzesCount = useMemo(() => {
    let correct = 0;
    postsData.forEach((post) => {
      if (post.format === 'quiz' && quizAnswers[post.id]) {
        const chosen = post.content.options.find((o) => o.id === quizAnswers[post.id]);
        if (chosen?.correct) correct += 1;
      }
    });
    return correct;
  }, [quizAnswers]);

  const openProfile = (handle) => {
    setViewingProfile(handle);
    window.scrollTo({ top: 0 });
  };

  const openStory = (handle) => {
    const handlesList = storyProfiles.map((p) => p.handle);
    let idx = handlesList.indexOf(handle);
    if (idx === -1) {
      setStoryViewerState({ handles: [handle], index: 0 });
    } else {
      setStoryViewerState({ handles: handlesList, index: idx });
    }
  };

  const markStoryViewed = useCallback((handle) => {
    setViewedStories((prev) => (prev.includes(handle) ? prev : [...prev, handle]));
  }, []);

  const handleFilterTag = (tag) => {
    setViewingProfile(null);
    setSearchQuery(tag);
    setTab('explore');
    window.scrollTo({ top: 0 });
  };

  const borderCol = dark ? 'border-[#262626]' : 'border-[#dbdbdb]';
  const mutedText = dark ? 'text-[#a8a8a8]' : 'text-[#737373]';

  const activePosts =
    tab === 'feed' ? feedPosts : tab === 'explore' ? explorePosts : savedPosts;

  return (
    <div
      className={`min-h-screen flex justify-center ${
        dark ? 'bg-black text-[#f5f5f5]' : 'bg-[#fafafa] text-[#262626]'
      }`}
    >
      {/* Centered Instagram Mobile Shell */}
      <div
        className={`relative flex min-h-screen w-full max-w-[470px] flex-col sm:border-x ${borderCol} ${
          dark ? 'bg-black' : 'bg-white'
        }`}
      >
        {/* If viewing a specific @perfil page */}
        {viewingProfile ? (
          <ProfilePage
            profile={profileMap[viewingProfile]}
            posts={postsData.filter((p) => p.profile === viewingProfile)}
            dark={dark}
            isFollowing={followingHandles.includes(viewingProfile)}
            hasViewedStory={viewedStories.includes(viewingProfile)}
            likedIds={likedIds}
            savedIds={savedIds}
            notesMap={notesMap}
            quizAnswers={quizAnswers}
            onBack={() => setViewingProfile(null)}
            onToggleFollow={toggleFollow}
            onOpenStory={openStory}
            onToggleLike={toggleLike}
            onDoubleTapLike={doubleTapLike}
            onToggleSave={toggleSave}
            onSelectQuizOption={selectQuizOption}
            onResetQuizOption={resetQuizOption}
            onOpenFicha={setActiveFichaPost}
            onFilterTag={handleFilterTag}
          />
        ) : (
          <>
            {/* Top Instagram Header */}
            <header
              className={`sticky top-0 z-40 flex h-[52px] items-center justify-between border-b px-4 ${borderCol} ${
                dark ? 'bg-black/95' : 'bg-white/95'
              } backdrop-blur-sm`}
            >
              <button
                type="button"
                onClick={() => {
                  setTab('feed');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 text-left"
              >
                <span className="text-[21px] font-bold tracking-tight">MedScrolling</span>
              </button>

              <div className="flex items-center gap-1.5">
                {tab === 'feed' && (
                  <button
                    type="button"
                    onClick={refreshFeed}
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                      dark
                        ? 'bg-[#1c1c1c] text-[#d4d4d4] hover:bg-[#262626]'
                        : 'bg-[#efefef] text-[#262626] hover:bg-[#e5e5e5]'
                    }`}
                    title="Puxar novos cards no feed"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    <span>Atualizar</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setDark((d) => !d)}
                  className={`rounded-full p-2 transition ${
                    dark ? 'hover:bg-[#1c1c1c]' : 'hover:bg-[#efefef]'
                  }`}
                  aria-label="Alternar tema"
                  title="Alternar tema claro/escuro"
                >
                  {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>
            </header>

            {/* Stories Tray (Feed only — clicking opens StoryViewer!) */}
            {tab === 'feed' && (
              <div className={`border-b py-3 ${borderCol}`}>
                <div className="flex gap-3.5 overflow-x-auto px-3 no-scrollbar">
                  {storyProfiles.map((prof) => {
                    const viewed = viewedStories.includes(prof.handle);
                    return (
                      <button
                        key={prof.handle}
                        type="button"
                        onClick={() => openStory(prof.handle)}
                        className="flex w-[68px] shrink-0 flex-col items-center gap-1"
                      >
                        <div
                          className={`rounded-full p-[2.5px] ${
                            viewed
                              ? dark
                                ? 'bg-[#363636]'
                                : 'bg-[#dbdbdb]'
                              : 'ig-story-ring'
                          }`}
                        >
                          <div
                            className={`flex h-[56px] w-[56px] items-center justify-center rounded-full border-2 text-[14px] font-bold text-white ${
                              dark ? 'border-black' : 'border-white'
                            }`}
                            style={{ backgroundColor: prof.avatarBg }}
                          >
                            {prof.initials}
                          </div>
                        </div>
                        <span
                          className={`w-full truncate text-center text-[11px] ${
                            viewed ? mutedText : 'font-medium'
                          }`}
                        >
                          {prof.handle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Explore Tab Header (All Profiles + Search + Format Chips) */}
            {tab === 'explore' && (
              <div className={`border-b ${borderCol}`}>
                <div className="p-3 space-y-2.5">
                  <div
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 ${
                      dark ? 'bg-[#262626] text-white' : 'bg-[#efefef] text-[#262626]'
                    }`}
                  >
                    <Search className={`h-4 w-4 shrink-0 ${mutedText}`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar tema, fármaco, #tag ou ID (ex.: Lítio, QRS)..."
                      className="w-full bg-transparent text-[13.5px] outline-none placeholder:text-[#737373]"
                    />
                    {searchQuery && (
                      <button type="button" onClick={() => setSearchQuery('')}>
                        <X className="h-4 w-4 text-[#737373]" />
                      </button>
                    )}
                  </div>

                  {/* Format Filter Chips */}
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    {FORMAT_LABELS.map((fmt) => {
                      const active = selectedFormat === fmt.id;
                      return (
                        <button
                          key={fmt.id}
                          type="button"
                          onClick={() => setSelectedFormat(fmt.id)}
                          className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium transition ${
                            active
                              ? dark
                                ? 'bg-white text-black'
                                : 'bg-[#262626] text-white'
                              : dark
                              ? 'bg-[#262626] text-[#d4d4d4]'
                              : 'bg-[#efefef] text-[#262626]'
                          }`}
                        >
                          {fmt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Discover Profiles Strip */}
                <div className={`border-t px-3 py-2.5 ${borderCol}`}>
                  <div className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${mutedText}`}>
                    Perfis de Assuntos
                  </div>
                  <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                    {profilesData.map((prof) => {
                      const isFollowing = followingHandles.includes(prof.handle);
                      return (
                        <div
                          key={prof.handle}
                          className={`flex w-[142px] shrink-0 flex-col justify-between rounded-xl border p-2.5 ${borderCol} ${
                            dark ? 'bg-[#121212]' : 'bg-[#fafafa]'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => openProfile(prof.handle)}
                            className="flex flex-col items-center text-center"
                          >
                            <div
                              className="flex h-11 w-11 items-center justify-center rounded-full text-[13px] font-bold text-white"
                              style={{ backgroundColor: prof.avatarBg }}
                            >
                              {prof.initials}
                            </div>
                            <div className="mt-1.5 w-full truncate text-[12px] font-semibold">
                              @{prof.handle}
                            </div>
                            <div className={`w-full truncate text-[11px] ${mutedText}`}>
                              {prof.name}
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleFollow(prof.handle)}
                            className={`mt-2 w-full rounded-md py-1 text-[11.5px] font-semibold transition ${
                              isFollowing
                                ? dark
                                  ? 'bg-[#262626] text-white'
                                  : 'bg-[#efefef] text-[#262626]'
                                : 'bg-[#0095f6] text-white'
                            }`}
                          >
                            {isFollowing ? 'Seguindo' : 'Seguir'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Saved Tab Header */}
            {tab === 'saved' && (
              <div className={`flex items-center justify-between border-b px-4 py-3 ${borderCol}`}>
                <div>
                  <h2 className="text-[15px] font-bold">Salvos para Revisão</h2>
                  <p className={`text-[12px] ${mutedText}`}>
                    {savedIds.length} {savedIds.length === 1 ? 'post salvo' : 'posts salvos'}
                  </p>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            {tab === 'me' ? (
              <MyProfilePage
                account={account}
                accountInitials={accountInitials}
                todayCount={todayCount}
                streak={streak}
                profiles={profilesData}
                posts={postsData}
                postsCountByProfile={postsCountByProfile}
                followingHandles={followingHandles}
                savedCount={savedIds.length}
                likedCount={likedIds.length}
                quizAnswers={quizAnswers}
                notesMap={notesMap}
                correctQuizzesCount={correctQuizzesCount}
                answeredQuizzesCount={Object.keys(quizAnswers).length}
                seenCount={seenIds.length}
                totalPostsCount={postsData.length}
                dark={dark}
                onToggleDark={() => setDark((d) => !d)}
                onUpdateAccount={(next) => setAccount((prev) => ({ ...prev, ...next, configured: true }))}
                onToggleFollow={toggleFollow}
                onFollowAll={() => setFollowingHandles(ALL_HANDLES)}
                onUnfollowAll={() => setFollowingHandles([])}
                onResetSeen={resetSeen}
                onOpenProfile={openProfile}
                onOpenPostFicha={setActiveFichaPost}
                onGoToSaved={() => setTab('saved')}
                onExportBackup={exportBackup}
                onImportBackup={importBackup}
                onResetAllData={resetAllData}
              />
            ) : (
              <main className="flex-1 pb-16">
                {activePosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                    {tab === 'feed' ? (
                      <>
                        <Users className={`h-10 w-10 mb-3 ${mutedText}`} />
                        <div className="text-[15px] font-semibold">
                          Você não está seguindo nenhum assunto
                        </div>
                        <p className={`mt-1 text-[13px] ${mutedText}`}>
                          Seu feed mostra apenas os perfis que você segue. Escolha os temas que quer estudar hoje.
                        </p>
                        <div className="mt-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setTab('me')}
                            className="rounded-lg bg-[#0095f6] px-4 py-1.5 text-[13px] font-semibold text-white"
                          >
                            Gerenciar assuntos
                          </button>
                          <button
                            type="button"
                            onClick={() => setTab('explore')}
                            className={`rounded-lg px-4 py-1.5 text-[13px] font-semibold ${
                              dark ? 'bg-[#262626] text-white' : 'bg-[#efefef] text-[#262626]'
                            }`}
                          >
                            Explorar
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Bookmark className={`h-10 w-10 mb-3 ${mutedText}`} />
                        <div className="text-[15px] font-semibold">
                          {tab === 'saved' ? 'Nenhum post salvo ainda' : 'Nenhum post encontrado'}
                        </div>
                        <p className={`mt-1 text-[13px] ${mutedText}`}>
                          {tab === 'saved'
                            ? 'Toque no ícone de bandeirinha nos posts do feed para revisar depois.'
                            : 'Tente limpar a busca ou escolher outro formato.'}
                        </p>
                        {tab === 'explore' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFormat('all');
                              setSearchQuery('');
                            }}
                            className="mt-4 rounded-lg bg-[#0095f6] px-4 py-1.5 text-[13px] font-semibold text-white"
                          >
                            Limpar busca
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ) : tab === 'feed' ? (
                  <>
                    {feedUnseen.map((post) => (
                      <PostCard
                        key={`${feedSeed}-${post.id}`}
                        post={post}
                        profile={profileMap[post.profile]}
                        dark={dark}
                        liked={likedIds.includes(post.id)}
                        saved={savedIds.includes(post.id)}
                        isFollowing={followingHandles.includes(post.profile)}
                        hasNote={Boolean(notesMap[post.id]?.trim())}
                        quizAnswer={quizAnswers[post.id]}
                        onToggleLike={toggleLike}
                        onDoubleTapLike={() => doubleTapLike(post.id)}
                        onToggleSave={toggleSave}
                        onToggleFollow={toggleFollow}
                        onSelectQuizOption={selectQuizOption}
                        onResetQuizOption={resetQuizOption}
                        onOpenFicha={setActiveFichaPost}
                        onFilterProfile={openProfile}
                        onFilterTag={handleFilterTag}
                        onSeen={markPostSeen}
                      />
                    ))}

                    {feedUnseen.length > 0 && feedSeen.length > 0 && (
                      <div
                        className={`flex flex-col items-center justify-center border-b px-6 py-7 text-center ${borderCol}`}
                      >
                        <CheckCircle2 className="h-8 w-8 text-[#0095f6] mb-2" />
                        <div className="text-[14px] font-semibold">
                          Você viu os novos cards de hoje
                        </div>
                        <p className={`mt-0.5 text-[12px] ${mutedText}`}>
                          Abaixo estão posts já vistos para revisão espaçada.
                        </p>
                      </div>
                    )}

                    {feedSeen.map((post) => (
                      <PostCard
                        key={`${feedSeed}-${post.id}`}
                        post={post}
                        profile={profileMap[post.profile]}
                        dark={dark}
                        liked={likedIds.includes(post.id)}
                        saved={savedIds.includes(post.id)}
                        isFollowing={followingHandles.includes(post.profile)}
                        hasNote={Boolean(notesMap[post.id]?.trim())}
                        quizAnswer={quizAnswers[post.id]}
                        onToggleLike={toggleLike}
                        onDoubleTapLike={() => doubleTapLike(post.id)}
                        onToggleSave={toggleSave}
                        onToggleFollow={toggleFollow}
                        onSelectQuizOption={selectQuizOption}
                        onResetQuizOption={resetQuizOption}
                        onOpenFicha={setActiveFichaPost}
                        onFilterProfile={openProfile}
                        onFilterTag={handleFilterTag}
                        onSeen={markPostSeen}
                      />
                    ))}
                  </>
                ) : (
                  activePosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      profile={profileMap[post.profile]}
                      dark={dark}
                      liked={likedIds.includes(post.id)}
                      saved={savedIds.includes(post.id)}
                      isFollowing={followingHandles.includes(post.profile)}
                      hasNote={Boolean(notesMap[post.id]?.trim())}
                      quizAnswer={quizAnswers[post.id]}
                      onToggleLike={toggleLike}
                      onDoubleTapLike={() => doubleTapLike(post.id)}
                      onToggleSave={toggleSave}
                      onToggleFollow={toggleFollow}
                      onSelectQuizOption={selectQuizOption}
                      onResetQuizOption={resetQuizOption}
                      onOpenFicha={setActiveFichaPost}
                      onFilterProfile={openProfile}
                      onFilterTag={handleFilterTag}
                    />
                  ))
                )}
              </main>
            )}
          </>
        )}

        {/* Bottom Instagram Navigation Bar (4 tabs) */}
        <nav
          className={`sticky bottom-0 z-40 flex h-[48px] items-center justify-around border-t ${borderCol} ${
            dark ? 'bg-black/95' : 'bg-white/95'
          } backdrop-blur-sm`}
        >
          <button
            type="button"
            onClick={() => {
              if (!viewingProfile && tab === 'feed') {
                refreshFeed();
              } else {
                setViewingProfile(null);
                setTab('feed');
              }
            }}
            className="flex flex-1 items-center justify-center py-2"
            aria-label="Feed"
          >
            <Home
              className={`h-6 w-6 ${
                !viewingProfile && tab === 'feed'
                  ? 'stroke-[2.5]'
                  : 'stroke-[1.75] opacity-65'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => {
              setViewingProfile(null);
              setTab('explore');
            }}
            className="flex flex-1 items-center justify-center py-2"
            aria-label="Explorar"
          >
            <Search
              className={`h-6 w-6 ${
                !viewingProfile && tab === 'explore'
                  ? 'stroke-[2.5]'
                  : 'stroke-[1.75] opacity-65'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => {
              setViewingProfile(null);
              setTab('saved');
            }}
            className="flex flex-1 items-center justify-center py-2"
            aria-label="Salvos"
          >
            <Bookmark
              className={`h-6 w-6 ${
                !viewingProfile && tab === 'saved'
                  ? dark
                    ? 'fill-white stroke-[2]'
                    : 'fill-[#262626] stroke-[2]'
                  : 'stroke-[1.75] opacity-65'
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => {
              setViewingProfile(null);
              setTab('me');
            }}
            className="flex flex-1 items-center justify-center py-2"
            aria-label="Minha Conta"
          >
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white transition ${
                !viewingProfile && tab === 'me'
                  ? dark
                    ? 'ring-2 ring-white ring-offset-1 ring-offset-black'
                    : 'ring-2 ring-[#262626] ring-offset-1 ring-offset-white'
                  : 'opacity-80'
              }`}
              style={{ backgroundColor: account.avatarColor || '#0095f6' }}
            >
              {accountInitials}
            </div>
          </button>
        </nav>
      </div>

      {/* Full Clinical Card Modal */}
      <FichaModal
        post={activeFichaPost}
        dark={dark}
        note={activeFichaPost ? notesMap[activeFichaPost.id] : ''}
        onSaveNote={saveNote}
        onClose={() => setActiveFichaPost(null)}
      />

      {/* Fullscreen Instagram Stories Viewer */}
      {storyViewerState && (
        <StoryViewer
          profileHandles={storyViewerState.handles}
          initialProfileIndex={storyViewerState.index}
          profilesMap={profileMap}
          storiesMap={storiesData}
          onClose={() => setStoryViewerState(null)}
          onOpenProfile={openProfile}
          onMarkViewed={markStoryViewed}
        />
      )}
    </div>
  );
}
