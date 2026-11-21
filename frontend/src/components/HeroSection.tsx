import { motion, useReducedMotion } from 'motion/react';
import { Sparkles, ArrowRight, Play, Check } from 'lucide-react';
import { HeroBoxComposition } from './illustrations/HeroBoxComposition';

interface HeroSectionProps {
  onGetStarted: () => void;
  onSeeHowItWorks: () => void;
}

export function HeroSection({ onGetStarted, onSeeHowItWorks }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden bg-white">
      {/* Soft background ambient gradient */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, Description & CTAs */}
          <div className="lg:col-span-6 space-y-7 text-left">
            {/* Eyebrow Pill Badge */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-xs font-semibold shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Your information, finally in one place</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold text-slate-900 tracking-tight leading-[1.05]"
            >
              Everything
              <br />
              important.
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                One place.
              </span>
            </motion.h1>

            {/* Subtitle Description */}
            <motion.p
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="text-base sm:text-lg text-slate-600 max-w-lg leading-relaxed"
            >
              Save anything — notes, screenshots, links, files and deadlines. Let AI organize it, so you can focus on what really matters.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-3.5 pt-1"
            >
              {/* Primary Get Started button */}
              <button
                onClick={onGetStarted}
                className="inline-flex items-center space-x-2.5 px-6 py-3.5 rounded-full text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg transition-all group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <span>Get started free</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Secondary See How it works button */}
              <button
                onClick={onSeeHowItWorks}
                className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-full text-sm font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-colors group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 group-hover:text-blue-600 group-hover:border-blue-400 transition-colors">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
                <span>See how it works</span>
              </button>
            </motion.div>

            {/* Trust checkmarks */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-2 text-xs font-medium text-slate-500"
            >
              <div className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-blue-600" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-blue-600" />
                <span>AI-powered organization</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Check className="w-3.5 h-3.5 text-blue-600" />
                <span>Works on all devices</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: 3D Open Box with Floating Cards Illustration */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* Ambient behind-box glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/20 via-indigo-300/15 to-purple-400/20 rounded-full blur-3xl pointer-events-none -z-10" />

            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg lg:max-w-xl mx-auto"
            >
              <HeroBoxComposition />
            </motion.div>
          </div>
        </div>

        {/* Social Proof Logo Ribbon matching reference image */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 sm:mt-24 pt-10 border-t border-slate-100/80 text-center"
        >
          <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-8">
            TRUSTED BY STUDENTS, CREATORS AND PROFESSIONALS
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-slate-500">
            {/* Notion */}
            <div className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.093-.373L17.848 1.97c-.466-.373-.933-.513-1.633-.466L3.619 2.53c-.373 0-.466.233-.326.373l1.166 1.305zm.56 3.125v13.574c0 .84.56 1.12 1.307 1.12l14.288-.793c.747 0 .934-.56.934-1.213V6.634c0-.653-.28-.933-.934-.886L5.952 6.54c-.653.047-.933.327-.933.793zm13.727.653c.093.42.093.84-.28.84h-.42l-2.006.14v8.91l2.566-.187c.374-.047.514.187.514.513v.373c0 .327-.233.42-.514.42l-4.57.28c-.28 0-.42-.093-.42-.42v-.373c0-.326.187-.513.56-.513l1.586-.093V8.873l-3.219 7.744h-.56l-3.267-7.697v6.857l1.726.14c.374.047.56.28.56.56v.373c0 .28-.186.42-.466.42l-4.244.28c-.28 0-.42-.093-.42-.42v-.373c0-.28.186-.467.56-.513l1.493-.094V8.36c0-.466-.233-.56-.746-.56l-1.353.093c-.327.047-.514-.14-.514-.42v-.373c0-.28.187-.42.467-.42l4.478-.28 3.593 8.35 3.172-8.35 4.385-.28c.327 0 .42.14.42.42v.373z"/>
              </svg>
              <span className="font-semibold text-sm">Notion</span>
            </div>

            {/* Google Drive */}
            <div className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 87.3 78" fill="none">
                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
              </svg>
              <span className="font-semibold text-sm">Google Drive</span>
            </div>

            {/* GitHub */}
            <div className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
              <span className="font-semibold text-sm">GitHub</span>
            </div>

            {/* Figma */}
            <div className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 38 57" fill="none">
                <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
                <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
                <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
                <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
                <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
              </svg>
              <span className="font-semibold text-sm">Figma</span>
            </div>

            {/* Discord */}
            <div className="flex items-center space-x-2 text-slate-700 hover:text-slate-900 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span className="font-semibold text-sm">Discord</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
