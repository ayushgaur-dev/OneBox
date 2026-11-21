import { Target, Eye, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

export function AboutSection() {
  const shouldReduceMotion = useReducedMotion();

  const transitionConfig = {
    duration: 0.5,
    ease: [0.25, 0.1, 0.25, 1.0] as const,
  };

  return (
    <section id="about" className="scroll-mt-20 py-20 sm:py-28 bg-[#090D16] text-white relative overflow-hidden border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={transitionConfig}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ABOUT US</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Built for people{' '}
            <span className="block mt-1 bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              who never want to lose track.
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            OneBox started as a personal need — a way to keep all kinds of information in one place, without the clutter. Today, we're building it for everyone who juggles notes, tasks, files and ideas, and wants a simpler, smarter way to stay organized.
          </p>
        </motion.div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
          {/* Left Visual Card */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ ...transitionConfig, delay: 0.05 }}
            className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden min-h-[400px] flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-snug">
                Good ideas
                <br />
                deserve
                <br />
                a better home.
              </h3>
            </div>

            <div className="relative z-10 pt-10">
              <p className="text-sm text-slate-300 leading-relaxed max-w-md">
                We believe that staying organized shouldn't feel like a chore. OneBox gives your thoughts, tasks, and clippings a calm, searchable home powered by local OCR and AI reasoning.
              </p>
              <div className="mt-6 flex items-center space-x-3">
                <span className="h-1.5 w-12 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Local-first & Private
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right: 3 Values Pillars */}
          <div className="lg:col-span-6 space-y-4">
            {/* 1. Mission */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ ...transitionConfig, delay: 0.1 }}
              className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 hover:border-slate-700 transition"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Our Mission</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    To eliminate the cognitive friction of information capture. Take notes, drag screenshots, or dump quick ideas — OneBox handles the sorting.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 2. Vision */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ ...transitionConfig, delay: 0.15 }}
              className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 hover:border-slate-700 transition"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Our Vision</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    A world where productivity software works silently in the background, keeping humans in control with transparent AI assistance.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 3. Values */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ ...transitionConfig, delay: 0.2 }}
              className="bg-slate-900/80 border border-slate-800/90 rounded-2xl p-6 hover:border-slate-700 transition"
            >
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Privacy & Speed</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Zero lock-in. Your data resides in local SQLite. OCR runs on-device, and AI structured output is always reviewable before saving.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
