import { ArrowUp, LayoutDashboard } from 'lucide-react';

interface FooterProps {
  onOpenDashboard?: () => void;
}

export default function Footer({ onOpenDashboard }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#070A11] text-slate-300 pt-16 pb-12 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4 text-left">
            <div className="flex items-center space-x-2.5">
              <img
                src="/onebox_logo.png"
                alt="OneBox Logo"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.png';
                }}
              />
              <span className="text-xl font-bold tracking-tight text-white">OneBox</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Everything important. One place. Capture notes, extract screenshots with local OCR, and intelligently organize with Gemini AI.
            </p>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900 text-xs text-emerald-400 border border-slate-800 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <button
                  onClick={() => scrollToSection('features')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('workspace-preview')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Workspace
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Pricing
                </button>
              </li>
            </ul>
          </div>

          {/* Architecture Stack */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Architecture</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>React 18 + TypeScript + Vite</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>FastAPI + Python Backend</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>SQLite + SQLAlchemy</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>Tesseract OCR + Pillow</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
                <span>Gemini 3.5 Flash Reasoning</span>
              </li>
            </ul>
          </div>

          {/* Direct Launch Button */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">OneBox App</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ready to organize your notes, tasks and screenshot clippings? Launch the standalone workspace.
            </p>
            {onOpenDashboard && (
              <button
                onClick={onOpenDashboard}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Launch Dashboard</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} OneBox. Everything important. One place. Local-first & Private.</p>
          <div className="flex items-center space-x-4">
            <span>Designed for focus</span>
            <button
              onClick={scrollToTop}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
              title="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
