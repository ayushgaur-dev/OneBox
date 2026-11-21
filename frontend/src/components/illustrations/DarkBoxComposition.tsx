import { motion, useReducedMotion } from 'motion/react';
import {
  Calendar,
  FileText,
  Link2,
  Check,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

export function DarkBoxComposition() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-full max-w-[480px] aspect-[4/3] mx-auto flex items-center justify-center select-none">
      {/* Ambient Neon Atmosphere */}
      <div className="absolute w-80 h-80 bg-gradient-to-tr from-blue-600/30 via-indigo-600/25 to-purple-600/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 w-72 h-16 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Floating Glowing Card 1: Top Deadline (Purple) */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [-3, 3, -3] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-2 right-24 z-20 bg-slate-900/90 border border-purple-500/50 shadow-xl shadow-purple-500/20 text-purple-200 rounded-2xl p-2.5 flex items-center space-x-2 backdrop-blur-md"
      >
        <div className="w-7 h-7 rounded-xl bg-purple-600/80 text-white flex items-center justify-center shadow-xs">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-white">Deadline</div>
          <div className="text-[9px] text-purple-300">15, 23 Apr</div>
        </div>
      </motion.div>

      {/* Floating Glowing Card 2: Top Left Notes (Cyan / Blue) */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [3, -4, 3] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        className="absolute top-8 left-10 z-20 bg-slate-900/90 border border-cyan-500/50 shadow-xl shadow-cyan-500/20 text-cyan-200 rounded-2xl p-2.5 flex items-center space-x-2 backdrop-blur-md"
      >
        <div className="w-7 h-7 rounded-xl bg-cyan-600/80 text-white flex items-center justify-center shadow-xs">
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-white">Notes</div>
          <div className="text-[9px] text-cyan-300">12 items</div>
        </div>
      </motion.div>

      {/* Floating Glowing Card 3: Top Right Link (Amber) */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [-2, 4, -2] }}
        transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        className="absolute top-16 right-4 z-20 bg-slate-900/90 border border-amber-500/50 shadow-xl shadow-amber-500/20 text-amber-200 rounded-2xl p-2.5 flex items-center space-x-2 backdrop-blur-md"
      >
        <div className="w-7 h-7 rounded-xl bg-amber-600/80 text-white flex items-center justify-center shadow-xs">
          <Link2 className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-white">Link</div>
          <div className="text-[9px] text-amber-300">saved link</div>
        </div>
      </motion.div>

      {/* Floating Glowing Card 4: Left Screenshot Polaroid */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [3, -3, 3] }}
        transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        className="absolute bottom-16 left-6 z-20 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-2 shadow-xl shadow-blue-500/10 backdrop-blur-md w-28"
      >
        <div className="h-14 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-1.5 flex items-end justify-between text-white">
          <ImageIcon className="w-3.5 h-3.5 opacity-90" />
          <span className="text-[8px] bg-black/40 px-1 rounded">OCR</span>
        </div>
        <div className="pt-1 px-0.5">
          <div className="text-[10px] font-bold text-slate-200 truncate">Screenshot</div>
          <div className="text-[8px] text-slate-400">Extracted</div>
        </div>
      </motion.div>

      {/* Floating Glowing Card 5: Right Files (Green check) */}
      <motion.div
        animate={shouldReduceMotion ? {} : { y: [-3, 3, -3] }}
        transition={{ duration: 5.7, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        className="absolute bottom-14 right-8 z-20 bg-slate-900/90 border border-emerald-500/50 shadow-xl shadow-emerald-500/20 rounded-2xl p-2.5 flex items-center space-x-2 backdrop-blur-md"
      >
        <div className="w-7 h-7 rounded-xl bg-emerald-600/80 text-white flex items-center justify-center shadow-xs">
          <Check className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[11px] font-bold text-white">Organized</div>
          <div className="text-[9px] text-emerald-300">In Inbox</div>
        </div>
      </motion.div>

      {/* Center 3D Glowing Box + Luminous Sheet */}
      <div className="relative z-10 w-56 sm:w-64 mt-6">
        {/* Luminous glowing white sheet sliding from the box */}
        <div className="relative -mb-14 z-0 flex justify-center">
          <div className="w-36 h-28 bg-white/95 rounded-t-2xl shadow-xl shadow-blue-400/20 border border-white/60 p-3 space-y-1.5 transform rotate-2">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <div className="w-14 h-1.5 rounded-full bg-slate-800" />
            </div>
            <div className="w-24 h-1 rounded-full bg-slate-200" />
            <div className="w-28 h-1 rounded-full bg-slate-200" />
            <div className="w-16 h-1 rounded-full bg-slate-200" />
          </div>
        </div>

        {/* 3D Dark Geometric Box SVG with Neon Edge Highlights */}
        <svg viewBox="0 0 320 240" className="w-full h-auto drop-shadow-[0_20px_35px_rgba(37,99,235,0.35)] overflow-visible">
          <defs>
            {/* Box Front Face Gradient (Dark Mode) */}
            <linearGradient id="darkBoxFront" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>

            {/* Box Left Side Gradient (Dark Mode) */}
            <linearGradient id="darkBoxLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            {/* Inner Glowing Cavity */}
            <radialGradient id="darkBoxCavity" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#2563EB" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0B132B" stopOpacity="1" />
            </radialGradient>

            {/* Flap Gradients */}
            <linearGradient id="darkFlapLeft" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="darkFlapRight" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>

          {/* Glowing Shadow beneath box */}
          <ellipse cx="160" cy="225" rx="110" ry="22" fill="#2563EB" opacity="0.3" filter="blur(8px)" />

          {/* Box Inner Background with Glowing Center */}
          <polygon points="60,95 160,55 260,95 160,135" fill="url(#darkBoxCavity)" />

          {/* Box Left Open Flap */}
          <polygon points="60,95 160,55 120,30 20,70" fill="url(#darkFlapLeft)" />

          {/* Box Right Open Flap */}
          <polygon points="160,55 260,95 300,70 200,30" fill="url(#darkFlapRight)" />

          {/* Box Left Exterior Side */}
          <polygon points="60,95 160,135 160,215 60,175" fill="url(#darkBoxLeft)" />

          {/* Box Right/Front Exterior Side */}
          <polygon points="160,135 260,95 260,175 160,215" fill="url(#darkBoxFront)" />

          {/* Box Front Open Flap (folded downward) */}
          <polygon points="160,135 60,95 70,120 160,155" fill="url(#darkFlapLeft)" opacity="0.9" />
          <polygon points="160,135 260,95 250,120 160,155" fill="url(#darkFlapRight)" opacity="0.9" />

          {/* Neon Edge Highlight Lines */}
          <line x1="60" y1="95" x2="160" y2="135" stroke="#93C5FD" strokeWidth="2" opacity="0.9" />
          <line x1="160" y1="135" x2="260" y2="95" stroke="#93C5FD" strokeWidth="2" opacity="0.9" />
          <line x1="160" y1="135" x2="160" y2="215" stroke="#60A5FA" strokeWidth="2" opacity="0.9" />
        </svg>
      </div>
    </div>
  );
}

export default DarkBoxComposition;
