import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  HelpCircle,
  ChevronDown,
  Sparkles,
  User,
  Layers,
  CreditCard,
  Shield,
  Wrench,
} from 'lucide-react';

export function FAQSection() {
  const [activeCategory, setActiveCategory] = useState<string>('General');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const shouldReduceMotion = useReducedMotion();

  const categories = [
    { label: 'General', icon: HelpCircle },
    { label: 'Account', icon: User },
    { label: 'Features', icon: Layers },
    { label: 'Billing', icon: CreditCard },
    { label: 'Privacy', icon: Shield },
    { label: 'Troubleshooting', icon: Wrench },
  ];

  const allFaqs: Record<string, { q: string; a: string }[]> = {
    General: [
      {
        q: 'What is OneBox?',
        a: 'OneBox is a personal information hub that combines quick text capture, screenshot OCR, and Gemini AI organization into a single searchable inbox with local SQLite storage.',
      },
      {
        q: 'How does AI organization work?',
        a: 'When you click "Organize with AI", our Gemini 3.5 Flash backend analyzes your text or screenshot. It extracts a title, assigns a category (NOTE, TASK, EVENT, DEADLINE, or OTHER), itemizes action steps, detects explicit dates, and creates an editable proposal for your review before saving.',
      },
      {
        q: 'Is my data safe?',
        a: 'Yes, 100%. OneBox uses a local SQLite database (onebox.db) on your machine. Your personal notes, files, and screenshots are never stored in third-party clouds or sold to advertisers.',
      },
      {
        q: 'Can I use OneBox on multiple devices?',
        a: 'The current OneBox build is optimized for desktop and local environments. Cloud sync and mobile companion apps are planned in our upcoming roadmap.',
      },
      {
        q: 'Is there a free plan?',
        a: 'Yes! The Core Community Edition is completely free forever. You can capture unlimited text notes, run local Tesseract OCR, and connect your own free Gemini API key.',
      },
      {
        q: 'Can I cancel my subscription anytime?',
        a: 'Yes, if you choose any optional future cloud tier, you can cancel at any moment with zero penalty or locked data.',
      },
      {
        q: 'Do you offer a student discount?',
        a: 'Yes, verified students receive a 50% discount on all planned cloud services and higher API quota tiers.',
      },
      {
        q: 'How do I contact support?',
        a: 'You can open an issue on our GitHub repository or contact our developer community directly through the OneBox portal.',
      },
    ],
    Account: [
      {
        q: 'Do I need an account to use OneBox?',
        a: 'No! The local OneBox application works straight out of the box without registration. You can start creating notes immediately.',
      },
      {
        q: 'Can I export my data?',
        a: 'Yes, your database is standard SQLite (onebox.db), so you can export or inspect your notes anytime via SQL, JSON, or CSV.',
      },
    ],
    Features: [
      {
        q: 'What formats can I upload for OCR?',
        a: 'OneBox supports PNG, JPG, JPEG, and WebP images. You can also paste directly from your clipboard using Ctrl+V.',
      },
      {
        q: 'Can I edit the AI suggestions before saving?',
        a: 'Yes! OneBox is built with human-in-the-loop control. You can edit the AI-proposed title, summary, action items, dates, or category before committing it to your inbox.',
      },
    ],
    Billing: [
      {
        q: 'Are there hidden fees?',
        a: 'No hidden fees. The local app is free and uses your own local system resources.',
      },
      {
        q: 'What currencies do you support?',
        a: 'We support INR (₹), USD ($), EUR (€), and GBP (£).',
      },
    ],
    Privacy: [
      {
        q: 'Are my screenshots saved permanently on the server?',
        a: 'No. Screenshots are processed in temporary memory for Tesseract OCR extraction and are immediately discarded. We never save raw images on disk.',
      },
      {
        q: 'Does Google train on my data with Gemini?',
        a: 'When using API keys via the official Google GenAI SDK, your prompts are subject to standard developer API privacy terms without training on your private customer data.',
      },
    ],
    Troubleshooting: [
      {
        q: 'What if Tesseract OCR is not detected?',
        a: 'Ensure Tesseract is installed in C:\\Program Files\\Tesseract-OCR\\tesseract.exe or set the TESSERACT_PATH environment variable in your backend environment.',
      },
      {
        q: 'What if the AI status says "No Key"?',
        a: 'Set your GEMINI_API_KEY in backend/.env or your system environment variables. The backend will automatically detect it and enable Gemini 3.5 Flash.',
      },
    ],
  };

  const currentFaqs = allFaqs[activeCategory] || allFaqs['General'];

  return (
    <section id="faq" className="scroll-mt-20 py-20 sm:py-28 bg-[#090D16] text-white relative overflow-hidden border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FAQ</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Got questions?{' '}
            <span className="block mt-1 bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              We've got answers.
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Find answers to common questions about OneBox, OCR extraction, local data, and Gemini AI.
          </p>
        </motion.div>

        {/* Split Layout: Categories (Left) + Accordion (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-start">
          {/* Left: Category Filter List */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 bg-slate-900/90 p-4 rounded-3xl border border-slate-800 space-y-1.5"
            role="tablist"
            aria-label="FAQ Help Categories"
          >
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-2 text-left">
              Help Categories
            </p>
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setActiveCategory(cat.label);
                    setOpenIndex(0);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs border border-blue-500'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </motion.div>

          {/* Right: Accordion Items */}
          <div className="lg:col-span-8 space-y-3">
            {currentFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <motion.div
                  key={`${activeCategory}-${idx}`}
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: shouldReduceMotion ? 0 : Math.min(idx * 0.05, 0.2),
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:border-slate-700 transition-colors"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${idx}`}
                    className="w-full px-6 py-4 sm:py-5 text-left flex items-center justify-between gap-4 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <span className="text-sm sm:text-base font-bold text-white">{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-blue-400' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${idx}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.25,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800 text-left">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
