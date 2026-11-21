import { motion, useReducedMotion } from 'motion/react';
import { Sparkles, FileText, Search, Calendar, Smartphone } from 'lucide-react';
import { FeaturesMockupComposition } from './illustrations/FeaturesMockupComposition';

export function FeaturesSection() {
  const shouldReduceMotion = useReducedMotion();

  const features = [
    {
      id: 1,
      title: 'Smart Capture',
      desc: 'Save anything, from everywhere.',
      icon: FileText,
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      id: 2,
      title: 'AI Organization',
      desc: 'Automatically understand and sort.',
      icon: Sparkles,
      iconBg: 'bg-purple-50 text-purple-600',
    },
    {
      id: 3,
      title: 'Universal Search',
      desc: 'Find anything instantly.',
      icon: Search,
      iconBg: 'bg-sky-50 text-sky-600',
    },
    {
      id: 4,
      title: 'Tasks & Reminders',
      desc: 'Never miss what matters.',
      icon: Calendar,
      iconBg: 'bg-rose-50 text-rose-500',
    },
    {
      id: 5,
      title: 'Cross-device Sync',
      desc: 'Access your OneBox anywhere.',
      icon: Smartphone,
      iconBg: 'bg-indigo-50 text-indigo-600',
    },
  ];

  return (
    <section id="features" className="scroll-mt-20 py-20 sm:py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading, description & 5 Feature Cards */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div>
              {/* Eyebrow badge */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>FEATURES</span>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight"
              >
                A smarter way to keep everything.
              </motion.h2>

              {/* Subtitle */}
              <motion.p
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="mt-4 text-base text-slate-600 leading-relaxed max-w-md"
              >
                OneBox combines AI with a clean, intuitive workspace to help you capture, organize and find your information instantly.
              </motion.p>
            </div>

            {/* 5 Features List matching reference */}
            <div className="space-y-4 pt-2">
              {features.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                      duration: 0.4,
                      delay: shouldReduceMotion ? 0 : idx * 0.08,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="flex items-center space-x-4 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-default group"
                  >
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs ${item.iconBg}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right Column: 3D perspective dashboard mockup with handwritten note */}
          <div className="lg:col-span-7 relative flex items-center justify-center">
            {/* Ambient soft glow behind mockup */}
            <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xl mx-auto"
            >
              <FeaturesMockupComposition />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
