'use client'

import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const includedFeatures = [
  'Unlimited WhatsApp messages',
  'Unlimited inventory items',
  'Up to 5 team members',
  'Natural language processing',
  'Voice note support',
  'Real-time PostgreSQL database',
  'Transaction history (1 year)',
  'Web dashboard access',
  'Export to CSV/Excel',
  'Search & filter inventory',
  'Role-based permissions',
  'WhatsApp support (24hr response)',
  'Email support',
  'Automatic backups',
  '99.9% uptime SLA',
]

const comingSoonFeatures = [
  {
    title: 'Advanced Analytics',
    description: 'Charts, trends, and insights',
    eta: 'Q2 2026',
  },
  {
    title: 'Low Stock Alerts',
    description: 'Get notified before you run out',
    eta: 'Q2 2026',
  },
  {
    title: 'Barcode Scanning',
    description: 'Scan items with your phone camera',
    eta: 'Q3 2026',
  },
  {
    title: 'Supplier Management',
    description: 'Track suppliers and purchase orders',
    eta: 'Q3 2026',
  },
  {
    title: 'Multi-location',
    description: 'Manage inventory across multiple warehouses',
    eta: 'Q4 2026',
  },
  {
    title: 'API Access',
    description: 'Integrate with your existing systems',
    eta: 'Q4 2026',
  },
]

const addOns = [
  {
    name: 'Extra Team Members',
    price: 'R30',
    unit: 'per user/month',
    description: 'Add unlimited users beyond the included 5',
  },
  {
    name: 'Extended History',
    price: 'R50',
    unit: 'per month',
    description: 'Keep transaction history forever (vs 1 year)',
  },
  {
    name: 'Priority Support',
    price: 'R100',
    unit: 'per month',
    description: '1-hour response time during business hours',
  },
  {
    name: 'Custom Integration',
    price: 'R500',
    unit: 'one-time',
    description: 'Connect to your accounting software or ERP',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-brand-darker">
      <Navbar />
      
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6 border border-brand-green/30">
              <Sparkles className="w-4 h-4 text-brand-green" />
              <span className="text-sm">Simple, transparent pricing</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              One plan.
              <br />
              <span className="text-gradient">Everything included.</span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              No hidden fees, no feature gates, no surprises. Just straightforward pricing that scales with your business.
            </p>
          </motion.div>

          {/* Main Pricing Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-4xl mx-auto mb-20"
          >
            <div className="glass rounded-3xl border-2 border-brand-green/30 p-8 md:p-12 relative overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">The Backroom</h2>
                    <p className="text-gray-400">Perfect for small to medium businesses</p>
                  </div>
                  
                  <div className="mt-6 md:mt-0">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-5xl font-bold text-brand-green">R189</span>
                      <span className="text-gray-400">/month</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">or R1,890/year (save R378)</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <a
                    href="/auth/signin"
                    className="flex-1 bg-brand-green text-brand-darker px-8 py-4 rounded-lg font-semibold text-center hover:glow-green transition flex items-center justify-center space-x-2"
                  >
                    <span>Start 14-day free trial</span>
                    <ArrowRight className="w-5 h-5" />
                  </a>
                  <a
                    href="https://wa.me/27839300255?text=Hi%2C%20I%27d%20like%20to%20learn%20more%20about%20pricing"
                    className="flex-1 glass px-8 py-4 rounded-lg font-semibold text-center hover:border-brand-green/50 transition"
                  >
                    Contact Sales
                  </a>
                </div>

                <div className="border-t border-white/10 pt-8">
                  <h3 className="font-semibold mb-6 flex items-center space-x-2">
                    <Check className="w-5 h-5 text-brand-green" />
                    <span>Everything included:</span>
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
                    {includedFeatures.map((feature, index) => (
                      <motion.div
                        key={feature}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.02 }}
                        className="flex items-center space-x-3"
                      >
                        <Check className="w-4 h-4 text-brand-green flex-shrink-0" />
                        <span className="text-gray-300">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Add-ons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Optional add-ons</h2>
              <p className="text-xl text-gray-400">Customize your plan with these extras</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {addOns.map((addon, index) => (
                <motion.div
                  key={addon.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="glass rounded-xl p-6 border border-white/10 hover:border-brand-green/30 transition"
                >
                  <div className="text-2xl font-bold text-brand-green mb-1">{addon.price}</div>
                  <div className="text-sm text-gray-400 mb-4">{addon.unit}</div>
                  <h3 className="font-semibold mb-2">{addon.name}</h3>
                  <p className="text-sm text-gray-400">{addon.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 glass px-4 py-2 rounded-full mb-6 border border-purple-500/30">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-400">Coming soon</span>
              </div>
              <h2 className="text-4xl font-bold mb-4">Future updates</h2>
              <p className="text-xl text-gray-400">
                New features added at no extra cost to existing customers
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {comingSoonFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="glass rounded-xl p-6 border border-white/10 relative overflow-hidden group hover:border-purple-500/30 transition"
                >
                  <div className="absolute top-4 right-4 text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    {feature.eta}
                  </div>
                  <h3 className="font-semibold mb-2 pr-20">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-8 text-center">Pricing FAQ</h2>
            
            <div className="space-y-6">
              <div className="glass rounded-xl p-6 border border-white/10">
                <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
                <p className="text-gray-400">
                  Yes! No contracts, no cancellation fees. Just let us know and we'll stop billing. You can export your data before you go.
                </p>
              </div>

              <div className="glass rounded-xl p-6 border border-white/10">
                <h3 className="font-semibold mb-2">What happens after the free trial?</h3>
                <p className="text-gray-400">
                  After 14 days, you'll be asked to add payment details. If you don't, your account will be paused (not deleted) and you can reactivate anytime.
                </p>
              </div>

              <div className="glass rounded-xl p-6 border border-white/10">
                <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
                <p className="text-gray-400">
                  Yes! If you're not happy in the first 30 days, we'll refund you in full. No questions asked.
                </p>
              </div>

              <div className="glass rounded-xl p-6 border border-white/10">
                <h3 className="font-semibold mb-2">Will the price increase?</h3>
                <p className="text-gray-400">
                  Your price is locked for 12 months from signup. New features are added at no extra cost. We'll notify you 60 days before any price changes.
                </p>
              </div>

              <div className="glass rounded-xl p-6 border border-white/10">
                <h3 className="font-semibold mb-2">Do you offer discounts?</h3>
                <p className="text-gray-400">
                  Yes! Annual plans save 2 months (R378). Non-profits get 20% off. Referrals earn 1 month free. Contact us for volume discounts (10+ users).
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-20"
          >
            <div className="glass rounded-3xl p-12 border border-brand-green/30 max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
              <p className="text-xl text-gray-400 mb-8">
                Start your 14-day free trial. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/auth/signin"
                  className="bg-brand-green text-brand-darker px-8 py-4 rounded-lg font-semibold hover:glow-green transition inline-flex items-center justify-center space-x-2"
                >
                  <span>Start free trial</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="https://wa.me/27839300255?text=Hi%2C%20I%20have%20questions%20about%20pricing"
                  className="glass px-8 py-4 rounded-lg font-semibold hover:border-brand-green/50 transition"
                >
                  Talk to sales
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
