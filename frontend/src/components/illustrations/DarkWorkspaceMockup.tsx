import { useState } from 'react';
import {
  Search,
  Bell,
  Plus,
  FileText,
  Image as ImageIcon,
  Link2,
  Calendar,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

export function DarkWorkspaceMockup() {
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'Notes', 'Files', 'Links', 'Images', 'Tasks'];

  const workspaceCards = [
    {
      id: 1,
      title: 'Lecture Notes',
      meta: '12 items',
      icon: FileText,
      iconColor: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
      badge: 'Notes',
    },
    {
      id: 2,
      title: 'Research Paper',
      meta: 'PDF • 2.4 MB',
      icon: FileText,
      iconColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      badge: 'PDF',
    },
    {
      id: 3,
      title: 'Design Reference',
      meta: 'Image • 1.2 MB',
      icon: ImageIcon,
      iconColor: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      badge: 'Image',
    },
    {
      id: 4,
      title: 'Trip Planning',
      meta: '5 items',
      icon: Calendar,
      iconColor: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      badge: 'Events',
    },
    {
      id: 5,
      title: 'Useful Links',
      meta: '8 links',
      icon: Link2,
      iconColor: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
      badge: 'Links',
    },
    {
      id: 6,
      title: 'Project Ideas',
      meta: '3 items',
      icon: Lightbulb,
      iconColor: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      badge: 'Ideas',
    },
  ];

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/90 backdrop-blur-md select-none text-left">
      {/* Window Titlebar */}
      <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800/90 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          </div>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">onebox://workspace</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative text-slate-400">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
          </div>
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center">
            A
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-5 sm:p-6 bg-[#0B0F19] space-y-5">
        {/* Top Search bar + +New button */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              readOnly
              placeholder="Search everything you've saved..."
              className="w-full pl-9 pr-10 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 placeholder-slate-500 focus:outline-none pointer-events-none"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
              ⌘K
            </span>
          </div>

          <button
            type="button"
            className="px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex-shrink-0 ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 6 Grid Cards matching reference image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {workspaceCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-2xs ${card.iconColor}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                      {card.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">{card.meta}</p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DarkWorkspaceMockup;
