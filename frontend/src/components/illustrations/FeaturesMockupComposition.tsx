import {
  Search,
  Bell,
  CheckCircle2,
  Calendar,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  Link2,
  Clock,
} from 'lucide-react';

export function FeaturesMockupComposition() {
  return (
    <div className="relative w-full max-w-xl mx-auto select-none">
      {/* Handwritten cursive annotation above mockup */}
      <div className="absolute -top-10 right-4 hidden sm:flex items-center space-x-2 text-indigo-600 z-20 pointer-events-none">
        <span className="font-handwriting text-2xl font-bold -rotate-6">
          Clean, focused and organized
        </span>
        <svg className="w-8 h-8 text-indigo-400 rotate-12" viewBox="0 0 50 50" fill="none">
          <path
            d="M10 15 C 20 25, 35 30, 42 38 M 35 42 L 44 38 L 40 28"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Main Browser Window Mockup with subtle perspective tilt */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-300/40 overflow-hidden transform lg:-rotate-1 lg:hover:rotate-0 transition-transform duration-500">
        {/* Browser Window Header */}
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          {/* Left: Window traffic lights + brand */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
            </div>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center space-x-1.5">
              <img
                src="/onebox_logo.png"
                alt="OneBox"
                className="w-4 h-4 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/logo.png';
                }}
              />
              <span className="text-xs font-bold text-slate-800 tracking-tight">OneBox</span>
            </div>
          </div>

          {/* Center: Search input simulation */}
          <div className="flex-1 max-w-xs mx-4 hidden sm:block">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                readOnly
                placeholder="Search everything you've saved..."
                className="w-full pl-8 pr-10 py-1.5 bg-white border border-slate-200 rounded-full text-[11px] text-slate-600 focus:outline-none shadow-2xs pointer-events-none"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                ⌘K
              </span>
            </div>
          </div>

          {/* Right: Notification bell + avatar */}
          <div className="flex items-center space-x-3">
            <div className="relative p-1 text-slate-400 hover:text-slate-600">
              <Bell className="w-4 h-4" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-blue-600" />
            </div>
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shadow-xs">
              A
            </div>
          </div>
        </div>

        {/* Dashboard Body Content */}
        <div className="p-5 sm:p-6 bg-gradient-to-b from-white to-slate-50/50 space-y-6">
          {/* Greeting Header */}
          <div className="flex items-center justify-between text-left">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-lg">☀️</span>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  Good morning, Ayush
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Here's what's important today.</p>
            </div>
          </div>

          {/* 3 Summary Stats Cards matching reference */}
          <div className="grid grid-cols-3 gap-3">
            {/* Card 1: 5 Upcoming tasks */}
            <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center space-x-2.5 text-left">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-base font-extrabold text-emerald-950 leading-tight">5</div>
                <div className="text-[10px] text-emerald-700 font-semibold truncate">Upcoming tasks</div>
              </div>
            </div>

            {/* Card 2: 3 Events this week */}
            <div className="p-3 rounded-2xl bg-rose-50/80 border border-rose-200/80 flex items-center space-x-2.5 text-left">
              <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-base font-extrabold text-rose-950 leading-tight">3</div>
                <div className="text-[10px] text-rose-700 font-semibold truncate">Events this week</div>
              </div>
            </div>

            {/* Card 3: 12 New items */}
            <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200/80 flex items-center space-x-2.5 text-left">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-base font-extrabold text-blue-950 leading-tight">12</div>
                <div className="text-[10px] text-blue-700 font-semibold truncate">New items</div>
              </div>
            </div>
          </div>

          {/* Two-Column Split: Recent items & Today Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-left">
            {/* Left: Recent items (7 cols) */}
            <div className="sm:col-span-7 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-800">Recent items</span>
                <span className="text-[10px] text-blue-600 font-semibold hover:underline cursor-pointer">View all</span>
              </div>

              {/* Item 1 */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">Machine Learning Notes</div>
                  <div className="text-[10px] text-slate-400 truncate">Extracted key points & summarized</div>
                </div>
                <div className="text-[10px] text-slate-400 flex-shrink-0">3h ago</div>
              </div>

              {/* Item 2 */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">Project Reference</div>
                  <div className="text-[10px] text-slate-400 truncate">Screenshot • Categorized in Projects</div>
                </div>
                <div className="text-[10px] text-slate-400 flex-shrink-0">4h ago</div>
              </div>

              {/* Item 3 */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">Research Paper</div>
                  <div className="text-[10px] text-slate-400 truncate">PDF • Added to University</div>
                </div>
                <div className="text-[10px] text-slate-400 flex-shrink-0">1d ago</div>
              </div>

              {/* Item 4 */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Link2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">Travel Plan</div>
                  <div className="text-[10px] text-slate-400 truncate">Link • Added to Travel</div>
                </div>
                <div className="text-[10px] text-slate-400 flex-shrink-0">2d ago</div>
              </div>
            </div>

            {/* Right: Today Checklist (5 cols) */}
            <div className="sm:col-span-5 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-800">Today</span>
                <span className="text-[10px] text-slate-400">4 tasks</span>
              </div>

              {/* Task 1 */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-start space-x-2.5">
                <div className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800 leading-tight">Finish AI project report</div>
                  <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Today, 5:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Task 2 */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-start space-x-2.5">
                <div className="w-4 h-4 rounded border-2 border-slate-300 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-700 leading-tight">Present presentation</div>
                  <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Today, 7:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Task 3 */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-start space-x-2.5">
                <div className="w-4 h-4 rounded border-2 border-slate-300 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-700 leading-tight">Read research paper</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Today</div>
                </div>
              </div>

              {/* Task 4 */}
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-start space-x-2.5">
                <div className="w-4 h-4 rounded border-2 border-slate-300 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-700 leading-tight">Gym</div>
                  <div className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Today, 8:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeaturesMockupComposition;
