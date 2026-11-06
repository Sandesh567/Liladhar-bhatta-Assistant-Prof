/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * THE PHYSICAL WHITEBOARD MOUNTED ON A QUIET WALL (AWWWARDS / FWA CALIBER REFINEMENT)
 * Academic Portfolio of Lila Dhar Bhatta
 * Assistant Professor of English Education | Ghanteshwar Multiple Campus, Nepal
 */

import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import gsap from 'gsap';
import { 
  Moon, 
  Sun, 
  RotateCcw, 
  Download, 
  Eraser, 
  Send, 
  HelpCircle, 
  X, 
  Award, 
  BookOpen, 
  GraduationCap, 
  MapPin, 
  Mail, 
  Phone, 
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Printer,
  Eye,
  FileText,
  ArrowDown,
  Upload,
  Camera,
  Menu
} from 'lucide-react';
import { CvDocument } from './components/CvDocument.tsx';
import { OpeningLessonIntro, shouldPlayIntro } from './components/OpeningLessonIntro.tsx';
import './cv.css';

/* ==========================================================================
   SOURCE OF TRUTH: Imported from src/data.ts
   ========================================================================== */
import { CONFIG, DATA, BOARDS } from './data.ts';
export { CONFIG, DATA, BOARDS };

/* ==========================================================================
   MASTER COMPONENT: The Physical Whiteboard Mounted on a Wall
   ========================================================================== */
export default function App() {
  // Synchronous intro gating (decided before first paint; no flash)
  const [isIntroActive, setIsIntroActive] = useState(() => shouldPlayIntro());
  const [forcePlayIntro, setForcePlayIntro] = useState(false);

  const [activeBoardIndex, setActiveBoardIndex] = useState(0);
  const [targetBoardIndex, setTargetBoardIndex] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeMarginQuestion, setActiveMarginQuestion] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Intent threshold state (Push-past-the-end)
  const [intentProgress, setIntentProgress] = useState(0); // 0 to 1
  const [intentDirection, setIntentDirection] = useState<'forward' | 'backward' | null>(null);
  const accumulatedDeltaRef = useRef(0);
  const intentTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Wipe transition state
  const [isWiping, setIsWiping] = useState(false);
  const [wipeDirection, setWipeDirection] = useState<'forward' | 'backward'>('forward');
  const [wipeProgress, setWipeProgress] = useState(0); // 0 to 100%
  const isCooldownRef = useRef(false);

  // Interactive Lesson Intro completion handler
  const handleIntroComplete = useCallback(() => {
    setIsIntroActive(false);
    setForcePlayIntro(false);
    setTimeout(() => {
      boardHeadingRefs.current[0]?.focus();
    }, 80);
  }, []);

  // Downloadable CV Metadata & Polite Feedback State
  const [cvMeta, setCvMeta] = useState({
    fileName: 'Lila-Dhar-Bhatta-CV.pdf',
    pageCount: 2,
    sizeKb: 68,
    buildDate: 'October 2026'
  });
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false); /* MOBILE FIX: Mobile directory navigation dropdown state */
  const downloadTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Profile Photo state (defaults to newly uploaded portrait, customizable via browser upload)
  const DEFAULT_PROFILE_IMAGE = '/assets/aistudio/profile_ce77fc9e.jpg';
  const [profileImage, setProfileImage] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('bhatta_user_profile_photo');
      if (saved) return saved;
    } catch {}
    return DEFAULT_PROFILE_IMAGE;
  });
  const [isPhotoDragOver, setIsPhotoDragOver] = useState(false);
  const photoFileInputRef = useRef<HTMLInputElement | null>(null);

  const handleProfilePhotoUpload = useCallback((file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setDownloadNotice('Please upload a valid image file');
      setTimeout(() => setDownloadNotice(null), 3000);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setProfileImage(result);
        try {
          localStorage.setItem('bhatta_user_profile_photo', result);
        } catch {}
        setDownloadNotice('Profile photo updated successfully');
        setTimeout(() => setDownloadNotice(null), 3000);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleProfileFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProfilePhotoUpload(file);
    }
    e.target.value = '';
  };

  const handleResetProfilePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProfileImage(DEFAULT_PROFILE_IMAGE);
    try {
      localStorage.removeItem('bhatta_user_profile_photo');
    } catch {}
    setDownloadNotice('Restored original faculty photograph');
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  useEffect(() => {
    fetch('/cv-meta.json')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.sizeKb) {
          setCvMeta({
            fileName: data.fileName || 'Lila-Dhar-Bhatta-CV.pdf',
            pageCount: data.pageCount || 2,
            sizeKb: data.sizeKb || 68,
            buildDate: data.buildDate || 'October 2026'
          });
        }
      })
      .catch(() => {});
  }, []);

  // Closes CV modal, photo modal, or mobile navigation on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCvModalOpen) setIsCvModalOpen(false);
        if (isPhotoModalOpen) setIsPhotoModalOpen(false);
        if (isMobileNavOpen) setIsMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCvModalOpen, isPhotoModalOpen, isMobileNavOpen]);

  const handleCvDownload = useCallback(async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setDownloadNotice('Starting CV download...');
    try {
      const res = await fetch('/Lila-Dhar-Bhatta-CV.pdf');
      if (!res.ok) throw new Error('Failed to fetch CV file');
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'Lila-Dhar-Bhatta-CV.pdf';
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }, 5000);
      setDownloadNotice('CV download initiated');
    } catch (err) {
      console.warn('Direct file download fallback triggered', err);
      // Fallback: If sandbox restrictions block programmatic file downloads, open the interactive CV modal
      setIsCvModalOpen(true);
      setDownloadNotice('Opening document viewer');
    }
    if (downloadTimerRef.current) clearTimeout(downloadTimerRef.current);
    downloadTimerRef.current = setTimeout(() => {
      setDownloadNotice(null);
    }, 3500);
  }, []);

  const handlePrintCv = useCallback(() => {
    window.print();
  }, []);

  // Workshops filter & search
  const [workshopSearch, setWorkshopSearch] = useState('');
  const [selectedWorkshopType, setSelectedWorkshopType] = useState('All');
  const [isWorkshopsExpanded, setIsWorkshopsExpanded] = useState(false);

  // Whiteboard Canvas State (Contact Board)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [markerColor, setMarkerColor] = useState('#1F3A5F');
  const [canvasHistory, setCanvasHistory] = useState<ImageData[]>([]);
  const [customVisitorNote, setCustomVisitorNote] = useState('');

  // Refs for board scroll containers and focus management
  const boardContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const boardHeadingRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const marginTriggerRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const trayNavRef = useRef<HTMLElement | null>(null);
  const navButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Keep active tray nav item centered/visible during horizontal scroll on narrow viewports
  useEffect(() => {
    const activeBtn = navButtonRefs.current[activeBoardIndex];
    if (activeBtn && trayNavRef.current) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeBoardIndex]);

  const searchInputId = useId();
  const visitorNoteId = useId();

  /* --------------------------------------------------------------------------
     1. Theme & Reduced Motion Setup
     -------------------------------------------------------------------------- */
  useEffect(() => {
    document.title = 'Asst. Professor LilaDhar Bhatta';
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  /* --------------------------------------------------------------------------
     2. Opening Classroom Sequence Controls
     -------------------------------------------------------------------------- */

  const replayIntro = () => {
    try {
      sessionStorage.removeItem('bhatta_intro_seen');
      sessionStorage.removeItem('seen_whiteboard_intro');
    } catch {}
    setForcePlayIntro(true);
    setIsIntroActive(true);
    setActiveBoardIndex(0);
    window.location.hash = 'hero';
  };

  /* --------------------------------------------------------------------------
     3. Duster Wipe Transition Engine
     -------------------------------------------------------------------------- */
  const triggerWipeToBoard = useCallback((nextIndex: number, direction: 'forward' | 'backward') => {
    if (isWiping || isCooldownRef.current || nextIndex === activeBoardIndex) return;
    if (nextIndex < 0 || nextIndex >= BOARDS.length) return;

    setIsMobileNavOpen(false); /* MOBILE FIX: Ensure mobile directory closes on page transition */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setActiveBoardIndex(nextIndex);
      window.location.hash = BOARDS[nextIndex].id;
      document.title = 'Asst. Professor LilaDhar Bhatta';
      setTimeout(() => {
        boardHeadingRefs.current[nextIndex]?.focus();
      }, 50);
      return;
    }

    setIsWiping(true);
    setWipeDirection(direction);
    setTargetBoardIndex(nextIndex);
    isCooldownRef.current = true;

    // Reset intent cues
    setIntentProgress(0);
    setIntentDirection(null);
    accumulatedDeltaRef.current = 0;

    const wipeObj = { p: 0 };
    gsap.to(wipeObj, {
      p: 100,
      duration: CONFIG.WIPE_DURATION_MS / 1000,
      ease: 'power2.inOut',
      onUpdate: () => {
        setWipeProgress(wipeObj.p);
      },
      onComplete: () => {
        setActiveBoardIndex(nextIndex);
        setTargetBoardIndex(null);
        setIsWiping(false);
        setWipeProgress(0);
        window.location.hash = BOARDS[nextIndex].id;
        document.title = 'Asst. Professor LilaDhar Bhatta';

        setTimeout(() => {
          boardHeadingRefs.current[nextIndex]?.focus();
        }, 60);

        if (boardContainerRefs.current[nextIndex]) {
          boardContainerRefs.current[nextIndex]!.scrollTop = 0;
        }

        setTimeout(() => {
          isCooldownRef.current = false;
        }, CONFIG.WIPE_COOLDOWN_MS);
      }
    });
  }, [activeBoardIndex, isWiping]);

  /* --------------------------------------------------------------------------
     4. THE NON-NEGOTIABLE INPUT RULE (Intent Threshold & Native Scroll Preservation)
     -------------------------------------------------------------------------- */
  useEffect(() => {
    const container = boardContainerRefs.current[activeBoardIndex];
    if (!container) return;

    let touchStartY = 0;

    const resetIntent = () => {
      accumulatedDeltaRef.current = 0;
      setIntentProgress(0);
      setIntentDirection(null);
    };

    const handleWheel = (e: WheelEvent) => {
      if (isWiping || isCooldownRef.current || isDrawing || activeMarginQuestion || isIntroActive) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 4;
      const isAtTop = scrollTop <= 4;

      if (e.deltaY > 0 && isAtBottom && activeBoardIndex < BOARDS.length - 1) {
        accumulatedDeltaRef.current += e.deltaY;
        setIntentDirection('forward');
        const progress = Math.min(1, Math.max(0, accumulatedDeltaRef.current / CONFIG.WIPE_THRESHOLD_PX));
        setIntentProgress(progress);

        if (accumulatedDeltaRef.current >= CONFIG.WIPE_THRESHOLD_PX) {
          triggerWipeToBoard(activeBoardIndex + 1, 'forward');
          resetIntent();
        }
      } else if (e.deltaY < 0 && isAtTop && activeBoardIndex > 0) {
        accumulatedDeltaRef.current += Math.abs(e.deltaY);
        setIntentDirection('backward');
        const progress = Math.min(1, Math.max(0, accumulatedDeltaRef.current / CONFIG.WIPE_THRESHOLD_PX));
        setIntentProgress(progress);

        if (accumulatedDeltaRef.current >= CONFIG.WIPE_THRESHOLD_PX) {
          triggerWipeToBoard(activeBoardIndex - 1, 'backward');
          resetIntent();
        }
      } else {
        resetIntent();
      }

      if (intentTimeoutRef.current) clearTimeout(intentTimeoutRef.current);
      intentTimeoutRef.current = setTimeout(resetIntent, 450);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isWiping || isCooldownRef.current || isDrawing || activeMarginQuestion || isIntroActive) return;
      const currentY = e.touches[0].clientY;
      const diffY = touchStartY - currentY;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 4;
      const isAtTop = scrollTop <= 4;

      if (diffY > 0 && isAtBottom && activeBoardIndex < BOARDS.length - 1) {
        const progress = Math.min(1, diffY / CONFIG.WIPE_THRESHOLD_PX);
        setIntentDirection('forward');
        setIntentProgress(progress);
        if (diffY >= CONFIG.WIPE_THRESHOLD_PX) {
          triggerWipeToBoard(activeBoardIndex + 1, 'forward');
          resetIntent();
        }
      } else if (diffY < 0 && isAtTop && activeBoardIndex > 0) {
        const progress = Math.min(1, Math.abs(diffY) / CONFIG.WIPE_THRESHOLD_PX);
        setIntentDirection('backward');
        setIntentProgress(progress);
        if (Math.abs(diffY) >= CONFIG.WIPE_THRESHOLD_PX) {
          triggerWipeToBoard(activeBoardIndex - 1, 'backward');
          resetIntent();
        }
      } else {
        resetIntent();
      }
    };

    const handleTouchEnd = () => {
      resetIntent();
    };

    container.addEventListener('wheel', handleWheel, { passive: true });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeBoardIndex, isWiping, isDrawing, activeMarginQuestion, isIntroActive, triggerWipeToBoard]);

  /* --------------------------------------------------------------------------
     5. Keyboard Navigation & Hash Sync
     -------------------------------------------------------------------------- */
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const foundIndex = BOARDS.findIndex(b => b.id === hash);
    if (foundIndex !== -1) {
      setActiveBoardIndex(foundIndex);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isIntroActive) return;
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === 'Escape') {
        if (activeMarginQuestion) {
          const trigger = marginTriggerRefs.current[activeMarginQuestion];
          setActiveMarginQuestion(null);
          trigger?.focus();
        }
        if (selectedThreadId) setSelectedThreadId(null);
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (activeBoardIndex < BOARDS.length - 1) {
          triggerWipeToBoard(activeBoardIndex + 1, 'forward');
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (activeBoardIndex > 0) {
          triggerWipeToBoard(activeBoardIndex - 1, 'backward');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeBoardIndex, activeMarginQuestion, selectedThreadId, isIntroActive, triggerWipeToBoard]);

  /* --------------------------------------------------------------------------
     6. Interactive Canvas (Take The Marker)
     -------------------------------------------------------------------------- */
  useEffect(() => {
    if (activeBoardIndex !== 7) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setCanvasHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  }, [activeBoardIndex]);

  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    lastPosRef.current = { x, y };
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPosRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(currentX, currentY);

    if (markerColor === 'eraser') {
      ctx.strokeStyle = isDarkMode ? '#171B20' : '#F3F1EB';
      ctx.lineWidth = 26;
    } else {
      ctx.strokeStyle = markerColor;
      ctx.lineWidth = 3;
    }

    ctx.stroke();
    lastPosRef.current = { x: currentX, y: currentY };
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPosRef.current = null;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setCanvasHistory(prev => [...prev.slice(-9), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const undoCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || canvasHistory.length <= 1) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const newHistory = [...canvasHistory];
    newHistory.pop();
    const previousState = newHistory[newHistory.length - 1];
    ctx.putImageData(previousState, 0, 0);
    setCanvasHistory(newHistory);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setCanvasHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `whiteboard-note-lila-dhar-bhatta.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  /* --------------------------------------------------------------------------
     7. Filtered Workshops
     -------------------------------------------------------------------------- */
  const workshopTypes = ['All', 'Research & Publishing', 'Faculty Enhancement', 'Curriculum Dissemination', 'Pedagogical Training'];
  const filteredWorkshops = DATA.workshopsAndTraining.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(workshopSearch.toLowerCase()) ||
                          item.organizer.toLowerCase().includes(workshopSearch.toLowerCase()) ||
                          item.location.toLowerCase().includes(workshopSearch.toLowerCase());
    const matchesType = selectedWorkshopType === 'All' || item.type === selectedWorkshopType;
    return matchesSearch && matchesType;
  });
  const displayedWorkshops = isWorkshopsExpanded ? filteredWorkshops : filteredWorkshops.slice(0, 3);

  return (
    <div className="h-screen h-[100dvh] w-screen overflow-hidden wall-surface text-[#1C2128] dark:text-[#E9E6DE] flex items-center justify-center relative select-none">
      
      {/* Visually hidden skip link for accessibility */}
      <a 
        href={`#board-page-${BOARDS[activeBoardIndex].id}`}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 z-50 bg-[#1F3A5F] text-white px-4 py-2 rounded shadow-lg text-sm font-medium"
      >
        Skip to whiteboard content
      </a>

      {/* Polite Accessibility Announcer */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Viewing Board: ${BOARDS[activeBoardIndex].title}`}
      </div>

      {/* =======================================================================
          THE WHITEBOARD: Mounted Rectangular Stage on Wall
          Multi-layer brushed aluminum frame extrusion with mitred corners
          ======================================================================= */}
      {/* =======================================================================
          THE WHITEBOARD: Mounted Rectangular Stage on Wall
          Slim, matte, dark-anodized aluminum extrusion with hairline mitre seams
          ======================================================================= */}
      <div className="whiteboard-mount flex flex-col overflow-hidden relative">

        {/* =====================================================================
            MASTER TOP ARCHITECTURAL HEADER (Reference layout)
            - Left: LILA DHAR BHATTA · Assistant Professor of English Education
            - Right: 01 02 03 04 05 06 07 08 | Download CV [file-icon]
            ===================================================================== */}
        {/* MOBILE FIX: Responsive header layout preventing top bar collision below 768px */}
        <header 
          className={`h-12 border-b border-slate-200/90 dark:border-slate-800 px-3 sm:px-6 md:px-8 flex items-center justify-between select-none shrink-0 z-30 bg-[#FAF8F4]/80 dark:bg-[#161A20]/80 backdrop-blur-xs transition-opacity duration-350 ${
            isIntroActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          aria-hidden={isIntroActive ? true : undefined}
          inert={isIntroActive ? true : undefined}
        >
          {/* MOBILE VIEW (< 768px): Compact brand on left, 01/08 in middle, CV icon + Menu on right */}
          <div className="flex md:hidden items-center justify-between w-full min-w-0 gap-2">
            {/* Left: Compact Brand with min-width:0 to prevent overflow */}
            <div className="flex items-center min-w-0">
              <span className="font-serif font-bold text-xs sm:text-sm tracking-wider uppercase text-slate-900 dark:text-slate-100 truncate">
                L. Bhatta
              </span>
            </div>

            {/* Middle: Compact Current Page Indicator */}
            <div className="flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-semibold text-[#1F3A5F] dark:text-[#93C5FD] shrink-0">
              {String(activeBoardIndex + 1).padStart(2, '0')} / {String(BOARDS.length).padStart(2, '0')}
            </div>

            {/* Right: Quick CV action + Section Directory Menu button (44px min tap targets) */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => handleCvDownload(e)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
                title="Download Curriculum Vitae (PDF)"
                aria-label="Download CV"
              >
                <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setIsMobileNavOpen(prev => !prev)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
                title={isMobileNavOpen ? "Close directory" : "Open lecture directory"}
                aria-expanded={isMobileNavOpen}
                aria-label="Toggle lecture directory menu"
              >
                {isMobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* DESKTOP VIEW (>= 768px): Preserved 100% untouched */}
          <div className="hidden md:flex items-center justify-between w-full">
            {/* Left: Brand name & title */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-serif font-bold text-sm tracking-wider uppercase text-slate-900 dark:text-slate-100 whitespace-nowrap">
                LILA DHAR BHATTA
              </span>
              <span className="text-slate-400 dark:text-slate-600">·</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-sans truncate">
                Assistant Professor of English Education
              </span>
            </div>

            {/* Right: Board numbered tabs, divider, and CV actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="Whiteboard sections">
                {BOARDS.map((b, idx) => {
                  const isActive = activeBoardIndex === idx;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => triggerWipeToBoard(idx, idx > activeBoardIndex ? 'forward' : 'backward')}
                      disabled={isWiping}
                      className={`text-xs font-mono font-medium px-1.5 sm:px-2 py-0.5 rounded transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-[#E2E8F0] dark:bg-slate-700 text-[#1E3A8A] dark:text-[#93C5FD] font-semibold shadow-2xs' 
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                      title={`Go to Lecture ${idx + 1}: ${b.title}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </button>
                  );
                })}
              </nav>

              <span className="text-slate-300 dark:text-slate-700 mx-0.5 sm:mx-1 select-none">|</span>

              {/* Download CV link */}
              <button
                type="button"
                onClick={(e) => handleCvDownload(e)}
                className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white px-1 sm:px-1.5 py-0.5 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Download Curriculum Vitae (PDF)"
              >
                <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>Download CV</span>
              </button>

              {/* Document viewer icon */}
              <button
                type="button"
                onClick={() => setIsCvModalOpen(true)}
                className="p-1 rounded text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                title="Preview Curriculum Vitae document"
                aria-label="Preview CV document"
              >
                <FileText className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* MOBILE SECTION NAVIGATION DROPDOWN (< 768px): Accessible 44px+ tap targets */}
        {isMobileNavOpen && (
          <div 
            className="md:hidden absolute top-12 inset-x-0 z-40 bg-[#FAF8F4]/98 dark:bg-[#161A20]/98 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xl p-3 max-h-[calc(100dvh-110px)] overflow-y-auto animate-in fade-in duration-150"
            role="dialog"
            aria-label="Lecture sections navigation"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80 dark:border-slate-800/80 text-[10px] font-mono tracking-wider uppercase text-slate-500 dark:text-slate-400">
              <span>Lecture Directory</span>
              <span>8 Sections</span>
            </div>

            <div className="space-y-1">
              {BOARDS.map((b, idx) => {
                const isActive = activeBoardIndex === idx;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      triggerWipeToBoard(idx, idx > activeBoardIndex ? 'forward' : 'backward');
                      setIsMobileNavOpen(false);
                    }}
                    className={`w-full min-h-[44px] px-3 py-2.5 rounded-md flex items-center justify-between text-left transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-[#1F3A5F] text-white dark:bg-[#93C5FD] dark:text-[#0F172A] font-semibold' 
                        : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`font-mono text-xs ${isActive ? 'text-white/80 dark:text-[#0F172A]/80' : 'text-slate-400'}`}>
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="font-serif text-sm truncate">{b.title}</span>
                    </div>
                    {isActive && <span className="text-xs font-mono shrink-0">Active</span>}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={(e) => {
                  setIsMobileNavOpen(false);
                  handleCvDownload(e);
                }}
                className="flex-1 min-h-[44px] px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-sans font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CV (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileNavOpen(false);
                  setIsCvModalOpen(true);
                }}
                className="min-h-[44px] px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-sans font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                title="Preview CV document"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            BOARD WRITING AREA: Satin Enamel Surface with Strict Containment
            ===================================================================== */}
        <div className="satin-enamel-surface flex-1 relative w-full overflow-hidden">
          
          {/* Subtle classroom background watermark text: Hidden on mobile below 768px to prevent horizontal overflow */}
          <div 
            className="hidden md:block pointer-events-none select-none absolute right-4 sm:right-10 top-12 sm:top-16 font-serif text-3xl sm:text-4xl md:text-5xl text-slate-900/[0.04] dark:text-white/[0.03] tracking-wide whitespace-nowrap overflow-hidden max-w-[45%]"
            aria-hidden="true"
          >
            Ghanteshwar Multiple C...
          </div>

          {/* Subtle ghost markings of erased classroom grammar strictly in margins */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.035] dark:opacity-[0.02] overflow-hidden" aria-hidden="true">
            {/* MOBILE FIX: Added max-w-full and preserveAspectRatio="xMidYMid slice" to prevent SVG distortion or overflow on mobile */}
            <svg className="w-full h-full max-w-full" viewBox="0 0 1000 700" fill="none" preserveAspectRatio="xMidYMid slice">
              <path d="M 50 120 Q 500 60 950 150" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" />
              <path d="M 120 480 Q 450 560 880 460" stroke="currentColor" strokeWidth="1" strokeDasharray="8 8" />
              <text x="35" y="60" className="font-serif text-2xl fill-current">[ / ɪŋɡlɪʃ edʒʊkeɪʃn / ]</text>
              <text x="740" y="80" className="font-mono text-xl fill-current">S -&gt; NP + VP</text>
              <text x="60" y="640" className="font-hand text-3xl fill-current">stet · dele · caret</text>
              <text x="750" y="620" className="font-serif text-xl fill-current">B.Ed. Curriculum</text>
            </svg>
          </div>

          {/* Stacked Board Pages */}
          {BOARDS.map((board, index) => {
            const isActive = activeBoardIndex === index;
            const isTarget = targetBoardIndex === index;
            const isVisible = isActive || isTarget;

            return (
              <div
                key={board.id}
                id={`board-page-${board.id}`}
                ref={el => { boardContainerRefs.current[index] = el; }}
                className={`absolute inset-0 board-page-scroller px-5 sm:px-10 md:px-14 lg:px-20 pt-6 pb-12 select-text transition-opacity duration-350 ${
                  isVisible ? 'block' : 'hidden'
                } ${isActive ? 'z-10' : 'z-0'} ${isIntroActive ? 'opacity-0' : 'opacity-100'}`}
                inert={!isActive || isIntroActive ? true : undefined}
                aria-hidden={!isActive || isIntroActive}
              >
                <div className="max-w-4xl mx-auto">

                  {/* BOARD 0: HERO (Art-directed Editorial Composition with Taped Polaroid Faculty Portrait) */}
                                 {index === 0 && (
                    <div className="space-y-6 pt-1 pb-6">
                      
                      {/* Top Row: Sub-header with Campus on left & Archival note on right */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800/80 pb-3">
                        <div className="text-[10px] sm:text-[11px] font-sans uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 font-medium">
                          GHANTESHWAR MULTIPLE CAMPUS  ·  JORAYAL-4, DOTI, NEPAL
                        </div>
                       
                      </div>

                      {/* Main Hero Grid: Two-Column Composition */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start mt-3 sm:mt-5">
                        
                        {/* Left Column: Academic Credentials, Directive, and Contacts */}
                        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                          
                          {/* Grand Hero Name & Title */}
                          <div>
                            <h1 
                              ref={el => { boardHeadingRefs.current[0] = el; }}
                              data-hero-name="true"
                              tabIndex={-1}
                              className="text-4xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight text-[#111827] dark:text-[#F3F4F6] leading-[1.05] outline-hidden"
                            >
                              LILADHAR BHATTA
                            </h1>

                            {/* Solid Blue Horizontal Accent Bar */}
                            <div className="w-24 sm:w-28 h-[3.5px] bg-[#1F3A5F] dark:bg-[#93C5FD] rounded-full my-4" />

                            {/* Academic Title */}
                            <p className="text-xl sm:text-2xl md:text-3xl font-serif text-[#334155] dark:text-[#CBD5E1] font-normal leading-snug">
                              Assistant Professor of English Education
                            </p>
                          </div>

                          {/* Academic Directive Card */}
                          <div className="p-6 sm:p-7 rounded-2xl bg-[#FAF9F5] dark:bg-[#1E2530] border border-slate-200 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                            <span className="block text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-[#4B5E78] dark:text-[#93C5FD] font-semibold mb-3">
                              ACADEMIC DIRECTIVE
                            </span>
                            <blockquote className="font-serif text-lg sm:text-xl text-[#1E293B] dark:text-[#E2E8F0] leading-relaxed">
                              “Dedicated to advancing{" "}
                              <span className="inline-block bg-[#EBF0F7] dark:bg-[#283548] text-[#1E3A8A] dark:text-[#93C5FD] px-2 py-0.5 rounded border border-[#D0DBEA] dark:border-[#3B4A60] font-sans font-medium text-base">
                                English language pedagogy
                              </span>
                              {" "} , collegiate{" "}
                              <span className="inline-block bg-[#EBF0F7] dark:bg-[#283548] text-[#1E3A8A] dark:text-[#93C5FD] px-2 py-0.5 rounded border border-[#D0DBEA] dark:border-[#3B4A60] font-sans font-medium text-base">
                                curriculum dissemination
                              </span>
                              {" "} , and transformative student learning across higher educational institutions in Far Western Nepal.”
                            </blockquote>
                          </div>

                          {/* Verified Contact Details & Campus Coordinates */}
                          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-sans text-[#4B5563] dark:text-[#9CA3AF]">
                            <a href={`mailto:${DATA.personal.email}`} className="inline-flex items-center gap-1.5 hover:text-[#1F3A5F] dark:hover:text-[#9DB8E3] underline underline-offset-4">
                              <Mail className="w-3.5 h-3.5 text-[#1F3A5F] dark:text-[#9DB8E3]" />
                              <span>{DATA.personal.email}</span>
                            </a>
                            <span aria-hidden="true" className="opacity-40">·</span>
                            <span className="inline-flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-[#20563F] dark:text-[#8CC9A8]" />
                              <span>{DATA.personal.phone}</span>
                            </span>
                            <span aria-hidden="true" className="opacity-40">·</span>
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#A93226] dark:text-[#E8938A]" />
                              <span>{DATA.personal.addressCity}</span>
                            </span>
                          </div>
                        <div className="lg:col-span-5 flex flex-col items-center lg:items-end">
                          
                          {/* Syntax Tree Marginalia in the top right corner */}
                          <div className="hidden lg:block mb-3 opacity-30 dark:opacity-20 pointer-events-none" aria-hidden="true">
                            <svg width="180" height="75" viewBox="0 0 180 75" fill="none" stroke="currentColor">
                              <text x="90" y="15" textAnchor="middle" className="font-mono text-xs fill-current">S</text>
                              <line x1="90" y1="20" x2="50" y2="40" strokeWidth="1" />
                              <line x1="90" y1="20" x2="130" y2="40" strokeWidth="1" />
                              <text x="50" y="55" textAnchor="middle" className="font-mono text-[11px] fill-current">NP</text>
                              <text x="130" y="55" textAnchor="middle" className="font-mono text-[11px] fill-current">VP</text>
                              <text x="90" y="70" textAnchor="middle" className="font-hand text-[10px] fill-[#1F3A5F] dark:fill-[#9DB8E3]">ELT Syntax</text>
                            </svg>
                          </div>

                          <div className="relative w-full max-w-xs rotate-[-1.2deg] hover:rotate-0 transition-transform duration-300">
                            
                            {/* Two Translucent Masking Tape Strips with Light from Top-Left */}
                            <div className="absolute -top-3 left-8 w-24 h-5 masking-tape z-20 rounded-xs" aria-hidden="true" />
                            <div className="absolute top-12 -right-3 w-5 h-16 masking-tape z-20 rounded-xs rotate-12" aria-hidden="true" />

                         
                          <div className="bg-[#FAF8F4] dark:bg-[#20262E] p-3.5 pb-5 rounded-xs border border-[#D5D0C2] dark:border-[#2D3642] paper-card-shadow">
                              <div className="aspect-4/5 w-full bg-[#EAE7DE] dark:bg-[#181E25] rounded-xs overflow-hidden flex flex-col items-center justify-center text-center p-5 border border-[#D5D0C2]/60 dark:border-[#2D3642]">
                                {CONFIG.PROFILE_IMAGE_SRC ? (
                                  <img 
                                    src={CONFIG.PROFILE_IMAGE_SRC} 
                                    alt={CONFIG.PROFILE_IMAGE_ALT}
                                    className="w-full h-full object-cover object-top"
                                    loading="eager"
                                    fetchPriority="high"
                                  />
                                ) : (
                                  <div className="space-y-3">
                                    <div className="w-16 h-16 mx-auto rounded-full border-2 border-dashed border-[#1F3A5F] dark:border-[#9DB8E3] flex items-center justify-center text-xl font-serif font-bold text-[#1F3A5F] dark:text-[#9DB8E3]">
                                      LDB
                                    </div>
                                    <div className="space-y-0.5">
                                      <p className="text-sm font-serif font-medium text-[#1C2128] dark:text-[#E9E6DE]">
                                        Lila Dhar Bhatta
                                      </p>
                                      <p className="text-[11px] font-sans text-[#4B5563] dark:text-[#9CA3AF]">
                                        M.A. English · B.Ed. English Education
                                      </p>
                                    </div>
                                    <div className="inline-block px-2.5 py-0.5 bg-[#F3F1EB] dark:bg-[#171B20] rounded text-[10px] font-sans text-[#4B5563] dark:text-[#9CA3AF] border border-[#D8D4C8] dark:border-[#29303A]">
                                      Portrait Slot (CONFIG.PROFILE_IMAGE_SRC)
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="mt-3 pt-2.5 border-t border-[#D5D0C2] dark:border-[#2D3642] flex items-center justify-between">
                                <div>
                                  <p className="text-[10px] font-sans uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF]">
                                    Faculty Signature
                                  </p>
                                  {CONFIG.SIGNATURE_SRC ? (
                                    <img src={CONFIG.SIGNATURE_SRC} alt="Lila Dhar Bhatta signature" className="h-8 object-contain" />
                                  ) : (
                                    <p className="font-hand text-lg text-[#1F3A5F] dark:text-[#9DB8E3] tracking-wide">
                                      L. D. Bhatta
                                    </p>
                                  )}
                                </div>
                                <span className="text-[9px] font-mono text-[#4B5563] dark:text-[#9CA3AF] bg-[#F3F1EB] dark:bg-[#171B20] px-1.5 py-0.5 rounded">
                                  Sudurpaschim
                                </span>
                              </div>
                            </div>

                            <div className="absolute -bottom-5 -left-3 font-mono text-[11px] text-[#A93226] dark:text-[#E8938A] opacity-75 pointer-events-none" aria-hidden="true">
                            </div>
                          </div>
                        </div>
                        </div>
                       

                      </div>
                    </div>
                  )}
                  {/* BOARD 1: ABOUT */}
                  {index === 1 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        {/* MOBILE FIX: outline-none on mobile/touch, focus-visible for keyboard */}
                        <h2 
                          ref={el => { boardHeadingRefs.current[1] = el; }}
                          tabIndex={-1}
                          className="text-2xl md:text-3xl font-serif font-bold text-[#1C2128] dark:text-[#E9E6DE] outline-none focus:outline-none focus:ring-0 focus-visible:outline-2 focus-visible:outline-[#1F3A5F] focus-visible:outline-offset-2"
                        >
                          Academic Background &amp; Profile
                        </h2>
                        <div className="h-px flex-1 bg-[#D8D4C8] dark:border-[#29303A]"></div>
                        <span className="text-xs font-hand text-[#1F3A5F] dark:text-[#9DB8E3]">
                          Jorayal, Doti, Nepal
                        </span>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-8 space-y-4 text-base md:text-lg font-serif text-[#1C2128] dark:text-[#E9E6DE] leading-relaxed">
                          <p>{DATA.bio}</p>
                          <p className="text-sm md:text-base font-sans text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed">
                            Over 27 years of dedicated classroom teaching have shaped his institutional expertise. He started teaching lower secondary English in Dhangadhi in 2053 B.S., served 10 years at Far West Regional Police Boarding School (becoming Vice Principal in 2064 B.S.), coordinated higher secondary English at Soo Jung Higher Secondary School, and subsequently transitioned to university teaching at Ghanteshwar Multiple Campus in 2069 B.S.
                          </p>
                          <p className="text-sm md:text-base font-sans text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed">
                            He continuously upgrades his pedagogical capabilities through University Grants Commission (UGC) Nepal and Far Western University programs—including 60 hours of faculty capacity enhancement, curriculum dissemination for undergraduate and graduate levels, and scholarly journal writing workshops.
                          </p>
                        </div>

                        {/* Right column: Linguistic Repertoire */}
                        <div className="lg:col-span-4 space-y-5">

                          {/* Sage paper note: Linguistic Repertoire. MOBILE FIX: rotate-0 on mobile to avoid horizontal protrusion */}
                          <div className="bg-[#EBF2EC] dark:bg-[#1F2826] p-5 rounded-md border border-[#D8D4C8] dark:border-[#29303A] paper-card-shadow rotate-0 md:rotate-[-1deg]">
                          <div className="flex items-center justify-between mb-3 border-b border-[#20563F]/20 pb-2">
                            <span className="text-xs font-sans font-semibold uppercase tracking-wider text-[#20563F] dark:text-[#8CC9A8]">
                              Linguistic Repertoire
                            </span>
                            <span className="text-xs font-hand text-[#20563F] dark:text-[#8CC9A8]">
                              Native Fluency
                            </span>
                          </div>
                          <ul className="space-y-2 text-sm font-sans">
                            {DATA.languages.map(lang => (
                              <li key={lang.name} className="flex items-center justify-between text-[#1C2128] dark:text-[#E9E6DE]">
                                <span className="font-medium">{lang.name}</span>
                                <span className="text-xs text-[#4B5563] dark:text-[#9CA3AF]">{lang.proficiency}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-4 pt-3 border-t border-[#20563F]/20 text-xs font-sans text-[#4B5563] dark:text-[#9CA3AF]">
                            Native to Far-Western Nepal (Sudur Paschim), teaching in English, Dotali, and Nepali.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                  {/* BOARD 2: PEDAGOGY & FOCUS AREAS */}
                  {index === 2 && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          {/* MOBILE FIX: outline-none on mobile/touch, focus-visible for keyboard */}
                          <h2 
                            ref={el => { boardHeadingRefs.current[2] = el; }}
                            tabIndex={-1}
                            className="text-2xl md:text-3xl font-serif font-bold text-[#1C2128] dark:text-[#E9E6DE] outline-none focus:outline-none focus:ring-0 focus-visible:outline-2 focus-visible:outline-[#1F3A5F] focus-visible:outline-offset-2"
                          >
                            Pedagogy &amp; Academic Focus Areas
                          </h2>
                          <p className="text-xs md:text-sm font-sans text-[#4B5563] dark:text-[#9CA3AF] mt-1">
                            Connected pedagogical pillars derived from his university teaching and UGC training.
                          </p>
                        </div>
                      
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
                        {DATA.researchAndInterests.map((item, idx) => {
                          const isSelected = selectedThreadId === item.id;
                          const hasActiveQuestion = activeMarginQuestion === item.id;

                          return (
                            <div 
                              key={item.id}
                              className={`relative p-5 rounded-md border transition-all duration-300 paper-card-shadow ${
                                isSelected 
                                  ? 'bg-[#FBFAF6] dark:bg-[#20262E] border-[#1F3A5F] dark:border-[#9DB8E3] ring-2 ring-[#1F3A5F]/20' 
                                  : 'bg-[#FBFAF6] dark:bg-[#20262E] border-[#D8D4C8] dark:border-[#29303A] hover:border-[#1F3A5F]/50'
                              }`}
                              style={{ transform: `rotate(${idx % 2 === 0 ? '-0.5deg' : '0.5deg'})` }}
                            >
                              <div className="absolute -top-2 left-6 w-3.5 h-3.5 rounded-full ceramic-magnet shadow-xs" aria-hidden="true" />
                              <div className="flex items-start justify-between gap-3 mb-2.5">
                                <div>
                                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#1F3A5F] dark:text-[#9DB8E3]">
                                    {item.scope}
                                  </span>
                                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#1C2128] dark:text-[#E9E6DE]">
                                    {item.title}
                                  </h3>
                                </div>

                               
                              </div>

                              <p className="text-xs sm:text-sm font-sans text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed mb-3">
                                {item.details}
                              </p>

                             

                              {/* Margin note memo popup */}
                              {hasActiveQuestion && (
                                <div 
                                  id={`margin-note-${item.id}`}
                                  className="absolute inset-x-2 top-2 z-30 p-4 bg-[#F5EFEB] dark:bg-[#242A30] rounded-md border border-[#D8D4C8] dark:border-[#29303A] paper-card-shadow text-xs font-sans text-[#1C2128] dark:text-[#E9E6DE] animate-in fade-in zoom-in-95 duration-150"
                                >
                                  <div className="flex items-center justify-between mb-2 pb-1 border-b border-[#D8D4C8] dark:border-[#29303A]">
                                    <span className="font-semibold text-[#1F3A5F] dark:text-[#9DB8E3] font-serif">
                                      {item.marginQuestion}
                                    </span>
                                    <button 
                                      onClick={() => setActiveMarginQuestion(null)}
                                      className="p-1 text-[#4B5563] hover:text-[#1C2128] dark:text-[#9CA3AF] dark:hover:text-[#E9E6DE]"
                                      title="Close note (Escape)"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <p className="leading-relaxed mb-2.5 text-[11px]">
                                    {item.marginAnswer}
                                  </p>
                                  <div className="text-[9px] font-mono text-[#4B5563] dark:text-[#9CA3AF] italic">
                                    {item.cvSource}
                                  </div>
                                </div>
                              )}

                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* BOARD 3: TEACHING TIMELINE */}
                  {index === 3 && (
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div>
                          {/* MOBILE FIX: outline-none on mobile/touch, focus-visible for keyboard */}
                          <h2 
                            ref={el => { boardHeadingRefs.current[3] = el; }}
                            tabIndex={-1}
                            className="text-2xl md:text-3xl font-serif font-bold text-[#1C2128] dark:text-[#E9E6DE] outline-none focus:outline-none focus:ring-0 focus-visible:outline-2 focus-visible:outline-[#1F3A5F] focus-visible:outline-offset-2"
                          >
                            Teaching Experience &amp; Institutional Trajectory
                          </h2>
                          <p className="text-xs md:text-sm font-sans text-[#4B5563] dark:text-[#9CA3AF] mt-1">
                            From classroom language teaching in Dhangadhi to university professorship in Doti.
                          </p>
                        </div>
                        
                      </div>

                      <div className="relative border-l-2 border-dashed border-[#D8D4C8] dark:border-[#29303A] ml-3 md:ml-6 mt-5 pl-5 md:pl-8 space-y-6">
                        {DATA.teachingExperience.map(exp => {
                          const isThreadConnected = selectedThreadId 
                            ? DATA.researchAndInterests.find(r => r.id === selectedThreadId)?.connectedIds.includes(exp.id)
                            : false;

                          let inkClass = "text-[#1C2128] dark:text-[#E9E6DE]";
                          let periodClass = "text-[#1F3A5F] dark:text-[#9DB8E3]";
                          if (exp.tier === 'earliest') {
                            inkClass = "text-[#4B5563] dark:text-[#9CA3AF]";
                            periodClass = "text-[#4B5563] dark:text-[#9CA3AF]";
                          } else if (exp.tier === 'recent') {
                            inkClass = "text-[#161C24] dark:text-[#FFFFFF] font-medium";
                            periodClass = "text-[#1F3A5F] dark:text-[#9DB8E3] font-semibold";
                          }

                          return (
                            <div 
                              key={exp.id}
                              className={`relative transition-opacity duration-300 ${
                                selectedThreadId && !isThreadConnected ? 'opacity-45' : 'opacity-100'
                              }`}
                            >
                              <div 
                                className={`absolute -left-[27px] md:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full border-2 ${
                                  exp.isCurrent 
                                    ? 'bg-[#1F3A5F] dark:bg-[#9DB8E3] border-white dark:border-[#171B20] ring-4 ring-[#1F3A5F]/20' 
                                    : 'bg-[#FBFAF6] dark:bg-[#20262E] border-[#4B5563]'
                                }`}
                                aria-hidden="true"
                              />

                              <div className="bg-[#FBFAF6] dark:bg-[#20262E] p-4 sm:p-5 rounded-md border border-[#D8D4C8] dark:border-[#29303A] paper-card-shadow">
                                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1.5">
                                  <h3 className={`text-base sm:text-lg font-serif font-bold ${inkClass}`}>
                                    {exp.role}
                                  </h3>
                                  <div className={`text-xs font-sans ${periodClass} whitespace-nowrap`}>
                                    {exp.periodBs}
                                  </div>
                                </div>

                                <div className="text-xs sm:text-sm font-sans font-medium text-[#1F3A5F] dark:text-[#9DB8E3] mb-2.5">
                                  {exp.institution} · <span className="text-[#4B5563] dark:text-[#9CA3AF] font-normal">{exp.location}</span>
                                </div>

                                {exp.previousRole && (
                                  <p className="text-xs font-sans text-[#20563F] dark:text-[#8CC9A8] mb-1.5 font-medium">
                                    Prior appointment: {exp.previousRole}
                                  </p>
                                )}

                                <p className={`text-xs sm:text-sm font-sans leading-relaxed ${inkClass}`}>
                                  {exp.notes}
                                </p>

                                <div className="mt-2.5 pt-2 border-t border-[#D8D4C8]/60 dark:border-[#29303A] text-[10px] font-mono text-[#4B5563] dark:text-[#9CA3AF]">
                                  {exp.cvSource}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* BOARD 4: WORKSHOPS & FACULTY ARCHIVE */}
                  {index === 4 && (
                    <div className="space-y-5">
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
                        <div>
                          {/* MOBILE FIX: outline-none on mobile/touch, focus-visible for keyboard */}
                          <h2 
                            ref={el => { boardHeadingRefs.current[4] = el; }}
                            tabIndex={-1}
                            className="text-2xl md:text-3xl font-serif font-bold text-[#1C2128] dark:text-[#E9E6DE] outline-none focus:outline-none focus:ring-0 focus-visible:outline-2 focus-visible:outline-[#1F3A5F] focus-visible:outline-offset-2"
                          >
                            Faculty Development &amp; Academic Workshops
                          </h2>
                          <p className="text-xs md:text-sm font-sans text-[#4B5563] dark:text-[#9CA3AF] mt-1">
                            UGC, Far Western University, and institutional workshops attended as listed in CV.
                          </p>
                        </div>

                       
                      </div>

                     

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayedWorkshops.map(ws => (
                          <div 
                            key={ws.id} 
                            className="bg-[#FBFAF6] dark:bg-[#20262E] p-4 rounded-md border border-[#D8D4C8] dark:border-[#29303A] paper-card-shadow flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between text-[10px] font-mono text-[#4B5563] dark:text-[#9CA3AF] mb-1.5">
                                <span className="text-[#1F3A5F] dark:text-[#9DB8E3] font-medium">{ws.type}</span>
                                <span>{ws.year}</span>
                              </div>
                              <h3 className="text-sm font-serif font-bold text-[#1C2128] dark:text-[#E9E6DE] mb-1.5">
                                {ws.title}
                              </h3>
                              <p className="text-xs font-sans text-[#4B5563] dark:text-[#9CA3AF] leading-relaxed mb-3">
                                {ws.organizer}
                              </p>
                            </div>

                            <div className="pt-2.5 border-t border-[#D8D4C8]/60 dark:border-[#29303A] text-[11px] font-sans flex items-center justify-between text-[#4B5563] dark:text-[#9CA3AF]">
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{ws.location}</span>
                              </span>
                              <span>{ws.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {filteredWorkshops.length > 3 && (
                        <div className="mt-3 text-center">
                          <button
                            onClick={() => setIsWorkshopsExpanded(prev => !prev)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium text-[#1F3A5F] dark:text-[#9DB8E3] border border-[#1F3A5F]/30 dark:border-[#9DB8E3]/30 rounded hover:bg-[#FBFAF6] dark:hover:bg-[#20262E] transition-colors"
                          >
                            <span>{isWorkshopsExpanded ? 'Show fewer workshops' : `Show all (${filteredWorkshops.length}) workshops`}</span>
                            {isWorkshopsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* BOARD 5: CREDENTIALS & HONORS */}
                  {index === 5 && (
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        {/* MOBILE FIX: outline-none on mobile/touch, focus-visible for keyboard */}
                        <h2 
                          ref={el => { boardHeadingRefs.current[5] = el; }}
                          tabIndex={-1}
                          className="text-2xl md:text-3xl font-serif font-bold text-[#1C2128] dark:text-[#E9E6DE] outline-none focus:outline-none focus:ring-0 focus-visible:outline-2 focus-visible:outline-[#1F3A5F] focus-visible:outline-offset-2"
                        >
                          Degrees, Certifications &amp; Honors
                        </h2>
                        <div className="h-px flex-1 bg-[#D8D4C8] dark:border-[#29303A]"></div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-7 bg-[#FBFAF6] dark:bg-[#20262E] p-5 rounded-md border border-[#D8D4C8] dark:border-[#29303A] paper-card-shadow">
                          <div className="flex items-center gap-2 mb-3 text-[#1F3A5F] dark:text-[#9DB8E3]">
                            <GraduationCap className="w-4 h-4" />
                            <h3 className="text-base font-serif font-bold text-[#1C2128] dark:text-[#E9E6DE]">
                              Formal Academic Qualifications
                            </h3>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs font-sans" aria-label="Academic qualifications">
                              <thead>
                                <tr className="border-b border-[#D8D4C8] dark:border-[#29303A] text-[#4B5563] dark:text-[#9CA3AF] uppercase font-mono text-[10px]">
                                  <th className="py-2 pr-3">Degree &amp; Program</th>
                                  <th className="py-2 px-3">Institution</th>
                                  <th className="py-2 px-2">Year</th>
                                  <th className="py-2 pl-3 text-right">Result</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#D8D4C8]/50 dark:divide-[#29303A]">
                                {DATA.education.map(edu => (
                                  <tr key={edu.id} className="hover:bg-[#F3F1EB]/50 dark:hover:bg-[#171B20]/40 transition-colors">
                                    <td className="py-2.5 pr-3 font-medium text-[#1C2128] dark:text-[#E9E6DE]">{edu.degree}</td>
                                    <td className="py-2.5 px-3 text-[#4B5563] dark:text-[#9CA3AF]">{edu.institution}</td>
                                    <td className="py-2.5 px-2 font-mono text-xs whitespace-nowrap text-[#4B5563] dark:text-[#9CA3AF]">{edu.year}</td>
                                    <td className="py-2.5 pl-3 text-right font-mono text-xs whitespace-nowrap text-[#20563F] dark:text-[#8CC9A8]">{edu.result}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="lg:col-span-5 space-y-5">
                          {/* MOBILE FIX: rotate-0 on mobile, rotate-1 on desktop */}
                          <div className="bg-[#F5EFEB] dark:bg-[#242A30] p-4 rounded-md border border-[#D8D4C8] dark:border-[#29303A] paper-card-shadow rotate-0 md:rotate-1">
                            <div className="flex items-center gap-1.5 mb-1.5 text-[#A93226] dark:text-[#E8938A]">
                              <Award className="w-4 h-4" />
                              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider">
                                Institutional Honor
                              </span>
                            </div>
                            <h4 className="text-sm sm:text-base font-serif font-bold text-[#1C2128] dark:text-[#E9E6DE]">
                              {DATA.awards[0].title}
                            </h4>
                            <p className="text-xs font-sans text-[#4B5563] dark:text-[#9CA3AF] mt-1 leading-relaxed">
                              Conferred by Far West Regional Police Boarding School on the occasion of its 20th Annual Function for exemplary teaching service.
                            </p>
                            <div className="mt-2 text-[10px] font-mono text-[#A93226] dark:text-[#E8938A]">
                              Academic Year 2061 B.S. (~2004 A.D.)
                            </div>
                          </div>

                          {/* MOBILE FIX: rotate-0 on mobile, rotate-[-0.5deg] on desktop */}
                          <div className="bg-[#FBFAF6] dark:bg-[#20262E] p-4 rounded-md border border-[#D8D4C8] dark:border-[#29303A] paper-card-shadow rotate-0 md:rotate-[-0.5deg]">
                            <div className="flex items-center gap-1.5 mb-2 text-[#1F3A5F] dark:text-[#9DB8E3]">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider">
                                Key Pedagogical Skills (CV)
                              </span>
                            </div>
                            <ul className="space-y-1 text-xs font-sans text-[#1C2128] dark:text-[#E9E6DE]">
                              {DATA.skills.map((skill, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-[#20563F] dark:text-[#8CC9A8] font-bold">·</span>
                                  <span>{skill}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BOARD 6: INSTITUTIONAL LEADERSHIP & CAMPUS SERVICE */}
                  {index === 6 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        {/* MOBILE FIX: outline-none on mobile/touch, focus-visible for keyboard */}
                        <h2 
                          ref={el => { boardHeadingRefs.current[6] = el; }}
                          tabIndex={-1}
                          className="text-2xl md:text-3xl font-serif font-bold text-[#1C2128] dark:text-[#E9E6DE] outline-none focus:outline-none focus:ring-0 focus-visible:outline-2 focus-visible:outline-[#1F3A5F] focus-visible:outline-offset-2"
                        >
                          Institutional Leadership &amp; Campus Service
                        </h2>
                        <div className="h-px flex-1 bg-[#D8D4C8] dark:border-[#29303A]"></div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <div className="lg:col-span-7 space-y-4">
                          <div className="bg-[#FBFAF6] dark:bg-[#20262E] p-5 rounded-md border border-[#D8D4C8] dark:border-[#29303A] paper-card-shadow">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#1F3A5F] dark:text-[#9DB8E3] font-semibold block mb-2">
                              Administrative &amp; Leadership Positions
                            </span>
                            <div className="space-y-4 text-xs font-sans">
                              <div className="border-l-2 border-[#1F3A5F] pl-3 py-0.5">
                                <h4 className="font-serif font-bold text-sm text-[#1C2128] dark:text-[#E9E6DE]">
                                  Assistant Professor &amp; Senior Faculty
                                </h4>
                                <p className="text-[#4B5563] dark:text-[#9CA3AF]">Ghanteshwar Multiple Campus, Jorayal-4, Doti</p>
                                <p className="text-[11px] text-[#1F3A5F] dark:text-[#9DB8E3] font-mono mt-0.5">2073/10/6 B.S. (Jan 2017) – Present</p>
                                <p className="mt-1 text-[#4B5563] dark:text-[#9CA3AF]">
                                  Leading collegiate English language curriculum delivery, university exam coordination, and student research supervision across Far Western Nepal.
                                </p>
                              </div>

                              <div className="border-l-2 border-[#20563F] pl-3 py-0.5">
                                <h4 className="font-serif font-bold text-sm text-[#1C2128] dark:text-[#E9E6DE]">
                                  Vice Principal &amp; Senior Teacher
                                </h4>
                                <p className="text-[#4B5563] dark:text-[#9CA3AF]">Far West Regional Police Boarding School, Dhangadhi, Kailali</p>
                                <p className="text-[11px] text-[#20563F] dark:text-[#8CC9A8] font-mono mt-0.5">2064/04/10 B.S. – 2069/11/17 B.S. (5+ Years as Vice Principal)</p>
                                <p className="mt-1 text-[#4B5563] dark:text-[#9CA3AF]">
                                  Overseeing academic operations, curriculum standardization, teacher evaluations, and institutional administration.
                                </p>
                              </div>

                              <div className="border-l-2 border-[#A93226] pl-3 py-0.5">
                                <h4 className="font-serif font-bold text-sm text-[#1C2128] dark:text-[#E9E6DE]">
                                  Head Teacher
                                </h4>
                                <p className="text-[#4B5563] dark:text-[#9CA3AF]">Barsha Nava Jyoti Secondary School, Dhangadhi-4, Kailali</p>
                                <p className="text-[11px] text-[#A93226] dark:text-[#E8938A] font-mono mt-0.5">2054/07/01 B.S. – 2056/10/30 B.S.</p>
                                <p className="mt-1 text-[#4B5563] dark:text-[#9CA3AF]">
                                  Institutional school management, faculty hiring, syllabus design, and foundational ELT methodology.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-5 space-y-4">
                          <div className="bg-[#FAF8F3] dark:bg-[#242A30] p-5 rounded-md border border-[#D8D4C8] dark:border-[#29303A] paper-card-shadow">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#A93226] dark:text-[#E8938A] font-semibold block mb-2">
                              Certified Executive Training
                            </span>
                            <h4 className="text-sm font-serif font-bold text-[#1C2128] dark:text-[#E9E6DE]">
                              30 Days Training for Head Teachers of Institutional Schools
                            </h4>
                            <p className="text-xs font-sans text-[#4B5563] dark:text-[#9CA3AF] mt-1 leading-relaxed">
                              Secured <strong className="text-[#20563F] dark:text-[#8CC9A8]">1st Division</strong> distinction in comprehensive institutional management and instructional leadership.
                            </p>
                            <div className="mt-2.5 pt-2 border-t border-[#D8D4C8] dark:border-[#2D3642] flex justify-between text-[11px] font-mono text-[#4B5563] dark:text-[#9CA3AF]">
                              <span>Conferred by: TTC Dipayal, Doti</span>
                              <span className="font-semibold text-[#1F3A5F] dark:text-[#9DB8E3]">2068 B.S.</span>
                            </div>
                          </div>

                          <div className="bg-[#FBFAF6] dark:bg-[#20262E] p-4 rounded-md border border-[#D8D4C8] dark:border-[#29303A] paper-card-shadow">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#1F3A5F] dark:text-[#9DB8E3] font-semibold block mb-1.5">
                              Institutional References
                            </span>
                            <p className="text-xs font-sans text-[#1C2128] dark:text-[#E9E6DE]">
                              {DATA.references}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BOARD 7: CONTACT & WHITEBOARD DRAWING SLATE */}
                  {index === 7 && (
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        {/* MOBILE FIX: outline-none on mobile/touch, focus-visible for keyboard */}
                        <h2 
                          ref={el => { boardHeadingRefs.current[7] = el; }}
                          tabIndex={-1}
                          className="text-2xl md:text-3xl font-serif font-bold text-[#1C2128] dark:text-[#E9E6DE] outline-none focus:outline-none focus:ring-0 focus-visible:outline-2 focus-visible:outline-[#1F3A5F] focus-visible:outline-offset-2"
                        >
                          Contact &amp; Whiteboard Drawing Slate
                        </h2>
                        <div className="h-px flex-1 bg-[#D8D4C8] dark:border-[#29303A]"></div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        <div className="lg:col-span-5 space-y-4">
                          <div className="bg-[#FBFAF6] dark:bg-[#20262E] p-5 rounded-md border border-[#D8D4C8] dark:border-[#29303A] paper-card-shadow space-y-4">
                            <div>
                              <span className="text-[10px] font-mono uppercase tracking-wider text-[#1F3A5F] dark:text-[#9DB8E3]">
                                Faculty Coordinates
                              </span>
                              <h3 className="text-lg font-serif font-bold text-[#1C2128] dark:text-[#E9E6DE] mt-0.5">
                                Lila Dhar Bhatta
                              </h3>
                              <p className="text-xs font-sans text-[#4B5563] dark:text-[#9CA3AF]">
                                Assistant Professor of English Education
                              </p>
                            </div>

                            <div className="space-y-2.5 text-xs font-sans">
                              <div className="flex items-start gap-2.5">
                                <Mail className="w-3.5 h-3.5 text-[#1F3A5F] dark:text-[#9DB8E3] shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF]">Email</p>
                                  <a href={`mailto:${DATA.personal.email}`} className="font-medium hover:underline text-[#1C2128] dark:text-[#E9E6DE]">
                                    {DATA.personal.email}
                                  </a>
                                </div>
                              </div>

                              <div className="flex items-start gap-2.5">
                                <Phone className="w-3.5 h-3.5 text-[#20563F] dark:text-[#8CC9A8] shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF]">Phone</p>
                                  <span className="font-medium text-[#1C2128] dark:text-[#E9E6DE]">{DATA.personal.phone}</span>
                                </div>
                              </div>

                              <div className="flex items-start gap-2.5">
                                <MapPin className="w-3.5 h-3.5 text-[#A93226] dark:text-[#E8938A] shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-[#4B5563] dark:text-[#9CA3AF]">Campus &amp; Residence</p>
                                  <p className="text-[#1C2128] dark:text-[#E9E6DE]">Ghanteshwar Multiple Campus, Jorayal-4, Doti</p>
                                  <p className="text-[#4B5563] dark:text-[#9CA3AF] text-[11px]">Permanent: {DATA.personal.address}</p>
                                </div>
                              </div>
                            </div>

                            <div className="pt-3 border-t border-[#D8D4C8] dark:border-[#29303A] text-xs font-sans text-[#4B5563] dark:text-[#9CA3AF]">
                              References: <span className="font-medium text-[#1C2128] dark:text-[#E9E6DE]">{DATA.references}</span>
                            </div>
                          </div>

                          {/* END Download Control: Physical Pinned Paper Sheet with Miniature Preview */}
                          <div className="relative bg-[#FAF8F3] dark:bg-[#1E242B] p-4 sm:p-5 rounded-md border border-[#D5D0C2] dark:border-[#2D3642] paper-card-shadow pt-5">
                            {/* Dark Ceramic Magnet Disc holding the paper */}
                            <div 
                              className="absolute -top-2 left-8 w-4 h-4 rounded-full ceramic-magnet z-20 shadow-md" 
                              title="Ceramic whiteboard magnet"
                              aria-hidden="true" 
                            />

                            <div className="flex gap-4 items-start">
                              {/* Miniature Preview Sheet of Page 1 (Interactive) - MOBILE FIX: rotate-0 on mobile to avoid margin clipping */}
                              <button
                                type="button"
                                onClick={() => setIsCvModalOpen(true)}
                                className="shrink-0 w-24 sm:w-28 bg-white text-[#1C2128] border border-[#D5D0C2] rounded-xs p-2 shadow-xs rotate-0 sm:rotate-[-1deg] hover:rotate-0 hover:shadow-md transition-all duration-150 cursor-pointer text-left select-none outline-none focus:outline-none focus:ring-2 focus:ring-[#1F3A5F] group"
                                title="Click to view full Curriculum Vitae"
                                aria-label="Open full Curriculum Vitae viewer"
                              >
                                <div className="text-[5.5px] font-serif font-bold uppercase tracking-wider text-[#1F3A5F] leading-tight border-b border-[#1F3A5F]/40 pb-1 mb-1">
                                  <div>Lila Dhar Bhatta</div>
                                  <div className="text-[4px] font-sans font-normal text-[#4B5563] tracking-normal">Curriculum Vitae</div>
                                </div>
                                <div className="w-full h-0.5 bg-[#A93226] mb-1 opacity-80" />
                                <div className="space-y-0.5">
                                  <div className="text-[4px] font-sans font-semibold text-[#1F3A5F]">Objective</div>
                                  <div className="h-0.5 bg-gray-200 rounded-xs w-full" />
                                  <div className="h-0.5 bg-gray-200 rounded-xs w-4/5" />
                                </div>
                                <div className="mt-1 space-y-0.5">
                                  <div className="text-[4px] font-sans font-semibold text-[#1F3A5F]">Experience &amp; Training</div>
                                  <div className="h-0.5 bg-gray-300 rounded-xs w-full" />
                                  <div className="h-0.5 bg-gray-200 rounded-xs w-11/12" />
                                  <div className="h-0.5 bg-gray-200 rounded-xs w-3/4" />
                                </div>
                                <div className="mt-1 space-y-0.5">
                                  <div className="text-[4px] font-sans font-semibold text-[#1F3A5F]">Qualifications</div>
                                  <div className="h-0.5 bg-gray-300 rounded-xs w-10/12" />
                                  <div className="h-0.5 bg-gray-200 rounded-xs w-4/5" />
                                </div>
                                <div className="mt-1.5 pt-0.5 border-t border-gray-200 text-[3.5px] flex items-center justify-between text-gray-400 font-mono">
                                  <span className="text-[#1F3A5F] font-sans group-hover:underline">Click to view</span>
                                  <span>p. 1 / {cvMeta.pageCount}</span>
                                </div>
                              </button>

                              {/* Content & Action */}
                              <div className="flex-1 space-y-2">
                                <div>
                                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#20563F] dark:text-[#8CC9A8] font-semibold block">
                                    Official Dossier
                                  </span>
                                  <h4 className="text-sm font-serif font-bold text-[#1C2128] dark:text-[#E9E6DE]">
                                    Curriculum Vitae
                                  </h4>
                                  <p className="text-[11px] font-sans text-[#4B5563] dark:text-[#9CA3AF] mt-0.5 leading-snug">
                                    Print-quality PDF with full 27-year trajectory, credentials, and UGC trainings.
                                  </p>
                                </div>

                                <div className="pt-0.5 space-y-1.5">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={(e) => handleCvDownload(e)}
                                      className="inline-flex items-center gap-1.5 text-xs font-serif font-bold text-[#1F3A5F] dark:text-[#9DB8E3] hover:underline underline-offset-4 decoration-1 decoration-[#1F3A5F] dark:decoration-[#9DB8E3] transition-colors cursor-pointer"
                                    >
                                      <Download className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                                      <span>Download Curriculum Vitae</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setIsCvModalOpen(true)}
                                      className="inline-flex items-center gap-1 text-[11px] font-sans text-[#4B5563] dark:text-[#9CA3AF] hover:text-[#1F3A5F] dark:hover:text-[#9DB8E3] transition-colors cursor-pointer"
                                    >
                                      <Eye className="w-3 h-3" />
                                      <span>Preview</span>
                                    </button>
                                  </div>

                                  {/* Metadata Line */}
                                  <div className="text-[10px] font-mono text-[#6B7280] dark:text-[#9CA3AF]">
                                    PDF · {cvMeta.pageCount} pages · {cvMeta.sizeKb} KB · Updated {cvMeta.buildDate}
                                  </div>

                                  {/* Browser print view fallback */}
                                  <div className="pt-1.5 border-t border-[#D5D0C2]/70 dark:border-[#2D3642] flex items-center justify-between text-[10px] font-sans text-[#6B7280] dark:text-[#9CA3AF]">
                                    <span>Print fallback:</span>
                                    <button
                                      type="button"
                                      onClick={handlePrintCv}
                                      className="hover:underline text-[#1F3A5F] dark:text-[#9DB8E3] text-[10px] flex items-center gap-1 cursor-pointer"
                                    >
                                      <Printer className="w-3 h-3" />
                                      <span>Print / Save as PDF</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-7 bg-[#FBFAF6] dark:bg-[#20262E] p-5 rounded-md border border-[#D8D4C8] dark:border-[#29303A] paper-card-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                            <div>
                              <h3 className="text-sm sm:text-base font-serif font-bold text-[#1C2128] dark:text-[#E9E6DE]">
                                Take the Marker · Leave a Note
                              </h3>
                              <p className="text-[11px] font-sans text-[#4B5563] dark:text-[#9CA3AF]">
                                Draw or write directly on this patch of board.
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center gap-1.5 p-1 bg-[#F3F1EB] dark:bg-[#171B20] rounded-md border border-[#D8D4C8] dark:border-[#29303A]">
                                <button
                                  onClick={() => setMarkerColor('#1F3A5F')}
                                  className={`w-3.5 h-3.5 rounded-full bg-[#1F3A5F] ${markerColor === '#1F3A5F' ? 'ring-2 ring-offset-1 ring-[#1F3A5F]' : ''}`}
                                  title="Blue marker"
                                  aria-label="Blue marker"
                                />
                                <button
                                  onClick={() => setMarkerColor('#1C2128')}
                                  className={`w-3.5 h-3.5 rounded-full bg-[#1C2128] dark:bg-[#E9E6DE] ${markerColor === '#1C2128' ? 'ring-2 ring-offset-1 ring-[#1C2128]' : ''}`}
                                  title="Black marker"
                                  aria-label="Black marker"
                                />
                                <button
                                  onClick={() => setMarkerColor('#A93226')}
                                  className={`w-3.5 h-3.5 rounded-full bg-[#A93226] ${markerColor === '#A93226' ? 'ring-2 ring-offset-1 ring-[#A93226]' : ''}`}
                                  title="Red marker"
                                  aria-label="Red marker"
                                />
                                <button
                                  onClick={() => setMarkerColor('#20563F')}
                                  className={`w-3.5 h-3.5 rounded-full bg-[#20563F] ${markerColor === '#20563F' ? 'ring-2 ring-offset-1 ring-[#20563F]' : ''}`}
                                  title="Green marker"
                                  aria-label="Green marker"
                                />
                                <button
                                  onClick={() => setMarkerColor('eraser')}
                                  className={`p-0.5 rounded text-xs ${markerColor === 'eraser' ? 'text-[#A93226] font-bold' : 'text-[#4B5563]'}`}
                                  title="Eraser tool"
                                  aria-label="Eraser tool"
                                >
                                  <Eraser className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <button onClick={undoCanvas} className="p-1 text-xs text-[#4B5563] hover:text-[#1C2128] dark:text-[#9CA3AF] dark:hover:text-[#E9E6DE] border border-[#D8D4C8] dark:border-[#29303A] rounded bg-[#F3F1EB] dark:bg-[#171B20]" title="Undo stroke">
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span className="sr-only">Undo</span>
                              </button>
                              <button onClick={clearCanvas} className="px-2 py-0.5 text-xs font-sans text-[#4B5563] hover:text-[#A93226] border border-[#D8D4C8] dark:border-[#29303A] rounded bg-[#F3F1EB] dark:bg-[#171B20]">
                                Clear
                              </button>
                            </div>
                          </div>

                          <div className="relative border border-[#D8D4C8] dark:border-[#29303A] rounded bg-[#F3F1EB] dark:bg-[#171B20] overflow-hidden shadow-inner">
                            <canvas
                              ref={canvasRef}
                              onPointerDown={startDrawing}
                              onPointerMove={draw}
                              onPointerUp={stopDrawing}
                              onPointerCancel={stopDrawing}
                              className="w-full h-36 cursor-crosshair block"
                              style={{ touchAction: 'none' }}
                            />
                          </div>

                          <div className="mt-3 space-y-2.5">
                            <div>
                              <label htmlFor={visitorNoteId} className="block text-xs font-sans font-medium text-[#4B5563] dark:text-[#9CA3AF] mb-1">
                                Your message to Lila Dhar Bhatta:
                              </label>
                              <input
                                id={visitorNoteId}
                                type="text"
                                value={customVisitorNote}
                                onChange={e => setCustomVisitorNote(e.target.value)}
                                placeholder="e.g. Inquiring regarding English Education seminar..."
                                className="w-full text-xs font-sans px-3 py-1.5 bg-[#F3F1EB] dark:bg-[#171B20] border border-[#D8D4C8] dark:border-[#29303A] rounded text-[#1C2128] dark:text-[#E9E6DE] placeholder-[#4B5563]/60 focus:outline-hidden"
                              />
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
                              <button onClick={downloadCanvas} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-sans text-[#4B5563] dark:text-[#9CA3AF] border border-[#D8D4C8] dark:border-[#29303A] rounded hover:bg-[#F3F1EB] dark:hover:bg-[#171B20]">
                                <Download className="w-3 h-3" />
                                <span>Download drawing (.PNG)</span>
                              </button>

                              <a
                                href={`mailto:${DATA.personal.email}?subject=Note for Lila Dhar Bhatta (via Portfolio)&body=${encodeURIComponent(
                                  customVisitorNote || 'Hello Professor Bhatta, I reviewed your academic whiteboard portfolio and would like to connect.'
                                )}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-sans font-medium text-white bg-[#1F3A5F] dark:bg-[#20563F] rounded hover:opacity-90 transition-opacity"
                              >
                                <Send className="w-3 h-3" />
                                <span>Send note via Email</span>
                              </a>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {/* Duster Wipe Sweep Overlay (Strictly Clipped Inside Writing Area) */}
          {isWiping && (
            <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden" aria-hidden="true">
              <div 
                className="absolute inset-0 bg-[#F3F1EB] dark:bg-[#171B20] transition-none"
                style={{
                  transform: wipeDirection === 'forward' 
                    ? `translateX(${wipeProgress - 100}%)` 
                    : `translateX(${100 - wipeProgress}%)`
                }}
              />

              <div 
                className="absolute top-1/2 -translate-y-1/2 w-12 h-40 transition-none z-50 flex flex-col items-center justify-center filter drop-shadow-xl"
                style={{
                  left: wipeDirection === 'forward'
                    ? `calc(${wipeProgress}% - 24px)`
                    : `calc(${100 - wipeProgress}% - 24px)`
                }}
              >
                <svg viewBox="0 0 60 180" className="w-full h-full">
                  <rect x="14" y="10" width="32" height="160" rx="4" fill="#B8977E" stroke="#8E6F56" strokeWidth="2" />
                  <line x1="22" y1="20" x2="22" y2="160" stroke="#7E5F46" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="38" y1="20" x2="38" y2="160" stroke="#7E5F46" strokeWidth="1" strokeDasharray="3 3" />
                  <rect x="4" y="20" width="10" height="140" rx="2" fill="#2E3440" />
                  <rect x="46" y="20" width="10" height="140" rx="2" fill="#2E3440" />
                  <ellipse cx="30" cy="90" rx="6" ry="20" fill="rgba(255,255,255,0.25)" />
                </svg>
              </div>

              <div 
                className="absolute top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/20 dark:to-white/5 pointer-events-none"
                style={{
                  left: wipeDirection === 'forward'
                    ? `calc(${wipeProgress}% - 28px)`
                    : `calc(${100 - wipeProgress}% + 20px)`
                }}
              />
            </div>
          )}

          {/* Interactive Classroom Lesson Intro Animation Layer */}
          {isIntroActive && (
            <OpeningLessonIntro
              forcePlay={forcePlayIntro}
              onComplete={handleIntroComplete}
              onSkip={handleIntroComplete}
            />
          )}

        </div>

        {/* =====================================================================
            ARCHITECTURAL TRAY AT BOTTOM OF WHITEBOARD (Reference layout)
            - Left: 4 horizontal dry-erase markers laying flat in tray
            - Right: Lecture 01 / 08 and 8 navigation step dots/pills + controls
            ===================================================================== */}
        {/* MOBILE FIX: Bottom bar simplified for mobile, hiding markers below 768px and giving dots generous spacing */}
        <div 
          className={`h-11 sm:h-12 bg-[#DDD9CD] dark:bg-[#20252C] border-t border-[#C7C3B7] dark:border-[#2D333B] px-3 sm:px-6 flex items-center justify-between select-none shrink-0 rounded-b-[18px] z-30 transition-opacity duration-350 ${
            isIntroActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          aria-hidden={isIntroActive ? true : undefined}
          inert={isIntroActive ? true : undefined}
        >
          
          {/* Left: 4 horizontal dry-erase markers laying flat in tray (DESKTOP ONLY: hidden below 768px) */}
          <div className="hidden md:flex items-center gap-2 sm:gap-2.5" aria-label="Whiteboard markers in tray">
            {/* Black marker */}
            <div 
              className="w-8 sm:w-10 h-2 sm:h-2.5 rounded-full bg-[#1F2429] shadow-xs flex items-center overflow-hidden border border-black/30" 
              title="Black chisel dry-erase marker"
            >
              <div className="w-2.5 sm:w-3 h-full bg-[#111417] border-r border-white/20" />
              <div className="flex-1 h-full bg-[#2A3038] relative">
                <div className="absolute top-[1px] inset-x-0 h-[1px] bg-white/20" />
              </div>
            </div>

            {/* Dark blue marker */}
            <div 
              className="w-8 sm:w-10 h-2 sm:h-2.5 rounded-full bg-[#1F3A5F] shadow-xs flex items-center overflow-hidden border border-[#162B47]" 
              title="Navy blue dry-erase marker"
            >
              <div className="w-2.5 sm:w-3 h-full bg-[#162B47] border-r border-white/20" />
              <div className="flex-1 h-full bg-[#244775] relative">
                <div className="absolute top-[1px] inset-x-0 h-[1px] bg-white/30" />
              </div>
            </div>

            {/* Forest green marker */}
            <div 
              className="w-8 sm:w-10 h-2 sm:h-2.5 rounded-full bg-[#20563F] shadow-xs flex items-center overflow-hidden border border-[#143B2B]" 
              title="Forest green dry-erase marker"
            >
              <div className="w-2.5 sm:w-3 h-full bg-[#143B2B] border-r border-white/20" />
              <div className="flex-1 h-full bg-[#2A6F52] relative">
                <div className="absolute top-[1px] inset-x-0 h-[1px] bg-white/30" />
              </div>
            </div>

            {/* Burgundy / Maroon marker */}
            <div 
              className="w-8 sm:w-10 h-2 sm:h-2.5 rounded-full bg-[#4A2E2B] shadow-xs flex items-center overflow-hidden border border-[#331E1C]" 
              title="Burgundy dry-erase marker"
            >
              <div className="w-2.5 sm:w-3 h-full bg-[#331E1C] border-r border-white/20" />
              <div className="flex-1 h-full bg-[#633E3A] relative">
                <div className="absolute top-[1px] inset-x-0 h-[1px] bg-white/25" />
              </div>
            </div>
          </div>

          {/* Tray Navigation Controls: Spans full width on mobile, right-aligned on desktop */}
          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2 sm:gap-4 min-w-0">
            <span className="text-[11px] sm:text-xs font-sans font-medium text-slate-700 dark:text-slate-300 tabular-nums shrink-0">
              Lecture {String(activeBoardIndex + 1).padStart(2, '0')} / {String(BOARDS.length).padStart(2, '0')}
            </span>

            {/* 8 Step indicators with comfortable touch targets */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0" aria-label="Board pagination dots">
              {BOARDS.map((_, dotIdx) => {
                const isDotActive = activeBoardIndex === dotIdx;
                return (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => triggerWipeToBoard(dotIdx, dotIdx > activeBoardIndex ? 'forward' : 'backward')}
                    disabled={isWiping}
                    className="relative min-w-[28px] sm:min-w-[32px] min-h-[36px] sm:min-h-[40px] flex items-center justify-center cursor-pointer -my-2 group"
                    title={`Go to Lecture ${dotIdx + 1}`}
                    aria-label={`Lecture ${dotIdx + 1}`}
                  >
                    <span
                      className={`block transition-all duration-200 ${
                        isDotActive 
                          ? 'w-4 sm:w-5 h-2 rounded-full bg-[#1F3A5F] dark:bg-[#93C5FD]' 
                          : 'w-2 h-2 rounded-full bg-slate-400/70 group-hover:bg-slate-600 dark:bg-slate-600 dark:group-hover:bg-slate-400'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Dark mode & intro replay controls with min 36-40px touch targets */}
            <div className="flex items-center gap-0.5 sm:gap-1 ml-1 sm:ml-2 pl-1.5 sm:pl-2 border-l border-black/10 dark:border-white/10 shrink-0">
              <button
                type="button"
                onClick={toggleDarkMode}
                className="min-w-[36px] sm:min-w-[40px] min-h-[36px] sm:min-h-[40px] flex items-center justify-center rounded text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                title={isDarkMode ? 'Switch to daylight room' : 'Switch to dim lecture room'}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={replayIntro}
                className="min-w-[36px] sm:min-w-[40px] min-h-[36px] sm:min-h-[40px] flex items-center justify-center rounded text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer hidden sm:inline-flex"
                title="Replay opening sequence"
                aria-label="Replay intro"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 3-Second Polite Aria-Live Announcement & Visual Confirmation */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {downloadNotice}
      </div>

      {downloadNotice && (
        <div 
          role="status"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#1F3A5F] text-white dark:bg-[#FAF8F3] dark:text-[#1C2128] px-4 py-2 rounded-md shadow-2xl text-xs font-sans font-medium flex items-center gap-2 select-none border border-white/20 dark:border-black/10"
        >
          <span className="w-2 h-2 rounded-full bg-[#8CC9A8] dark:bg-[#20563F] animate-ping" />
          <span>{downloadNotice} ({cvMeta.fileName})</span>
        </div>
      )}

      {/* Interactive Full-Screen Document Viewer & Print Modal */}
      {isCvModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs cv-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cv-modal-heading"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCvModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#F8F6F0] dark:bg-[#1E242B] rounded-lg shadow-2xl border border-[#D5D0C2] dark:border-[#2D3642] overflow-hidden cv-modal-window">
            
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[#D8D4C8] dark:border-[#29303A] bg-[#FBFAF6] dark:bg-[#1A1F26] cv-modal-header select-none">
              <div>
                <h2 id="cv-modal-heading" className="text-base sm:text-lg font-serif font-bold text-[#1C2128] dark:text-[#E9E6DE]">
                  {DATA.personal.name} — Curriculum Vitae
                </h2>
                <p className="text-[11px] font-sans text-[#4B5563] dark:text-[#9CA3AF]">
                  {DATA.personal.currentTitle} · {DATA.personal.institution}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintCv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-sans font-medium text-[#1C2128] dark:text-[#E9E6DE] bg-white dark:bg-[#252C36] border border-[#D8D4C8] dark:border-[#29303A] hover:bg-black/5 dark:hover:bg-white/5 shadow-xs transition-colors cursor-pointer"
                  title="Print or Save as PDF via native print dialog"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print / Save PDF</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleCvDownload(e)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-sans font-medium text-white bg-[#1F3A5F] dark:bg-[#20563F] hover:opacity-90 shadow-xs transition-opacity cursor-pointer"
                  title="Download A4 PDF document"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCvModalOpen(false)}
                  className="p-1.5 rounded text-[#4B5563] hover:text-[#1C2128] dark:text-[#9CA3AF] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                  aria-label="Close document viewer"
                  title="Close (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Document Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#EAE6DE] dark:bg-[#14181D]">
              <div className="max-w-[210mm] mx-auto bg-white text-[#1C2128] p-6 sm:p-10 md:p-14 rounded-xs shadow-lg border border-[#D5D0C2]">
                <CvDocument />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Full-Resolution Archival Faculty Portrait Lightbox Modal */}
      {isPhotoModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xs select-none"
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged faculty portrait of Assistant Professor Lila Dhar Bhatta"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsPhotoModalOpen(false);
          }}
        >
          <div className="relative max-w-sm sm:max-w-md w-full flex flex-col items-center">
            
            {/* Modal Controls Toolbar */}
            <div className="w-full flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => photoFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-sans font-medium text-white bg-white/20 hover:bg-white/30 rounded-full transition-colors cursor-pointer shadow-xs"
                  title="Upload a new profile picture from your device"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Picture</span>
                </button>

                {profileImage !== DEFAULT_PROFILE_IMAGE && (
                  <button
                    type="button"
                    onClick={handleResetProfilePhoto}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-sans font-medium text-red-200 bg-red-900/40 hover:bg-red-900/60 rounded-full transition-colors cursor-pointer border border-red-500/30 shadow-xs"
                    title="Reset to original uploaded photo"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-1.5 text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full transition-colors cursor-pointer"
                aria-label="Close portrait view"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Archival Polaroid Lightbox Presentation */}
            <div className="relative w-full bg-[#FAF8F3] dark:bg-[#1E242B] border border-[#DDD7C8] dark:border-[#2C3440] rounded-xs p-3.5 sm:p-4 pb-5 shadow-[0_25px_50px_rgba(0,0,0,0.6)]">
              <div className="relative aspect-[4/5] w-full rounded-2xs overflow-hidden bg-slate-900 shadow-inner">
                <img 
                  src={profileImage} 
                  alt="Assistant Professor Lila Dhar Bhatta - Faculty Profile Portrait" 
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="mt-3.5 flex items-center justify-between select-none">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-[0.22em] text-[#556987] dark:text-[#94A3B8] font-bold">
                    FACULTY SIGNATURE
                  </div>
                  <div className="font-hand text-2xl sm:text-3xl text-[#1E293B] dark:text-[#E2E8F0] tracking-wide leading-none mt-0.5">
                    Lila Dhar Bhatta
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-[#ECE7DA] dark:bg-[#2C3440] text-[#475569] dark:text-[#CBD5E1] text-[10px] px-2.5 py-0.5 rounded font-mono font-medium border border-[#DDD7C7] dark:border-[#384352]">
                    Sudurpaschim
                  </div>
                  <div className="text-[10px] font-sans text-slate-500 dark:text-slate-400 mt-1">
                    GMC Doti, Nepal
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 text-center text-xs font-sans text-slate-300">
              <span className="font-semibold text-white">Assistant Professor Lila Dhar Bhatta</span>
              <span className="mx-2 opacity-50">·</span>
              <span>Ghanteshwar Multiple Campus</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
