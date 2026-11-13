import React, { useEffect, useState, useCallback } from 'react';
import { X, Pause, Play, ChevronRight } from 'lucide-react';

export default function StoryViewer({
  profileHandles,
  initialProfileIndex,
  profilesMap,
  storiesMap,
  onClose,
  onOpenProfile,
  onMarkViewed,
}) {
  const [profileIdx, setProfileIdx] = useState(initialProfileIndex);
  const [slideIdx, setSlideIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentHandle = profileHandles[profileIdx];
  const profile = profilesMap[currentHandle];
  const slides = storiesMap[currentHandle] || [];
  const currentSlide = slides[slideIdx];

  useEffect(() => {
    if (currentHandle) {
      onMarkViewed(currentHandle);
    }
  }, [currentHandle, onMarkViewed]);

  const goNext = useCallback(() => {
    if (slideIdx < slides.length - 1) {
      setSlideIdx((s) => s + 1);
      setProgress(0);
    } else if (profileIdx < profileHandles.length - 1) {
      setProfileIdx((p) => p + 1);
      setSlideIdx(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [slideIdx, slides.length, profileIdx, profileHandles.length, onClose]);

  const goPrev = useCallback(() => {
    if (slideIdx > 0) {
      setSlideIdx((s) => s - 1);
      setProgress(0);
    } else if (profileIdx > 0) {
      const prevHandle = profileHandles[profileIdx - 1];
      const prevSlides = storiesMap[prevHandle] || [];
      setProfileIdx((p) => p - 1);
      setSlideIdx(Math.max(0, prevSlides.length - 1));
      setProgress(0);
    }
  }, [slideIdx, profileIdx, profileHandles, storiesMap]);

  useEffect(() => {
    if (paused || !currentSlide) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goNext();
          return 0;
        }
        return prev + 2; // ~5 seconds per story
      });
    }, 100);
    return () => clearInterval(interval);
  }, [paused, currentSlide, goNext]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === ' ') {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, goNext, goPrev]);

  if (!profile || !currentSlide) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
      <div className="relative flex h-full w-full max-w-[430px] sm:h-[90vh] sm:max-h-[780px] sm:rounded-2xl flex-col justify-between overflow-hidden bg-[#121212] text-white shadow-2xl">
        {/* Background photography + brand color overlay */}
        <img
          src={profile.bgImage || '/images/bg-er.jpg'}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(160deg, ${profile.avatarBg}dd 0%, #09090beb 58%, #000000f5 100%)`,
          }}
        />
        {/* Top gradient overlay */}
        <div className="relative z-20 bg-gradient-to-b from-black/75 to-transparent px-3 pt-3 pb-6">
          {/* Progress bars */}
          <div className="flex gap-1 mb-3">
            {slides.map((_, idx) => {
              const width =
                idx < slideIdx ? 100 : idx === slideIdx ? progress : 0;
              return (
                <div
                  key={idx}
                  className="h-[2.5px] flex-1 overflow-hidden rounded-full bg-white/30"
                >
                  <div
                    className="h-full bg-white transition-all duration-100 ease-linear"
                    style={{ width: `${width}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Profile bar */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenProfile(currentHandle);
              }}
              className="flex items-center gap-2.5 text-left"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white ring-1 ring-white/25"
                style={{ backgroundColor: profile.avatarBg }}
              >
                {profile.initials}
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[13px] font-semibold">
                  <span>@{profile.handle}</span>
                  <span className="text-[11px] font-normal text-white/60">
                    {slideIdx + 1}/{slides.length}
                  </span>
                </div>
                <div className="text-[11px] text-white/70">{profile.name}</div>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                className="rounded-full p-1.5 text-white/85 hover:bg-white/10"
                aria-label={paused ? 'Continuar' : 'Pausar'}
              >
                {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-white/85 hover:bg-white/10"
                aria-label="Fechar story"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tap zones left/right + hold to pause */}
        <div
          className="absolute inset-0 z-10 flex"
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          onPointerLeave={() => setPaused(false)}
          onPointerCancel={() => setPaused(false)}
        >
          <button
            type="button"
            onClick={goPrev}
            className="h-full w-[32%] cursor-pointer focus:outline-none"
            aria-label="Story anterior"
          />
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="h-full w-[36%] cursor-pointer focus:outline-none"
            aria-label="Pausar/continuar"
          />
          <button
            type="button"
            onClick={goNext}
            className="h-full w-[32%] cursor-pointer focus:outline-none"
            aria-label="Próximo story"
          />
        </div>

        {/* Story Content */}
        <div className="pointer-events-none relative z-10 my-auto px-6 py-8 space-y-5">
          <span
            className="inline-block rounded-full px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-white shadow"
            style={{ backgroundColor: profile.avatarBg }}
          >
            {currentSlide.tag}
          </span>

          <h2 className="text-[26px] font-bold leading-tight tracking-tight drop-shadow-sm">
            {currentSlide.title}
          </h2>

          <div className="rounded-2xl border border-white/20 bg-black/50 p-4 text-[15.5px] leading-relaxed text-white backdrop-blur-md">
            {currentSlide.body}
          </div>

          <div className="text-[12px] font-medium text-white/60">
            {currentSlide.footer}
          </div>
        </div>

        {/* Bottom Footer CTA */}
        <div className="relative z-20 flex items-center justify-between border-t border-white/10 bg-black/50 px-4 py-3.5">
          <span className="text-[11.5px] text-white/60">
            Toque nas laterais para avançar
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenProfile(currentHandle);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-[12px] font-semibold text-black hover:bg-white/90 transition"
          >
            <span>Abrir perfil</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
