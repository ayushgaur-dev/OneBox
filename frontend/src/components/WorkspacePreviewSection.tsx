import { motion, useReducedMotion } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  FolderSync,
  Search,
  Layout,
  SunMoon,
  Smartphone,
} from 'lucide-react';
import { DarkWorkspaceMockup } from './illustrations/DarkWorkspaceMockup';

interface WorkspacePreviewSectionProps {
  onOpenDashboard: () => void;
}

export function WorkspacePreviewSection({ onOpenDashboard }: WorkspacePreviewSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  const benefits = [
    { text: 'Smart collections and automatic tagging', icon: FolderSync },
    { text: 'Instant search across all content', icon: Search },
    { text: 'Beautiful and minimal interface', icon: Layout },
    { text: 'Dark and light mode', icon: SunMoon },
    { text: 'Works on web, desktop and mobile', icon: Smartphone },
  ];

  return (
    <section id="workspace-preview" className="py-20 sm:py-28 bg-[#090D16] text-white relative overflow-hidden scroll-mt-20">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          {/* Left Column: Pixel-Perfect Dark UI Mockup */}
          <div className="lg:col-span-7 relative flex items-center justify-center">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xl mx-auto"
            >
              <DarkWorkspaceMockup />
            </motion.div>
          </div>

          {/* Right Column: Copy & Bullet List */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>YOUR WORKSPACE</span>
            </motion.div>

            <motion.h2
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white"
            >
              Everything
              <br />
              you <span className="text-blue-500">save,</span> beautifully
              <br />
              organized.
            </motion.h2>

            <motion.p
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="text-base text-slate-400 leading-relaxed max-w-md"
            >
              A clean, powerful workspace to manage all your notes, files, links, tasks and more — with AI by your side.
            </motion.p>

            {/* 5 Bullet Points with Crisp Icons */}
            <div className="space-y-3.5 pt-2">
              {benefits.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.4,
                      delay: shouldReduceMotion ? 0 : idx * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="flex items-center space-x-3 text-sm text-slate-300"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">{item.text}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* Direct Button */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="pt-4"
            >
              <button
                onClick={onOpenDashboard}
                className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-full text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WorkspacePreviewSection;
