import React, { useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Heart,
} from 'lucide-react';

function pickBackgroundImage(post, profile) {
  if (post.bgImage) return post.bgImage;
  const text = `${post.location} ${post.tag} ${post.fullCard.title} ${post.caption}`.toLowerCase();

  if (text.includes('qtc') || text.includes('ecg') || text.includes('qrs') || text.includes('cardio') || text.includes('hipertensiv')) {
    return '/images/bg-ecg.jpg';
  }
  if (text.includes('gestação') || text.includes('grávida') || text.includes('ebstein') || text.includes('lactação') || text.includes('teratog')) {
    return '/images/bg-maternal.jpg';
  }
  if (text.includes('litemia') || text.includes('hemograma') || text.includes('clozapina') || text.includes('cpk')) {
    return '/images/bg-lab.jpg';
  }
  if (text.includes('insônia') || text.includes('mirtazapina') || text.includes('zolpidem') || text.includes('sono')) {
    return '/images/bg-sleep.jpg';
  }
  if (text.includes('uti') || text.includes('neuroléptica') || text.includes('serotoninérgica') || text.includes('coma')) {
    return '/images/bg-icu.jpg';
  }
  if (text.includes('agitação') || text.includes('contenção') || text.includes('vermelha') || text.includes('pronto-socorro') || post.format === 'red_flag') {
    return '/images/bg-ambulance.jpg';
  }
  if (text.includes('emergência') || text.includes('toxicologia')) {
    return '/images/bg-er.jpg';
  }
  if (text.includes('neuro') || text.includes('dopamin') || text.includes('vias') || text.includes('gaba')) {
    return '/images/bg-neuro.jpg';
  }
  if (text.includes('consultório') || text.includes('ambulatório') || post.format === 'cena_real') {
    return '/images/bg-clinic.jpg';
  }
  return profile?.bgImage || '/images/bg-pharma.jpg';
}

export default function PostMedia({
  post,
  profile,
  dark,
  activeSlide,
  onSlideChange,
  onDoubleTapLike,
  quizAnswer,
  onSelectQuizOption,
  onResetQuizOption,
}) {
  const scrollRef = useRef(null);
  const [revealed, setRevealed] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const lastTapRef = useRef(0);

  const brandColor = profile?.avatarBg || '#0095f6';
  const bgImage = pickBackgroundImage(post, profile);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 280) {
      onDoubleTapLike();
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 850);
    }
    lastTapRef.current = now;
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    if (clientWidth > 0) {
      const idx = Math.round(scrollLeft / clientWidth);
      if (idx !== activeSlide) {
        onSlideChange(idx);
      }
    }
  };

  const scrollToSlide = (idx) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: idx * scrollRef.current.clientWidth,
      behavior: 'smooth',
    });
    onSlideChange(idx);
  };

  return (
    <div
      onClick={handleTap}
      className={`relative w-full aspect-[4/5] select-none overflow-hidden border-y ${
        dark ? 'border-[#262626]' : 'border-[#efefef]'
      }`}
    >
      {/* Double-tap heart pop */}
      {showHeartAnim && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
          <Heart className="h-24 w-24 fill-white text-white drop-shadow-lg animate-ig-heart" />
        </div>
      )}

      {/* 1. CARROSSEL */}
      {post.format === 'carrossel' && (
        <div className="relative h-full w-full">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex h-full w-full snap-x snap-mandatory overflow-x-auto no-scrollbar"
          >
            {post.content.slides.map((slide, idx) => (
              <div
                key={idx}
                className="relative flex h-full w-full shrink-0 snap-center flex-col justify-between overflow-hidden"
              >
                {/* Background image + balanced editorial scrim */}
                <img
                  src={bgImage}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover brightness-105 contrast-105"
                />
                {slide.type === 'cover' || idx === 0 ? (
                  <>
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.18) 38%, rgba(0,0,0,0.78) 68%, rgba(0,0,0,0.94) 100%)',
                      }}
                    />
                    <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
                      <div className="flex items-center justify-between">
                        <span
                          className="rounded-full px-3 py-1 text-[10.5px] font-bold tracking-wider uppercase text-white shadow-md"
                          style={{ backgroundColor: brandColor }}
                        >
                          {slide.kicker}
                        </span>
                        <span className="rounded-full bg-black/55 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-md">
                          @{post.profile}
                        </span>
                      </div>

                      <div className="mt-auto mb-3">
                        <h2 className="text-[25px] leading-[1.16] font-extrabold tracking-tight drop-shadow-md">
                          {slide.title}
                        </h2>
                        <p className="mt-2.5 text-[14px] leading-relaxed text-white/95 drop-shadow">
                          {slide.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/25 pt-3">
                        <span className="text-[12.5px] font-semibold text-white/95">
                          Arraste para o lado →
                        </span>
                        <span className="rounded bg-black/45 px-2 py-0.5 text-[11px] font-bold backdrop-blur-sm">
                          {post.id}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(9,9,11,0.48) 0%, rgba(15,23,42,0.68) 50%, rgba(9,9,11,0.86) 100%)',
                      }}
                    />
                    <div className="relative z-10 flex h-full flex-col justify-between p-5 text-white">
                      <div className="flex items-center justify-between">
                        <span
                          className="rounded-md px-2.5 py-1 text-[10.5px] font-bold tracking-wider uppercase text-white"
                          style={{ backgroundColor: brandColor }}
                        >
                          {slide.step}
                        </span>
                        <span className="text-[11px] font-semibold text-white/75">{post.id}</span>
                      </div>

                      <div className="my-auto space-y-3.5 rounded-2xl border border-white/15 bg-black/45 p-4 backdrop-blur-md">
                        <h3 className="text-[19px] font-bold leading-snug text-white">
                          {slide.title}
                        </h3>
                        <p className="text-[13.5px] leading-relaxed text-white/90">
                          {slide.text}
                        </p>
                        <div
                          className="rounded-xl border-l-4 bg-white/12 p-3.5 text-[13px] leading-relaxed font-medium text-white"
                          style={{ borderColor: brandColor }}
                        >
                          {slide.highlight}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-white/70">
                        <span>@{post.profile}</span>
                        <span>
                          Slide {idx + 1} de {post.content.slides.length}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Top-right Instagram slide counter pill */}
          <div className="pointer-events-none absolute top-3 right-3 z-20 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white">
            {activeSlide + 1}/{post.content.slides.length}
          </div>

          {activeSlide > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                scrollToSlide(activeSlide - 1);
              }}
              className="absolute top-1/2 left-2 z-20 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white hover:bg-black/80 transition"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {activeSlide < post.content.slides.length - 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                scrollToSlide(activeSlide + 1);
              }}
              className="absolute top-1/2 right-2 z-20 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white hover:bg-black/80 transition"
              aria-label="Próximo slide"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* 2. COMPARATIVO VS */}
      {post.format === 'comparativo' && (
        <div className="relative flex h-full w-full flex-col justify-between p-4 text-white">
          <img
            src={bgImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(160deg, rgba(15,23,42,0.45) 0%, rgba(15,23,42,0.68) 55%, rgba(9,9,11,0.85) 100%)',
            }}
          />

          <div className="relative z-10 text-center pt-1">
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase text-white"
              style={{ backgroundColor: brandColor }}
            >
              COMPARATIVO CLÍNICO
            </span>
            <h3 className="mt-1.5 text-[17px] font-extrabold leading-snug drop-shadow-sm">
              {post.content.title}
            </h3>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-2.5 my-2 flex-1">
            {[post.content.left, post.content.right].map((col, i) => {
              const headerBg =
                col.color === 'red'
                  ? 'bg-rose-600'
                  : col.color === 'green'
                  ? 'bg-emerald-600'
                  : col.color === 'blue'
                  ? 'bg-blue-600'
                  : 'bg-slate-700';

              return (
                <div
                  key={i}
                  className="flex flex-col overflow-hidden rounded-xl border border-white/15 bg-black/55 backdrop-blur-md"
                >
                  <div className={`${headerBg} px-3 py-2`}>
                    <span className="inline-block rounded bg-black/25 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                      {col.status}
                    </span>
                    <div className="mt-1 text-[13.5px] font-bold leading-tight text-white">
                      {col.name}
                    </div>
                  </div>
                  <ul className="space-y-2 p-3 text-[11.5px] leading-snug text-white/95">
                    {col.points.map((pt, j) => (
                      <li key={j} className="flex items-start gap-1.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/70" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="relative z-10 rounded-xl border border-white/15 bg-black/60 p-2.5 text-[11.5px] leading-snug font-medium text-white backdrop-blur-md">
            {post.content.footer}
          </div>
        </div>
      )}

      {/* 3. RED FLAG */}
      {post.format === 'red_flag' && (
        <div className="relative flex h-full w-full flex-col justify-between p-5 text-white">
          <img
            src={bgImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(153, 27, 27, 0.42) 0%, rgba(9, 9, 11, 0.58) 45%, rgba(9, 9, 11, 0.88) 100%)',
            }}
          />

          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-[10.5px] font-extrabold tracking-wider uppercase text-white shadow">
              <AlertTriangle className="h-3.5 w-3.5" />
              {post.content.badge}
            </span>
            <span className="rounded bg-white/15 px-2 py-0.5 text-[11px] font-bold">
              {post.id}
            </span>
          </div>

          <div className="relative z-10 my-auto space-y-3">
            <h3 className="text-[20px] font-extrabold leading-tight drop-shadow-sm">
              {post.content.headline}
            </h3>

            <div className="rounded-xl border border-red-400/35 bg-black/55 p-3.5 backdrop-blur-md">
              <div className="text-[11px] font-bold uppercase tracking-wide text-red-400">
                {post.content.trapLabel}
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-white/95">
                {post.content.trapText}
              </p>
            </div>

            {revealed ? (
              <div className="rounded-xl border border-emerald-400/45 bg-emerald-950/80 p-3.5 text-emerald-50 backdrop-blur-md">
                <div className="text-[11px] font-bold uppercase tracking-wide text-emerald-300">
                  {post.content.revealLabel}
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed">{post.content.revealText}</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setRevealed(true);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-[13px] font-bold text-[#18181b] shadow-lg hover:bg-white/95 transition"
              >
                <Eye className="h-4 w-4 text-red-600" />
                Toque para revelar a conduta correta
              </button>
            )}
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-1.5 border-t border-white/15 pt-2.5">
            {post.content.hardNumbers.slice(0, 2).map((num, i) => (
              <span
                key={i}
                className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10.5px] font-semibold text-white"
              >
                {num}
              </span>
            ))}
            {revealed && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setRevealed(false);
                }}
                className="ml-auto flex items-center gap-1 text-[11px] text-white/75 hover:text-white"
              >
                <EyeOff className="h-3 w-3" /> Ocultar
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. QUIZ INTERATIVO */}
      {post.format === 'quiz' && (
        <div className="relative flex h-full w-full flex-col justify-between p-4">
          <img
            src={bgImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(155deg, ${brandColor}e0 0%, #111827eb 55%, #09090bf5 100%)`,
            }}
          />

          <div className="relative z-10 flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-white text-[#262626] shadow-xl">
            {/* Quiz Sticker Header */}
            <div
              className="px-4 py-2.5 text-white flex items-center justify-between"
              style={{ backgroundColor: brandColor }}
            >
              <span className="text-[11px] font-extrabold tracking-widest uppercase">
                QUIZ DE PROVA · @{post.profile}
              </span>
              <span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] font-bold">
                {post.id}
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-between p-3.5 overflow-y-auto">
              <p className="text-[13px] font-bold leading-snug text-[#18181b]">
                {post.content.question}
              </p>

              <div className="my-2 space-y-1.5">
                {post.content.options.map((opt) => {
                  const isSelected = quizAnswer === opt.id;
                  const hasAnswered = Boolean(quizAnswer);

                  let optStyle = 'border-[#e5e7eb] bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#18181b]';
                  let letterBg = 'bg-[#e2e8f0] text-[#1e293b]';

                  if (hasAnswered) {
                    if (opt.correct) {
                      optStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-medium';
                      letterBg = 'bg-emerald-600 text-white';
                    } else if (isSelected && !opt.correct) {
                      optStyle = 'border-red-500 bg-red-50 text-red-950';
                      letterBg = 'bg-red-600 text-white';
                    } else {
                      optStyle = 'border-[#e5e7eb] bg-white opacity-55 text-[#52525b]';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectQuizOption(post.id, opt.id);
                      }}
                      className={`flex w-full items-center justify-between gap-2 rounded-xl border px-2.5 py-2 text-left text-[11.5px] leading-snug transition ${optStyle}`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold ${letterBg}`}
                        >
                          {opt.id}
                        </span>
                        <span>{opt.text}</span>
                      </div>
                      {hasAnswered && opt.correct && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      )}
                      {hasAnswered && isSelected && !opt.correct && (
                        <XCircle className="h-4 w-4 shrink-0 text-red-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {quizAnswer ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-[11px] leading-snug text-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold" style={{ color: brandColor }}>
                      Gabarito
                    </span>
                    {onResetQuizOption && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onResetQuizOption(post.id);
                        }}
                        className="text-[10.5px] font-semibold text-[#0095f6] hover:underline"
                      >
                        Refazer quiz
                      </button>
                    )}
                  </div>
                  {post.content.explanation}
                </div>
              ) : (
                <div className="text-center text-[11px] font-medium text-slate-400">
                  Toque em uma alternativa para corrigir na hora
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. CENA REAL */}
      {post.format === 'cena_real' && (
        <div className="relative flex h-full w-full flex-col justify-between p-4 text-white">
          <img
            src={bgImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(170deg, ${brandColor}cc 0%, #09090be6 45%, #000000f5 100%)`,
            }}
          />

          <div className="relative z-10 flex items-center justify-between border-b border-white/15 pb-2">
            <div>
              <span
                className="inline-block rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase text-white"
                style={{ backgroundColor: brandColor }}
              >
                CENA REAL DE PLANTÃO / CONSULTÓRIO
              </span>
              <div className="mt-1 text-[11px] text-white/85">{post.content.context}</div>
            </div>
            <span className="rounded bg-white/15 px-2 py-0.5 text-[11px] font-bold">
              {post.id}
            </span>
          </div>

          <div className="relative z-10 my-auto space-y-2.5 py-2">
            {post.content.dialogue.map((line, idx) => {
              const isDoctor = line.speaker.toLowerCase().includes('médic');
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isDoctor ? 'items-end' : 'items-start'}`}
                >
                  <span className="mb-0.5 px-1 text-[10px] font-semibold text-white/75">
                    {line.speaker}
                  </span>
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2 text-[12.5px] leading-snug shadow ${
                      isDoctor
                        ? 'rounded-br-sm text-white'
                        : 'rounded-bl-sm bg-white text-[#18181b]'
                    }`}
                    style={isDoctor ? { backgroundColor: brandColor } : undefined}
                  >
                    {line.text}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="relative z-10 rounded-xl border-l-4 bg-black/60 p-2.5 text-[11.5px] font-medium leading-snug text-white backdrop-blur-md"
            style={{ borderColor: brandColor }}
          >
            {post.content.takeaway}
          </div>
        </div>
      )}
    </div>
  );
}
