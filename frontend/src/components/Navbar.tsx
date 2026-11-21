import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Menu, X, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  onOpenDashboard: () => void;
  onOpenAuth: () => void;
}

export function Navbar({ onOpenDashboard, onOpenAuth }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 border-b border-slate-200/90 shadow-2xs py-0'
          : 'bg-white/80 border-b border-transparent py-1'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer group focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none rounded-lg p-1"
            tabIndex={0}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <img
              src="/onebox_logo.png"
              alt="OneBox Logo"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo.png';
              }}
            />
            <span className="font-bold text-xl tracking-tight text-slate-900">OneBox</span>
          </div>

          {/* Desktop Navigation Links matching reference */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-slate-900 transition-colors cursor-pointer py-1 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none rounded"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-slate-900 transition-colors cursor-pointer py-1 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none rounded"
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="hover:text-slate-900 transition-colors cursor-pointer py-1 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none rounded"
            >
              Pricing
            </button>
            <button
              onClick={() => scrollToSection('resources')}
              className="hover:text-slate-900 transition-colors cursor-pointer py-1 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none rounded"
            >
              Blog
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="hover:text-slate-900 transition-colors cursor-pointer py-1 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none rounded"
            >
              About
            </button>

            {/* Separate direct button for the Dashboard in the navbar */}
            <button
              onClick={onOpenDashboard}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200/80 transition cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
              <span>Dashboard</span>
            </button>
          </nav>

          {/* Desktop Right Actions matching reference: Sign in + Get started free */}
          <div className="hidden lg:flex items-center space-x-4">
            <button
              onClick={onOpenAuth}
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer px-3 py-2 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
            >
              Sign in
            </button>
            <button
              onClick={onOpenDashboard}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow transition-all group cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
            >
              <span>Get started free</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={onOpenDashboard}
              className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Dashboard
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none cursor-pointer"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg overflow-hidden"
          >
            <nav className="flex flex-col space-y-1.5 text-sm font-medium text-slate-700">
              <button
                onClick={() => scrollToSection('features')}
                className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 transition"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 transition"
              >
                How it works
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 transition"
              >
                Pricing
              </button>
              <button
                onClick={() => scrollToSection('resources')}
                className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 transition"
              >
                Blog
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-left py-2 px-3 rounded-lg hover:bg-slate-50 transition"
              >
                About
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDashboard();
                }}
                className="text-left py-2 px-3 rounded-lg bg-blue-50 text-blue-700 font-bold flex items-center justify-between"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </nav>

            <div className="pt-3 border-t border-slate-100 flex flex-col space-y-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 transition"
              >
                Sign in
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDashboard();
                }}
                className="w-full inline-flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-semibold bg-slate-900 text-white shadow-sm transition"
              >
                <span>Get started free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
