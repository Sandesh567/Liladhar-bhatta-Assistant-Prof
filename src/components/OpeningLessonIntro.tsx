/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { CONFIG, DATA } from '../data.ts';

/**
 * ============================================================================
 * TIMING & COLOR SPECIFICATIONS
 * The Last Lesson Left on the Board (English Pedagogy Classroom)
 * ============================================================================
 */
export const LESSON_INTRO_TIMING = {
  TOTAL_DURATION: 3.6, // Base storyline duration in seconds (before ~0.4s hand-off)
  BEAT1_GHOST: { start: 0.0, end: 0.6 },     // Faint ghost notes in margins
  BEAT2_SENTENCE: { start: 0.4, end: 1.4 },  // Student sentence write-in
  BEAT3_RED_PEN: { start: 1.25, end: 2.25 }, // Teacher markup (loop, strike, caret, "goes", check)
  BEAT4_DIAGRAM: { start: 2.0, end: 2.9 },   // Sentence diagram & plain grammatical labels
  BEAT5_DUSTER: { start: 2.8, end: 3.6 },    // Felt duster sweep & name reveal
} as const;

export const LESSON_INTRO_COLORS = {
  BOARD_BG: 'var(--board-bg, #FAF8F4)',
  STUDENT_INK: 'var(--accent-blue, #1F3A5F)',
  TEACHER_RED: 'var(--accent-red, #A93226)',
  DIAGRAM_CHARCOAL: 'var(--ink-primary, #1C2128)',
  DIAGRAM_LINE: 'var(--ink-secondary, #475467)',
  GHOST_INK: 'var(--ink-muted, #8896A6)',
  ERASER_WOOD: '#2C221B',
  NAME_INK: 'var(--ink-primary, #1C2128)',
} as const;

/**
 * Synchronous helper to decide whether the intro should play before first paint.
 * Prevents any flash of unstyled or intermediate state.
 */
export function shouldPlayIntro(forcePlay = false): boolean {
  if (typeof window === 'undefined') return false;

  if (forcePlay) return true;

  // 1. Config master toggles
  if (!CONFIG.INTRO_ENABLED) return false;
  if (CONFIG.INTRO_VARIANT !== 'lesson') return false;

  // 2. Prefers-reduced-motion
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
  } catch {}

  // 3. Deep link check: URL has hash to any section other than empty or #hero
  const hash = window.location.hash.replace('#', '').trim();
  if (hash !== '' && hash !== 'hero') {
    return false;
  }

  // 4. Query param override (?skip-intro)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('skip-intro')) return false;
  } catch {}

  // 5. Session storage check (play once per session)
  if (CONFIG.INTRO_PLAY_ONCE_PER_SESSION) {
    try {
      if (sessionStorage.getItem('bhatta_intro_seen') === 'true') {
        return false;
      }
    } catch {}
  }

  return true;
}

interface OpeningLessonIntroProps {
  onComplete: () => void;
  onSkip?: () => void;
  forcePlay?: boolean;
}

export const OpeningLessonIntro: React.FC<OpeningLessonIntroProps> = ({
  onComplete,
  onSkip,
  forcePlay = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const masterTlRef = useRef<gsap.core.Timeline | null>(null);
  const hasFinishedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onSkipRef = useRef(onSkip);

  // Keep callback refs stable across parent re-renders
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onSkipRef.current = onSkip;
  });

  // Clean, single-execution finish handler
  const handleFinish = useCallback((isSkip = false) => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;

    try {
      sessionStorage.setItem('bhatta_intro_seen', 'true');
    } catch {}

    if (isSkip && onSkipRef.current) {
      onSkipRef.current();
    } else {
      onCompleteRef.current();
    }
  }, []);

  // Quick skip handler
  const handleSkip = useCallback(() => {
    if (hasFinishedRef.current) return;

    if (masterTlRef.current) {
      masterTlRef.current.kill();
      masterTlRef.current = null;
    }

    // Fast 150ms cross-fade out on skip
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.15,
        ease: 'power2.in',
        onComplete: () => handleFinish(true),
      });
    } else {
      handleFinish(true);
    }
  }, [handleFinish]);

  useEffect(() => {
    // Safety check: if reduced motion or already seen and not forced, complete immediately
    if (!forcePlay && !shouldPlayIntro(false)) {
      handleFinish(false);
      return;
    }

    // Skip listeners (Escape, Space, Enter, pointerdown, wheel)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleSkip();
      }
    };
    const handleWheel = () => handleSkip();
    const handlePointerDown = (e: PointerEvent) => {
      // Don't trigger if clicked directly on skip button (button handles itself)
      const target = e.target as HTMLElement | null;
      if (target?.closest('button[data-intro-skip="true"]')) return;
      handleSkip();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);

    let ctx: gsap.Context | null = null;
    let isCancelled = false;

    // Failsafe font-ready watcher (max 1.5s timeout)
    const setupAnimation = async () => {
      try {
        if (typeof document !== 'undefined' && 'fonts' in document) {
          await Promise.race([
            document.fonts.ready,
            new Promise((res) => setTimeout(res, 1500)),
          ]);
        }
      } catch (err) {
        console.warn('Font readiness check bypassed:', err);
      }

      if (isCancelled || hasFinishedRef.current || !containerRef.current) return;

      try {
        ctx = gsap.context(() => {
          const boardEl = containerRef.current;
          if (!boardEl) return;

          const boardWidth = boardEl.clientWidth || 800;
          const dusterEl = boardEl.querySelector('#lesson-felt-duster');

          // Main Master Timeline
          const master = gsap.timeline({
            onComplete: () => {
              performHandoff();
            },
          });
          masterTlRef.current = master;

          // Apply duration scale from config
          const durationScale = CONFIG.INTRO_DURATION_SCALE || 1.0;
          master.timeScale(1 / durationScale);

          // ------------------------------------------------------------------
          // BEAT 1: Faint Ghost Writing in Margins (0.0s – 0.6s)
          // ------------------------------------------------------------------
          master.fromTo(
            '.ghost-margin-note',
            { opacity: 0, y: -4 },
            {
              opacity: 0.35,
              y: 0,
              duration: 0.6,
              stagger: 0.08,
              ease: 'power2.out',
            },
            LESSON_INTRO_TIMING.BEAT1_GHOST.start
          );

          // ------------------------------------------------------------------
          // BEAT 2: Per-Word Sentence Write-in (0.4s – 1.4s)
          // Transform & opacity reveal with moving measured marker tip
          // ------------------------------------------------------------------
          const wordSpans = boardEl.querySelectorAll<HTMLElement>('.sentence-word');
          const markerTip = boardEl.querySelector<HTMLElement>('#marker-writing-tip');

          master.fromTo(
            wordSpans,
            { opacity: 0, x: -6 },
            {
              opacity: 1,
              x: 0,
              duration: 0.22,
              stagger: 0.09,
              ease: 'power1.out',
            },
            LESSON_INTRO_TIMING.BEAT2_SENTENCE.start
          );

          // Marker tip animation following the words
          if (markerTip && wordSpans.length > 0) {
            master.fromTo(
              markerTip,
              { opacity: 0, scale: 0 },
              { opacity: 1, scale: 1, duration: 0.1 },
              LESSON_INTRO_TIMING.BEAT2_SENTENCE.start
            );

            // Calculate x distance across the word spans
            const firstWord = wordSpans[0];
            const lastWord = wordSpans[wordSpans.length - 1];
            const sentenceContainer = boardEl.querySelector<HTMLElement>('#sentence-container');
            const totalWidth = sentenceContainer?.clientWidth || 360;

            master.fromTo(
              markerTip,
              { x: 0 },
              {
                x: totalWidth,
                duration: 0.95,
                ease: 'power1.inOut',
              },
              LESSON_INTRO_TIMING.BEAT2_SENTENCE.start
            );

            master.to(
              markerTip,
              { opacity: 0, duration: 0.12 },
              LESSON_INTRO_TIMING.BEAT2_SENTENCE.end - 0.05
            );
          }

          // ------------------------------------------------------------------
          // BEAT 3: Teacher's Red Pen Markup (1.25s – 2.25s)
          // Loop, strike, caret, "goes" above, checkmark & "Good!"
          // ------------------------------------------------------------------
          // Red loop ellipse around "go"
          master.fromTo(
            '#red-loop-path',
            { strokeDashoffset: 140 },
            {
              strokeDashoffset: 0,
              duration: 0.32,
              ease: 'power2.out',
            },
            1.25
          );

          // Strikethrough line across "go"
          master.fromTo(
            '#red-strike-path',
            { strokeDashoffset: 60 },
            {
              strokeDashoffset: 0,
              duration: 0.22,
              ease: 'power1.out',
            },
            1.52
          );

          // Insertion caret "^"
          master.fromTo(
            '#red-caret-path',
            { strokeDashoffset: 40 },
            {
              strokeDashoffset: 0,
              duration: 0.18,
              ease: 'power2.out',
            },
            1.68
          );

          // Corrected word "goes" in teacher red handwriting
          master.fromTo(
            '#red-corrected-word',
            { opacity: 0, y: 4, scale: 0.9 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.25,
              ease: 'back.out(1.4)',
            },
            1.82
          );

          // Teacher's checkmark "✓" and "Good!" note
          master.fromTo(
            '#red-check-path',
            { strokeDashoffset: 50 },
            {
              strokeDashoffset: 0,
              duration: 0.24,
              ease: 'power2.out',
            },
            2.05
          );

          master.fromTo(
            '#red-good-note',
            { opacity: 0, scale: 0.8 },
            {
              opacity: 1,
              scale: 1,
              duration: 0.2,
              ease: 'power2.out',
            },
            2.18
          );

          // ------------------------------------------------------------------
          // BEAT 4: Sentence Diagram & Plain Grammatical Labels (2.0s – 2.9s)
          // ------------------------------------------------------------------
          master.fromTo(
            '#diagram-baseline',
            { strokeDashoffset: 500 },
            {
              strokeDashoffset: 0,
              duration: 0.45,
              ease: 'power2.out',
            },
            LESSON_INTRO_TIMING.BEAT4_DIAGRAM.start
          );

          master.fromTo(
            '#diagram-divider',
            { strokeDashoffset: 60 },
            {
              strokeDashoffset: 0,
              duration: 0.25,
              ease: 'power2.out',
            },
            2.18
          );

          master.fromTo(
            '.diagram-modifier-line',
            { strokeDashoffset: 120 },
            {
              strokeDashoffset: 0,
              duration: 0.35,
              stagger: 0.1,
              ease: 'power2.out',
            },
            2.32
          );

          master.fromTo(
            '.diagram-label',
            { opacity: 0, y: 3 },
            {
              opacity: 0.85,
              y: 0,
              duration: 0.3,
              stagger: 0.08,
              ease: 'power1.out',
            },
            2.42
          );

          // ------------------------------------------------------------------
          // BEAT 5: The Duster Wipe & Name Reveal (2.8s – 3.6s)
          // Transforms only (x from -80 to boardWidth + 120)
          // ------------------------------------------------------------------
          if (dusterEl) {
            master.fromTo(
              dusterEl,
              { x: -90 },
              {
                x: boardWidth + 140,
                duration: 0.8,
                ease: 'power2.inOut',
              },
              LESSON_INTRO_TIMING.BEAT5_DUSTER.start
            );
          }

          // Lesson content fades under the sweeping duster
          master.to(
            '#lesson-content',
            {
              opacity: 0,
              duration: 0.65,
              ease: 'power2.in',
            },
            LESSON_INTRO_TIMING.BEAT5_DUSTER.start + 0.1
          );

          // Professor's name card revealed in the wiped clean wake
          master.fromTo(
            '#professor-name-card',
            { opacity: 0, y: 12 },
            {
              opacity: 1,
              y: 0,
              duration: 0.48,
              ease: 'power2.out',
            },
            3.08
          );

          // Red accent underline drawing under the professor's name
          master.fromTo(
            '#professor-name-underline',
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 0.35,
              ease: 'power2.out',
            },
            3.24
          );
        }, containerRef);
      } catch (err) {
        console.error('GSAP Intro setup error:', err);
        handleFinish(false);
      }
    };

    // Seamless handoff function: measures Hero heading and transforms into position
    const performHandoff = () => {
      const boardEl = containerRef.current;
      const heroTarget = document.querySelector<HTMLElement>('[data-hero-name="true"]');
      const nameCardTitle = boardEl?.querySelector<HTMLElement>('#professor-name-card-title');
      const nameCardSubtitles = boardEl?.querySelectorAll<HTMLElement>('.professor-name-sub');

      if (!boardEl || !heroTarget || !nameCardTitle) {
        // Fallback: 400ms clean cross-fade if target cannot be measured
        if (boardEl) {
          gsap.to(boardEl, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.inOut',
            onComplete: () => handleFinish(false),
          });
        } else {
          handleFinish(false);
        }
        return;
      }

      try {
        const sourceRect = nameCardTitle.getBoundingClientRect();
        const targetRect = heroTarget.getBoundingClientRect();

        const deltaX = targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
        const deltaY = targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2);
        const scale = targetRect.width / (sourceRect.width || 1);

        const handoffTl = gsap.timeline({
          onComplete: () => {
            handleFinish(false);
          },
        });

        // Subtitles fade out
        if (nameCardSubtitles && nameCardSubtitles.length > 0) {
          handoffTl.to(nameCardSubtitles, {
            opacity: 0,
            duration: 0.22,
            ease: 'power2.in',
          }, 0);
        }

        // Overlay background cross-fades out
        handoffTl.to(boardEl, {
          opacity: 0,
          duration: 0.38,
          ease: 'power2.inOut',
        }, 0.04);

        // Name moves seamlessly to landing spot
        handoffTl.to(nameCardTitle, {
          x: deltaX,
          y: deltaY,
          scale: Math.max(0.85, Math.min(1.25, scale)),
          duration: 0.38,
          ease: 'power2.inOut',
        }, 0);
      } catch (err) {
        console.warn('Handoff measurement fallback:', err);
        gsap.to(boardEl, {
          opacity: 0,
          duration: 0.38,
          onComplete: () => handleFinish(false),
        });
      }
    };

    setupAnimation();

    return () => {
      isCancelled = true;
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('pointerdown', handlePointerDown);
      if (ctx) ctx.revert();
    };
  }, [forcePlay, handleFinish, handleSkip]);

  const { sentenceParts, diagram, ghostNotes } = CONFIG.INTRO_CONTENT;

  return (
    <div
      ref={containerRef}
      role="presentation"
      className="absolute inset-0 z-40 flex items-center justify-center select-none overflow-hidden"
      style={{
        isolation: 'isolate',
        contain: 'paint',
        backgroundColor: 'var(--board-bg, #FAF8F4)',
        willChange: 'opacity',
      }}
    >
      {/* Decorative Layer (Strictly aria-hidden="true") */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-30 dark:opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 50%, var(--ink-primary, #1C2128) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        {/* ===================================================================
            BEAT 1: GHOST WRITING IN MARGINS (Low-contrast classroom grammar)
            =================================================================== */}
        <div className="absolute inset-0 max-w-6xl mx-auto p-4 sm:p-8 md:p-12 flex flex-col justify-between">
          {/* Top Margins */}
          <div className="flex justify-between items-start text-xs font-clean-sans text-slate-500">
            {/* Top Left: Parts of Speech reference chart */}
            <div className="ghost-margin-note max-w-[240px] space-y-1 bg-[#FAF8F4]/90 dark:bg-[#161A20]/90 p-2.5 rounded border border-slate-300/40 dark:border-slate-700/40 shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#1F3A5F] dark:text-[#9DB8E3] block">
                {ghostNotes.partsOfSpeechTitle}
              </span>
              <p className="font-annotation text-sm leading-snug text-[#1C2128] dark:text-[#E9E6DE]">
                {ghostNotes.partsOfSpeechText}
              </p>
            </div>

            {/* Top Center: Classroom alphabet snippet (hidden on small mobile) */}
            <div className="ghost-margin-note hidden md:block text-center font-annotation text-lg text-slate-400 tracking-widest">
              <span>{ghostNotes.alphabet}</span>
            </div>

            {/* Top Right: Etymology of "Pedagogy" (hidden on small mobile to avoid crowding) */}
            <div className="ghost-margin-note hidden sm:block max-w-[240px] text-right space-y-1 bg-[#FAF8F4]/90 dark:bg-[#161A20]/90 p-2.5 rounded border border-slate-300/40 dark:border-slate-700/40 shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#20563F] dark:text-[#8CC9A8] block">
                {ghostNotes.etymologyTitle}
              </span>
              <p className="font-editorial-serif text-xs text-[#1C2128] dark:text-[#E9E6DE] italic">
                {ghostNotes.etymologyPhonetic}
              </p>
              <p className="font-clean-sans text-[11px] text-[#475467] dark:text-[#9CA3AF]">
                {ghostNotes.etymologyRoot}
              </p>
            </div>
          </div>

          {/* Bottom Margins */}
          <div className="flex justify-between items-end text-xs font-clean-sans text-slate-500">
            {/* Bottom Left: Tense & Aspect Timeline */}
            <div className="ghost-margin-note max-w-[260px] space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#1F3A5F] dark:text-[#9DB8E3] block">
                {ghostNotes.tenseTitle}
              </span>
              <div className="font-annotation text-xs text-[#1C2128] dark:text-[#E9E6DE] flex items-center gap-1.5">
                <span>{ghostNotes.tenseTimeline}</span>
              </div>
              <span className="text-[10px] font-mono text-[#475467] dark:text-[#9CA3AF] block">
                {ghostNotes.tenseFormula}
              </span>
            </div>

            {/* Bottom Right: Clean IPA Phonetic Chart Symbols (hidden on small mobile) */}
            <div className="ghost-margin-note hidden sm:block max-w-[240px] text-right space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#A93226] dark:text-[#E8938A] block">
                {ghostNotes.phoneticsTitle}
              </span>
              <p className="font-editorial-serif text-xs text-[#1C2128] dark:text-[#E9E6DE] space-x-1.5">
                <span className="font-mono text-[#1F3A5F] dark:text-[#9DB8E3]">{ghostNotes.phoneticsSymbols}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================================
            BEATS 2, 3, 4: LESSON WRITING & DIAGRAM
            =================================================================== */}
        <div
          id="lesson-content"
          className="relative z-10 w-full max-w-3xl px-4 py-8 flex flex-col items-center justify-center pointer-events-none"
        >
          {/* Main Sentence Row with Teacher Red Markup */}
          <div className="relative min-h-[120px] flex items-center justify-center text-center">
            <div
              id="sentence-container"
              className="relative font-annotation text-[#1F3A5F] dark:text-[#9DB8E3] tracking-wide select-none font-semibold leading-relaxed"
              style={{ fontSize: 'clamp(1.5rem, 4.5vw, 2.75rem)' }}
            >
              {/* Word: She */}
              <span className="sentence-word inline-block mr-1.5">
                {sentenceParts.pre.trim()}
              </span>

              {/* Wrapped word 'go' and its relative teacher markup */}
              <span className="sentence-word relative inline-block mx-1.5 align-baseline">
                {/* Word 'go' with deliberate grammatical agreement error */}
                <span id="student-wrong-word" className="relative z-10">
                  {sentenceParts.wrongWord}
                </span>

                {/* SVG Overlays for Teacher's Red Pen Markup */}
                <svg
                  className="absolute -top-7 -left-3 w-20 h-16 pointer-events-none overflow-visible z-20"
                  viewBox="0 0 80 64"
                  fill="none"
                >
                  {/* 1. Red Loop/Circle around 'go' */}
                  <ellipse
                    id="red-loop-path"
                    cx="40"
                    cy="36"
                    rx="26"
                    ry="18"
                    stroke={LESSON_INTRO_COLORS.TEACHER_RED}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeDasharray="140"
                    strokeDashoffset="140"
                    transform="rotate(-4 40 36)"
                  />

                  {/* 2. Strikethrough line across 'go' */}
                  <path
                    id="red-strike-path"
                    d="M 18 36 L 62 34"
                    stroke={LESSON_INTRO_COLORS.TEACHER_RED}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray="60"
                    strokeDashoffset="60"
                  />

                  {/* 3. Insertion Caret '^' */}
                  <path
                    id="red-caret-path"
                    d="M 32 20 L 40 10 L 48 20"
                    stroke={LESSON_INTRO_COLORS.TEACHER_RED}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="40"
                    strokeDashoffset="40"
                  />
                </svg>

                {/* 4. Corrected Word "goes" in Red Handwriting directly above caret */}
                <span
                  id="red-corrected-word"
                  className="absolute -top-9 left-1/2 -translate-x-1/2 font-annotation text-xl sm:text-2xl text-[#A93226] dark:text-[#E8938A] font-bold tracking-tight z-30"
                >
                  {sentenceParts.correctedWord}
                </span>
              </span>

              {/* Remaining words */}
              <span className="sentence-word inline-block mr-1">to</span>
              <span className="sentence-word inline-block mr-1">the</span>
              <span className="sentence-word inline-block mr-1">campus</span>
              <span className="sentence-word inline-block mr-1">every</span>
              <span className="sentence-word inline-block">day.</span>

              {/* 5. Teacher's Checkmark & 'Good!' endorsement */}
              <span className="sentence-word inline-block relative ml-2.5 align-middle">
                <svg
                  className="inline-block w-7 h-7 overflow-visible"
                  viewBox="0 0 32 32"
                  fill="none"
                >
                  <path
                    id="red-check-path"
                    d="M 6 18 L 13 25 L 26 8"
                    stroke={LESSON_INTRO_COLORS.TEACHER_RED}
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="50"
                    strokeDashoffset="50"
                  />
                </svg>
                <span
                  id="red-good-note"
                  className="absolute -top-5 left-4 font-annotation text-base sm:text-lg text-[#A93226] dark:text-[#E8938A] font-bold tracking-wide rotate-6"
                >
                  {sentenceParts.endorsement}
                </span>
              </span>
            </div>

            {/* Marker Writing Tip Cursor */}
            <div
              id="marker-writing-tip"
              className="absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 rounded-full bg-[#1F3A5F] dark:bg-[#9DB8E3] pointer-events-none opacity-0"
            />
          </div>

          {/* =================================================================
              BEAT 4: SENTENCE STRUCTURE DIAGRAM
              ================================================================= */}
          <div className="w-full max-w-xl mt-4 pt-1 flex flex-col items-center">
            <svg
              className="w-full h-auto max-h-28 overflow-visible"
              viewBox="0 0 600 120"
              fill="none"
            >
              {/* Horizontal Baseline */}
              <line
                id="diagram-baseline"
                x1="60"
                y1="36"
                x2="540"
                y2="36"
                stroke={LESSON_INTRO_COLORS.DIAGRAM_LINE}
                strokeWidth="1.8"
                strokeDasharray="500"
                strokeDashoffset="500"
              />

              {/* Vertical Subject / Predicate Divider */}
              <line
                id="diagram-divider"
                x1="210"
                y1="16"
                x2="210"
                y2="56"
                stroke={LESSON_INTRO_COLORS.DIAGRAM_LINE}
                strokeWidth="2"
                strokeDasharray="60"
                strokeDashoffset="60"
              />

              {/* Modifier 1: 'to the campus' */}
              <path
                className="diagram-modifier-line"
                d="M 280 36 L 330 85"
                stroke={LESSON_INTRO_COLORS.DIAGRAM_LINE}
                strokeWidth="1.5"
                strokeDasharray="120"
                strokeDashoffset="120"
              />
              <path
                className="diagram-modifier-line"
                d="M 330 85 L 420 85"
                stroke={LESSON_INTRO_COLORS.DIAGRAM_LINE}
                strokeWidth="1.5"
                strokeDasharray="120"
                strokeDashoffset="120"
              />

              {/* Modifier 2: 'every day' */}
              <path
                className="diagram-modifier-line"
                d="M 430 36 L 470 75"
                stroke={LESSON_INTRO_COLORS.DIAGRAM_LINE}
                strokeWidth="1.5"
                strokeDasharray="120"
                strokeDashoffset="120"
              />
              <path
                className="diagram-modifier-line"
                d="M 470 75 L 530 75"
                stroke={LESSON_INTRO_COLORS.DIAGRAM_LINE}
                strokeWidth="1.5"
                strokeDasharray="120"
                strokeDashoffset="120"
              />

              {/* Labels */}
              <text
                className="diagram-label font-clean-sans text-xs font-semibold tracking-wider fill-[#1C2128] dark:fill-[#E9E6DE]"
                x="130"
                y="28"
                textAnchor="middle"
              >
                {diagram.labels.subject}
              </text>
              <text
                className="diagram-label font-annotation text-sm fill-[#475467] dark:text-[#9CA3AF]"
                x="130"
                y="52"
                textAnchor="middle"
              >
                {diagram.subject}
              </text>

              <text
                className="diagram-label font-clean-sans text-xs font-semibold tracking-wider fill-[#1C2128] dark:fill-[#E9E6DE]"
                x="250"
                y="28"
                textAnchor="middle"
              >
                {diagram.labels.verb}
              </text>
              <text
                className="diagram-label font-annotation text-sm fill-[#A93226] dark:fill-[#E8938A] font-bold"
                x="250"
                y="52"
                textAnchor="middle"
              >
                {diagram.verb}
              </text>

              <text
                className="diagram-label font-clean-sans text-[11px] font-medium tracking-wide fill-[#475467] dark:fill-[#9CA3AF] hidden sm:block"
                x="375"
                y="78"
                textAnchor="middle"
              >
                {diagram.labels.prepPhrase}
              </text>
              <text
                className="diagram-label font-annotation text-xs fill-[#475467] dark:fill-[#9CA3AF]"
                x="375"
                y="98"
                textAnchor="middle"
              >
                {diagram.prepPhrase}
              </text>

              <text
                className="diagram-label font-clean-sans text-[11px] font-medium tracking-wide fill-[#475467] dark:fill-[#9CA3AF] hidden sm:block"
                x="500"
                y="68"
                textAnchor="middle"
              >
                {diagram.labels.adverbial}
              </text>
              <text
                className="diagram-label font-annotation text-xs fill-[#475467] dark:fill-[#9CA3AF]"
                x="500"
                y="90"
                textAnchor="middle"
              >
                {diagram.adverbial}
              </text>
            </svg>
          </div>
        </div>

        {/* ===================================================================
            BEAT 5: PROFESSOR'S NAME CARD (Revealed in wiped wake)
            =================================================================== */}
        <div
          id="professor-name-card"
          className="absolute z-20 text-center space-y-2 pointer-events-none opacity-0 px-6 max-w-xl"
        >
          <div
            id="professor-name-card-title"
            className="font-editorial-serif text-3xl sm:text-4xl md:text-5xl text-[#1C2128] dark:text-[#E9E6DE] font-medium tracking-tight"
          >
            {DATA.personal.name}
          </div>
          <div
            id="professor-name-underline"
            className="w-28 sm:w-36 h-[3px] bg-[#1F3A5F] dark:bg-[#93C5FD] mx-auto origin-left rounded-full"
          />
          <p className="professor-name-sub font-serif text-base sm:text-lg text-[#334155] dark:text-[#CBD5E1] pt-1">
            {DATA.personal.currentTitle}
          </p>
          <p className="professor-name-sub font-clean-sans text-xs text-[#475467] dark:text-[#9CA3AF]">
            {DATA.personal.institution} · Jorayal-4, Doti, Nepal
          </p>
        </div>

        {/* ===================================================================
            BEAT 5: THE FELT DUSTER (Physical Whiteboard Eraser)
            Sweeps smoothly across the board using x transforms only
            =================================================================== */}
        <div
          id="lesson-felt-duster"
          className="absolute top-0 bottom-0 pointer-events-none flex items-center justify-center z-30"
          style={{ willChange: 'transform' }}
        >
          {/* Solid hardwood eraser block with felt pad */}
          <div className="w-11 sm:w-13 h-64 sm:h-80 rounded-sm shadow-xl border-y-2 border-[#1C1611] flex flex-col justify-between p-2 bg-gradient-to-r from-[#2C221B] via-[#3D2F25] to-[#251D17]">
            {/* Gold stamped label on wooden handle */}
            <div className="text-[9px] font-clean-sans text-amber-200/60 tracking-widest text-center rotate-90 uppercase select-none">
              Eraser
            </div>
            {/* Cushion on board-facing edge */}
            <div className="w-full h-1 bg-amber-800/40 rounded-full" />
          </div>

          {/* Trailing board-colored wipe panel that clears writing in its path */}
          <div
            className="absolute top-0 bottom-0 right-full bg-[#FAF8F4] dark:bg-[#161A20]"
            style={{ width: '150vw' }}
          />
        </div>
      </div>

      {/* Skip Button (OUTSIDE aria-hidden decorative layer, accessible, min 44px hit area) */}
      <button
        type="button"
        data-intro-skip="true"
        onClick={(e) => {
          e.stopPropagation();
          handleSkip();
        }}
        className="absolute bottom-5 right-5 z-50 min-h-[44px] min-w-[44px] px-4 py-2 rounded-full text-xs font-clean-sans font-medium text-[#1C2128] dark:text-[#E9E6DE] bg-[#FAF8F4] dark:bg-[#161A20] hover:bg-[#F3F1EB] dark:hover:bg-[#1E242B] border border-[#1C2128]/25 dark:border-[#E9E6DE]/25 shadow-xs focus-visible:ring-2 focus-visible:ring-[#1F3A5F] dark:focus-visible:ring-[#9DB8E3] focus-visible:outline-hidden transition-colors cursor-pointer"
        aria-label="Skip intro animation"
      >
        Skip intro (Esc)
      </button>
    </div>
  );
};
