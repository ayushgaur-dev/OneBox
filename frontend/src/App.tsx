import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import WorkspacePreviewSection from './components/WorkspacePreviewSection';
import PricingSection from './components/PricingSection';
import AboutSection from './components/AboutSection';
import ResourcesSection from './components/ResourcesSection';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import DashboardView from './components/DashboardView';

export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // View state: 'landing' or 'dashboard'
  const [view, setView] = useState<'landing' | 'dashboard'>(() => {
    return window.location.hash === '#dashboard' ? 'dashboard' : 'landing';
  });

  // Keep state synchronized with URL hash
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#dashboard') {
        setView('dashboard');
      } else {
        setView('landing');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleOpenDashboard = () => {
    window.location.hash = '#dashboard';
    setView('dashboard');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleBackToWebsite = () => {
    window.location.hash = '';
    setView('landing');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // If in Dashboard view, render the dedicated OneBox Dashboard page
  if (view === 'dashboard') {
    return <DashboardView onBackToWebsite={handleBackToWebsite} />;
  }

  // Otherwise, render the SaaS Landing Page
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. Sticky Responsive Header with Dashboard & Sign In CTA */}
      <Navbar
        onOpenDashboard={handleOpenDashboard}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <main>
        {/* 2. Hero Section matching top reference (Hero + 3D Open Box + Logos) */}
        <HeroSection
          onGetStarted={handleOpenDashboard}
          onSeeHowItWorks={() => {
            const el = document.getElementById('how-it-works');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 3. Features Section matching reference (5 Features + 3D Perspective Mockup) */}
        <FeaturesSection />

        {/* 4. How It Works Section (Organic Dark Wave + "From chaos to clarity" + 4-Step Process) */}
        <HowItWorksSection onExploreWorkspace={handleOpenDashboard} />

        {/* 5. Workspace Preview Section ("YOUR WORKSPACE" + Dark UI Mockup) */}
        <WorkspacePreviewSection onOpenDashboard={handleOpenDashboard} />

        {/* 6. Pricing Section (Dark Theme Transparent Pricing + Monthly/Yearly Toggle) */}
        <PricingSection onGetStarted={handleOpenDashboard} />

        {/* 7. About Section ("Built for people who never want to lose track") */}
        <AboutSection />

        {/* 8. Resources / Blog Section (Articles + Search + Tags) */}
        <ResourcesSection />

        {/* 9. FAQ Section (Category tabs + Smooth Accordions) */}
        <FAQSection />
      </main>

      {/* 10. Footer with Launch Dashboard Button */}
      <Footer onOpenDashboard={handleOpenDashboard} />

      {/* 11. Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleOpenDashboard}
      />
    </div>
  );
}
