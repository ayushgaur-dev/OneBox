import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Sparkles, Check, ArrowRight } from 'lucide-react';

interface PricingSectionProps {
  onGetStarted: () => void;
}

export function PricingSection({ onGetStarted }: PricingSectionProps) {
  const [isYearly, setIsYearly] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const plans = [
    {
      id: 'free',
      name: 'Free',
      subtitle: 'For getting started',
      price: '₹0',
      period: 'forever',
      features: [
        'Up to 100 items',
        'Basic AI organization',
        'Tasks & reminders',
        'Cross-device sync',
      ],
      ctaText: 'Get started',
      buttonClass: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      subtitle: 'For power users',
      price: isYearly ? '₹239' : '₹299',
      period: 'per month',
      features: [
        'Unlimited items',
        'Advanced AI features',
        'Smart reminders',
        'Priority support',
        'Early access to new features',
      ],
      ctaText: 'Get started',
      buttonClass: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25',
      popular: true,
    },
    {
      id: 'team',
      name: 'Team',
      subtitle: 'For friends and teams',
      price: isYearly ? '₹639' : '₹799',
      period: 'per month',
      features: [
        'Everything in Pro',
        'Shared workspaces',
        'Team collaboration',
        'Admin controls',
        'Priority support',
      ],
      ctaText: 'Get started',
      buttonClass: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-[#090D16] text-white relative overflow-hidden scroll-mt-20 border-t border-slate-800/60">
      {/* Background glow */}
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Left Side: Headline, Subtitle & Monthly/Yearly Toggle */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>PRICING</span>
            </motion.div>

            <motion.h2
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white"
            >
              Simple, transparent pricing.
            </motion.h2>

            <motion.p
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="text-base text-slate-400 leading-relaxed max-w-sm"
            >
              Start for free. Upgrade when you need more.
            </motion.p>

            {/* Monthly / Yearly Toggle matching reference */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="pt-2"
            >
              <div className="inline-flex items-center p-1 bg-slate-900 border border-slate-800 rounded-full text-xs font-semibold">
                <button
                  onClick={() => setIsYearly(false)}
                  className={`px-4 py-2 rounded-full transition cursor-pointer ${
                    !isYearly ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setIsYearly(true)}
                  className={`px-4 py-2 rounded-full transition flex items-center space-x-1.5 cursor-pointer ${
                    isYearly ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Yearly</span>
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full">
                    Save 20%
                  </span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Side: 3 Pricing Cards matching reference */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.45,
                  delay: shouldReduceMotion ? 0 : idx * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`relative bg-slate-900/90 border rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? 'border-blue-500/80 shadow-2xl shadow-blue-500/10 ring-1 ring-blue-500/40'
                    : 'border-slate-800/90 hover:border-slate-700'
                }`}
              >
                {/* Popular Pill centered on top border */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-md">
                    Most popular
                  </div>
                )}

                <div>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{plan.subtitle}</p>
                  </div>

                  {/* Pricing number */}
                  <div className="my-6">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-4xl font-extrabold text-white tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{plan.period}</span>
                    </div>
                  </div>

                  {/* Feature checklist */}
                  <div className="space-y-3 pt-2 mb-8">
                    {plan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start space-x-2 text-xs text-slate-300">
                        <Check className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Action Button */}
                <button
                  onClick={onGetStarted}
                  className={`w-full py-3 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5 ${plan.buttonClass}`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
