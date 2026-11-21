import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Search, Sparkles, Clock, ArrowRight } from 'lucide-react';

export function ResourcesSection() {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const shouldReduceMotion = useReducedMotion();

  const tags = ['All', 'Productivity', 'AI', 'Student Life', 'Workflows'];

  const articles = [
    {
      id: 1,
      title: '10 Ways to Stay Organized as a Student',
      tag: 'Productivity',
      time: '5 min read',
      bgGradient: 'from-blue-600 to-indigo-700',
      summary: 'Practical frameworks to balance lectures, coursework, assignments, and exams using unified capture.',
    },
    {
      id: 2,
      title: 'How AI Can Help You Remember What Matters',
      tag: 'AI',
      time: '4 min read',
      bgGradient: 'from-purple-600 to-indigo-600',
      summary: 'Why cognitive offloading to local OCR and Gemini AI transforms noisy screenshots into structured to-dos.',
    },
    {
      id: 3,
      title: 'My OneBox Setup for College',
      tag: 'Workflows',
      time: '6 min read',
      bgGradient: 'from-emerald-600 to-teal-700',
      summary: 'A step-by-step walkthrough of organizing syllabus PDFs, class notes, and deadline reminders.',
    },
    {
      id: 4,
      title: 'From Screenshots to Insights: A Smarter Workflow',
      tag: 'Productivity',
      time: '4 min read',
      bgGradient: 'from-amber-500 to-rose-600',
      summary: 'How Tesseract OCR turns images of slides, whiteboard diagrams, and code snippets into searchable text.',
    },
    {
      id: 5,
      title: 'Digital Minimalism in 2025',
      tag: 'Productivity',
      time: '8 min read',
      bgGradient: 'from-slate-700 to-slate-900',
      summary: 'Cutting digital noise: why keeping one searchable inbox beats maintaining 15 fragmented bookmark folders.',
    },
    {
      id: 6,
      title: "What's New in OneBox",
      tag: 'AI',
      time: '3 min read',
      bgGradient: 'from-indigo-600 to-pink-600',
      summary: 'Exploring our Gemini 3.5 Flash structured reasoning engine, keyboard shortcuts, and faster SQLite indexes.',
    },
  ];

  const filteredArticles = articles.filter((a) => {
    if (selectedTag !== 'All' && a.tag !== selectedTag) return false;
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <section id="resources" className="scroll-mt-20 py-20 sm:py-28 bg-[#090D16] text-white relative overflow-hidden border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RESOURCES & BLOG</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Tips, ideas and stories{' '}
            <span className="block mt-1 bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              to help you stay organized.
            </span>
          </h2>

          {/* Search bar & Tag filter pills */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-2xl mx-auto">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div className="flex items-center flex-wrap justify-center gap-1.5" role="tablist" aria-label="Filter articles by tag">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  role="tab"
                  aria-selected={selectedTag === tag}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 6 Article Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {filteredArticles.map((article, idx) => (
            <motion.div
              key={article.id}
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.45,
                delay: shouldReduceMotion ? 0 : Math.min(idx * 0.08, 0.3),
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={shouldReduceMotion ? {} : { y: -3 }}
              className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800/90 shadow-lg hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              {/* Top Banner Artwork */}
              <div
                className={`h-40 w-full bg-gradient-to-tr ${article.bgGradient} p-5 flex flex-col justify-between text-white relative overflow-hidden`}
              >
                <div className="flex items-center justify-between z-10">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/30 backdrop-blur-md text-[11px] font-bold uppercase tracking-wider">
                    {article.tag}
                  </span>
                  <div className="flex items-center space-x-1 text-[11px] text-white/90">
                    <Clock className="w-3 h-3" />
                    <span>{article.time}</span>
                  </div>
                </div>

                <div className="z-10">
                  <p className="text-xs text-white/80 font-medium">OneBox Insights</p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between text-left">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {article.summary}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-blue-400 font-semibold">
                  <span>Read full guide</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ResourcesSection;
