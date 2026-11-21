import { motion, useReducedMotion } from 'motion/react';
import {
  Check,
  Calendar,
  Link2,
  FileText,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

export function HeroBoxComposition() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-full max-w-[540px] aspect-[4/3.5] mx-auto flex items-center justify-center select-none">
      {/* Multi-layered soft ambient glows */}
      <div className="absolute w-72 h-72 bg-gradient-to-tr from-blue-400/25 via-indigo-400/20 to-purple-400/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-6 w-80 h-16 bg-blue-900/10 rounded-full blur-2xl pointer-events-none" />

      {/* Cursive Annotations matching reference */}
      <div className="absolute top-2 left-6 text-indigo-600 font-handwriting text-2xl font-bold -rotate-12 pointer-events-none z-30 flex items-center space-x-1">
        <span>Notes</span>
        <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 40 40" fill="none">
          <path d="M5 15 C 15 20, 25 22, 32 30 M 24 30 L 32 30 L 30 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="absolute top-0 right-24 text-indigo-600 font-handwriting text-2xl font-bold rotate-6 pointer-events-none z-30 flex items-center space-x-1">
        <span>Deadlines</span>
        <svg className="w-5 h-5 text-indigo-400 rotate-45" viewBox="0 0 40 40" fill="none">
          <path d="M5 25 C 15 20, 22 15, 30 8 M 22 8 L 30 8 L 30 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="absolute top-24 -right-2 text-indigo-600 font-handwriting text-2xl font-bold rotate-12 pointer-events-none z-30 flex items-center space-x-1">
        <span>Links</span>
        <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 40 40" fill="none">
          <path d="M8 8 C 15 15, 20 22, 28 28 M 20 28 L 28 28 L 28 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      <div className="absolute bottom-16 -right-3 text-indigo-600 font-handwriting text-2xl font-bold -rotate-6 pointer-events-none z-30">
        <span>Files</span>
      </div>

      <div className="absolute bottom-3 left-4 text-indigo-600 font-handwriting text-2xl font-bold -rotate-6 pointer-events-none z-30 flex items-center space-x-2">
        <span>All your information</span>
        <svg className="w-8 h-8 text-indigo-400 rotate-12" viewBox="0 0 50 50" fill="none">
          <path d="M8 12 C 18 20, 32 25, 42 22 M 34 16 L 43 22 L 38 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Floating Card 1: To-do (5 items) [Green] */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [-3, 3, -3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-8 left-16 z-20 bg-gradient-to-br from-emerald-100 to-emerald-200/90 text-emerald-900 border border-emerald-300/80 rounded-2xl p-3 shadow-lg shadow-emerald-500/10 flex items-center space-x-2.5 backdrop-blur-md"
      >
        <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
          <Check className="w-4 h-4 stroke-[2.5]" />
        </div>
        <div>
          <div className="text-xs font-bold leading-tight">To-do</div>
          <div className="text-[10px] text-emerald-700 font-medium">5 items</div>
        </div>
      </motion.div>

      {/* Floating Card 2: Deadline (15, 23 Apr) [Purple] */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [3, -4, 3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        className="absolute top-3 right-36 z-20 bg-gradient-to-br from-purple-100 to-indigo-100/90 text-purple-900 border border-purple-300/80 rounded-2xl p-3 shadow-lg shadow-purple-500/10 flex items-center space-x-2.5 backdrop-blur-md"
      >
        <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold leading-tight">Deadline</div>
          <div className="text-[10px] text-purple-700 font-medium">15, 23 Apr</div>
        </div>
      </motion.div>

      {/* Floating Card 3: Link (Orange) */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [-2, 4, -2] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        className="absolute top-20 right-8 z-20 bg-gradient-to-br from-amber-100 to-orange-100/90 text-amber-950 border border-amber-300/80 rounded-2xl p-3 shadow-lg shadow-amber-500/10 flex items-center space-x-2.5 backdrop-blur-md"
      >
        <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
          <Link2 className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold leading-tight">Link</div>
          <div className="text-[10px] text-amber-800 font-medium truncate max-w-[90px]">medium.com/ai</div>
        </div>
      </motion.div>

      {/* Floating Card 4: Screenshot Polaroid (Left) */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [3, -3, 3] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        className="absolute bottom-28 left-8 z-20 bg-white/95 border border-slate-200/90 rounded-2xl p-2 shadow-xl shadow-slate-400/10 backdrop-blur-md w-32"
      >
        <div className="h-16 rounded-xl bg-gradient-to-tr from-sky-400 via-indigo-400 to-purple-500 p-2 flex items-end justify-between text-white relative overflow-hidden">
          <div className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-white/40" />
          <ImageIcon className="w-4 h-4 opacity-80" />
        </div>
        <div className="pt-1.5 px-0.5">
          <div className="text-[11px] font-bold text-slate-800 truncate">Screenshot</div>
          <div className="text-[9px] text-slate-400">image 24 • PNG</div>
        </div>
      </motion.div>

      {/* Floating Card 5: Files (Right) */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [-3, 3, -3] }}
        transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute bottom-24 right-6 z-20 bg-white/95 border border-slate-200/90 rounded-2xl p-3 shadow-xl shadow-slate-400/10 flex items-center space-x-2.5 backdrop-blur-md"
      >
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-800">Lecture.pdf</div>
          <div className="text-[10px] text-slate-400">2.4 MB</div>
        </div>
      </motion.div>

      {/* Center 3D Isometric Blue Box + Paper Sheets */}
      <div className="relative z-10 w-64 sm:w-72 mt-8">
        {/* White sheets coming out of the box */}
        <div className="relative -mb-16 z-0 flex justify-center">
          <div className="w-44 h-32 bg-white rounded-t-2xl shadow-md border border-slate-200 p-3.5 space-y-2 transform -rotate-3 translate-x-3">
            <div className="w-12 h-2 rounded-full bg-blue-600/30" />
            <div className="w-32 h-1.5 rounded-full bg-slate-200" />
            <div className="w-24 h-1.5 rounded-full bg-slate-200" />
            <div className="w-28 h-1.5 rounded-full bg-slate-200" />
          </div>
          <div className="absolute top-2 w-44 h-32 bg-white/90 rounded-t-2xl shadow-lg border border-slate-200/90 p-3.5 space-y-2 transform rotate-2">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <div className="w-16 h-2 rounded-full bg-slate-800" />
            </div>
            <div className="w-32 h-1.5 rounded-full bg-slate-200" />
            <div className="w-36 h-1.5 rounded-full bg-slate-200" />
            <div className="w-20 h-1.5 rounded-full bg-slate-200" />
          </div>
        </div>

        {/* 3D Geometric Box SVG with Rich Lighting */}
        <svg viewBox="0 0 320 240" className="w-full h-auto drop-shadow-2xl overflow-visible">
          <defs>
            {/* Box Front Face Gradient */}
            <linearGradient id="boxFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>

            {/* Box Left Side Gradient */}
            <linearGradient id="boxLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E40AF" />
              <stop offset="100%" stopColor="#172554" />
            </linearGradient>

            {/* Box Inner Dark Cavity */}
            <linearGradient id="boxInside" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>

            {/* Flap Gradients */}
            <linearGradient id="flapLeft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="flapRight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id="flapFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>

          {/* Shadow beneath box */}
          <ellipse cx="160" cy="225" rx="110" ry="22" fill="#0F172A" opacity="0.25" filter="blur(6px)" />

          {/* Box Inner Background */}
          <polygon points="60,95 160,55 260,95 160,135" fill="url(#boxInside)" />

          {/* Box Left Open Flap */}
          <polygon points="60,95 160,55 120,30 20,70" fill="url(#flapLeft)" />

          {/* Box Right Open Flap */}
          <polygon points="160,55 260,95 300,70 200,30" fill="url(#flapRight)" />

          {/* Box Left Exterior Side */}
          <polygon points="60,95 160,135 160,215 60,175" fill="url(#boxLeft)" />

          {/* Box Right/Front Exterior Side */}
          <polygon points="160,135 260,95 260,175 160,215" fill="url(#boxFront)" />

          {/* Box Front Open Flap (folded downward) */}
          <polygon points="160,135 60,95 70,120 160,155" fill="url(#flapFront)" opacity="0.9" />
          <polygon points="160,135 260,95 250,120 160,155" fill="url(#flapRight)" opacity="0.9" />

          {/* Box Center seam / highlight line */}
          <line x1="160" y1="135" x2="160" y2="215" stroke="#60A5FA" strokeWidth="1.5" opacity="0.6" />
        </svg>
      </div>
    </div>
  );
}

export default HeroBoxComposition;
