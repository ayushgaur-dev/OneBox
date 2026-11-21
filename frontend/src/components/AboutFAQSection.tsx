import { useState } from 'react';
import { ChevronDown, Sparkles, HelpCircle, ShieldCheck, Cpu, Database } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function AboutFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      category: 'OCR Engine',
      question: 'How does screenshot OCR work in OneBox?',
      answer:
        'OneBox runs Tesseract OCR locally on your backend server via pytesseract and Pillow. When you upload or paste a screenshot (PNG, JPG, or WebP), it processes the image in memory and converts visual text into editable characters in fractions of a second without sending your screenshot to third-party image hosts.',
    },
    {
      category: 'Gemini AI',
      question: 'What does the Gemini AI integration do?',
      answer:
        'Powered by the official Google GenAI SDK and Gemini 3.5 Flash, the "Organize with AI" feature analyzes unstructured notes or OCR text. It extracts a crisp title, assigns an accurate category (NOTE, TASK, EVENT, DEADLINE, or OTHER), itemizes actionable to-dos, detects explicit dates, and flags ambiguities so you can clarify them before saving.',
    },
    {
      category: 'Data & Privacy',
      question: 'Where is my data stored?',
      answer:
        'All your notes, tasks, events, and deadlines are saved directly into a local SQLite database (onebox.db) on your machine using SQLAlchemy. Data persists reliably across restarts and page refreshes, and never leaves your computer unless you explicitly configure remote backups.',
    },
    {
      category: 'Pricing & Keys',
      question: 'Do I need a paid API key to use OneBox?',
      answer:
        'No. OneBox is completely free. Text capture, search, category filtering, and Tesseract OCR work 100% offline and locally. For the optional Gemini AI feature, you can use your own free Google Gemini API key configured in the backend environment.',
    },
    {
      category: 'Human Control',
      question: 'Can I edit the AI-generated proposals before saving?',
      answer:
        'Absolutely. OneBox enforces human-in-the-loop control. Gemini AI never writes directly into your database. Instead, it presents an editable proposal card where you can change the title, modify action items, add or remove date chips, edit the summary, or reject the proposal entirely.',
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="about" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* About Part */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pb-20 border-b border-slate-200">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider">
              <span>About OneBox</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Built to end the chaos of scattered thoughts & screenshot graveyards.
            </h2>
            <p className="text-base text-slate-600 leading-relaxed">
              We all take screenshots of slides, error messages, and interesting articles with the best intention to review them later. Instead, they vanish into bloated folders, forgotten and unsearchable.
            </p>
            <p className="text-base text-slate-600 leading-relaxed">
              OneBox eliminates this friction by giving you a unified inbox. Dump raw text, paste screenshots, run local OCR, and let Gemini AI summarize and extract to-dos. Clean, fast, and 100% under your control.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2 text-blue-600 mb-1">
                  <Database className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Storage</span>
                </div>
                <p className="text-lg font-bold text-slate-900">SQLite</p>
                <p className="text-xs text-slate-500">Persistent & local</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2 text-purple-600 mb-1">
                  <Cpu className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">OCR</span>
                </div>
                <p className="text-lg font-bold text-slate-900">Tesseract</p>
                <p className="text-xs text-slate-500">Fast local engine</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2 text-indigo-600 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">AI</span>
                </div>
                <p className="text-lg font-bold text-slate-900">Gemini 3.5</p>
                <p className="text-xs text-slate-500">Structured logic</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-gradient-to-tr from-slate-900 to-indigo-950 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">Our Core Philosophy</h3>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start space-x-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                  <span>
                    <strong>Zero Bloat:</strong> No 50-step onboarding, no endless nested folders, and no proprietary lock-ins.
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                  <span>
                    <strong>Human-in-the-Loop AI:</strong> AI serves as your cognitive assistant, not an autonomous editor that silently mutates your inbox.
                  </span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <span>
                    <strong>Speed & Privacy:</strong> Fast queries on SQLite, lightweight memory footprint, and complete ownership of your personal notes.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Accordion Part */}
        <div className="pt-20">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Got Questions?</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Everything you need to know about OneBox architecture, OCR, AI integration, and privacy.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 hover:border-slate-300"
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                        {faq.category}
                      </span>
                      <span className="text-base font-semibold text-slate-900">
                        {faq.question}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
