import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { X, Eye, EyeOff, ArrowRight, Database, Image as ImageIcon, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const shouldReduceMotion = useReducedMotion();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSuccess();
    onClose();
  };

  const handleSkipToWorkspace = () => {
    onSuccess();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden relative grid grid-cols-1 md:grid-cols-12"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-700 bg-white/80 hover:bg-slate-100 rounded-full transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left Side: Form Container */}
            <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <img
                    src="/onebox_logo.png"
                    alt="OneBox"
                    className="w-7 h-7 object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/logo.png';
                    }}
                  />
                  <span className="font-bold text-lg text-slate-900">OneBox</span>
                </div>

                <h3 id="auth-modal-title" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {isSignUp ? 'Create your account' : 'Welcome back'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {isSignUp ? 'Start organizing your information today.' : 'Sign in to access your OneBox.'}
                </p>

                {/* Social OAuth Buttons */}
                <div className="mt-6 space-y-2.5">
                  <button
                    type="button"
                    onClick={handleSkipToWorkspace}
                    className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 flex items-center justify-center space-x-2 transition shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    {/* Google Logo */}
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSkipToWorkspace}
                    className="w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 flex items-center justify-center space-x-2 transition shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    {/* GitHub Logo */}
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                    <span>Continue with GitHub</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <span className="relative bg-white px-3 text-xs text-slate-400 font-bold uppercase">
                    OR
                  </span>
                </div>

                {/* Traditional Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {isSignUp && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full px-3.5 py-2 text-sm text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full px-3.5 py-2 text-sm text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full px-3.5 py-2 text-sm text-black font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-md transition mt-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    {isSignUp ? 'Create account' : 'Sign in'}
                  </button>
                </form>

                {/* Toggle Sign Up / Sign In */}
                <p className="text-center text-xs text-slate-500 mt-4">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-blue-600 font-semibold hover:underline cursor-pointer focus-visible:outline-none"
                  >
                    {isSignUp ? 'Sign in' : 'Create account'}
                  </button>
                </p>
              </div>

              {/* Quick local bypass */}
              <div className="pt-4 border-t border-slate-100 text-center">
                <button
                  onClick={handleSkipToWorkspace}
                  className="text-xs text-slate-400 hover:text-slate-700 transition flex items-center justify-center space-x-1 mx-auto cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-md p-1"
                >
                  <span>Or use local OneBox workspace directly</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Right Side: Showcase Banner with Honest Product Benefits */}
            <div className="hidden md:flex md:col-span-5 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 p-8 text-white flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Visual Showcase Center */}
              <div className="my-auto space-y-6 text-center z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2.5 mx-auto flex items-center justify-center shadow-lg">
                  <img
                    src="/onebox_logo.png"
                    alt="OneBox"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/logo.png';
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="text-2xl font-bold tracking-tight">
                    Everything you save, private and organized.
                  </h4>
                  <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
                    Capture raw notes, extract text from screenshots with local OCR, and let Gemini AI categorize what matters.
                  </p>
                </div>
              </div>

              {/* Verified Product Feature Highlights */}
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-left space-y-2.5 z-10">
                <div className="flex items-start space-x-2.5">
                  <Database className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-slate-200 leading-tight">
                    <strong className="text-white">Local SQLite Database:</strong> Zero vendor lock-in, data stays on your machine.
                  </p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <ImageIcon className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-slate-200 leading-tight">
                    <strong className="text-white">Tesseract OCR:</strong> Direct screenshot image & clipboard text extraction.
                  </p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-slate-200 leading-tight">
                    <strong className="text-white">Gemini 3.5 Flash:</strong> Human-in-the-loop AI review before saving.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default AuthModal;
