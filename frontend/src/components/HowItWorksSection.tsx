import { motion, useReducedMotion } from 'motion/react';
import { Sparkles, ArrowRight, FileText, Bot, Layers, Smartphone } from 'lucide-react';
import { DarkBoxComposition } from './illustrations/DarkBoxComposition';

interface HowItWorksSectionProps {
  onExploreWorkspace?: () => void;
}

export function HowItWorksSection({ onExploreWorkspace }: HowItWorksSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  const steps = [
    {
      num: 1,
      title: 'Capture',
      desc: 'Save notes, screenshots, links, files or just ideas.',
      icon: FileText,
      iconColor: 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30',
    },
    {
      num: 2,
      title: 'AI understands',
      desc: 'Extracts key information, categorizes and organizes it intelligently.',
      icon: Bot,
      iconColor: 'bg-purple-600/30 text-purple-300 border border-purple-500/30',
    },
    {
      num: 3,
      title: 'Organize',
      desc: 'Access everything in a clean workspace — notes, tasks, events and collections.',
      icon: Layers,
      iconColor: 'bg-blue-600/30 text-blue-300 border border-blue-500/30',
    },
    {
      num: 4,
      title: 'Access anywhere',
      desc: 'Find your information on any device. Always in sync.',
      icon: Smartphone,
      iconColor: 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/30',
    },
  ];

  return (
    <section id="how-it-works" className="relative bg-[#090D16] text-white overflow-hidden scroll-mt-20">
      {/* Top Organic Curving Dark Wave Divider */}
      <div className="w-full overflow-hidden leading-none -translate-y-1 bg-white">
        <svg
          viewBox="0 0 1440 180"
          className="w-full h-auto text-[#090D16] block"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path d="M0,0 C320,130 680,180 1440,70 L1440,180 L0,180 Z" />
        </svg>
      </div>

      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-24 sm:pb-32 relative z-10">
        {/* Top Split: Headline & CTA (Left) + Dark 3D Box Illustration (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center mb-20 sm:mb-28">
          {/* Left: Headline & Description */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>HOW IT WORKS</span>
            </motion.div>

            <motion.h2
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-white"
            >
              From chaos
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                to clarity.
              </span>
            </motion.h2>

            <motion.p
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-lg text-slate-400 max-w-md leading-relaxed"
            >
              Save anything. Let AI understand it. Stay organized. Never lose track.
            </motion.p>

            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="pt-2"
            >
              <button
                onClick={onExploreWorkspace}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-full text-sm font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20 backdrop-blur-md shadow-sm transition group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                <span>See how it works</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          </div>

          {/* Right: Dark Glowing 3D Open Box artwork */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md mx-auto"
            >
              <DarkBoxComposition />
            </motion.div>
          </div>
        </div>

        {/* 4-Step Horizontal Process Row */}
        <div className="relative pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.45,
                    delay: shouldReduceMotion ? 0 : idx * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex flex-col items-start relative text-left"
                >
                  {/* Step Icon Badge */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${step.iconColor}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Step Number & Title */}
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center space-x-1.5">
                    <span className="text-blue-400 font-extrabold">{step.num}</span>
                    <span>{step.title}</span>
                  </h3>

                  {/* Step Description */}
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xs">
                    {step.desc}
                  </p>

                  {/* Dotted connector arrow (desktop only, between steps) */}
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute top-6 -right-4 w-8 border-t-2 border-dotted border-slate-700/80 pointer-events-none" />
                  )}

                  {/* Handwritten note pointing to step 4 */}
                  {step.num === 4 && (
                    <div className="hidden lg:flex items-center space-x-2 text-indigo-400 absolute -bottom-10 left-0 pointer-events-none">
                      <span className="font-handwriting text-xl font-bold -rotate-6">
                        Designed for focus
                      </span>
                      <svg className="w-6 h-6 -rotate-12" viewBox="0 0 50 50" fill="none">
                        <path
                          d="M5 25 C 18 12, 35 15, 45 28 M 38 18 L 46 29 L 34 32"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;
