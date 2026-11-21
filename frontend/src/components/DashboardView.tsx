import { ArrowLeft, Home, Sparkles } from 'lucide-react';
import ProductWorkspace from './ProductWorkspace';

interface DashboardViewProps {
  onBackToWebsite: () => void;
}

export function DashboardView({ onBackToWebsite }: DashboardViewProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Standalone Dashboard Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToWebsite}
            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition cursor-pointer"
            title="Return to OneBox Website"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Website</span>
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center space-x-2">
            <img
              src="/onebox_logo.png"
              alt="OneBox"
              className="w-6 h-6 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo.png';
              }}
            />
            <span className="font-bold text-sm sm:text-base text-white tracking-tight">OneBox Dashboard</span>
            <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Full Workspace</span>
            </span>
          </div>
        </div>

        {/* Status badges & Back button */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Local-First SQLite</span>
            </span>
            <span>•</span>
            <span>Tesseract OCR & Gemini AI Active</span>
          </div>

          <button
            onClick={onBackToWebsite}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Landing Page</span>
          </button>
        </div>
      </header>

      {/* Main Content Area hosting the full interactive workspace */}
      <main className="flex-1 p-2 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <ProductWorkspace onBackToWebsite={onBackToWebsite} isStandalone={true} />
      </main>
    </div>
  );
}

export default DashboardView;
