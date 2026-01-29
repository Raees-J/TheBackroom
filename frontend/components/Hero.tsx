'use client'

import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import AnimatedCounter from './AnimatedCounter'

const phrases = [
  'Manage stock via WhatsApp.',
  'Update inventory with voice notes.',
  'Track items in real-time.',
  'Scale to millions of SKUs.',
]

export default function Hero() {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(100)

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex]

    const handleTyping = () => {
      if (!isDeleting) {
        // Typing
        if (displayedText.length < currentPhrase.length) {
          setDisplayedText(currentPhrase.slice(0, displayedText.length + 1))
          setTypingSpeed(100)
        } else {
          // Pause at end before deleting
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        // Deleting
        if (displayedText.length > 0) {
          setDisplayedText(currentPhrase.slice(0, displayedText.length - 1))
          setTypingSpeed(50)
        } else {
          setIsDeleting(false)
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
        }
      }
    }

    const timer = setTimeout(handleTyping, typingSpeed)
    return () => clearTimeout(timer)
  }, [displayedText, isDeleting, currentPhraseIndex, typingSpeed])

  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-green/5 to-transparent" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="glass px-4 py-2 rounded-full flex items-center space-x-2 border border-brand-green/30">
            <Sparkles className="w-4 h-4 text-brand-green" />
            <span className="text-sm">Now live: Voice-to-Inventory 2.0</span>
          </div>
        </motion.div>

        {/* Headline with Typewriter Effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-6"
        >
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-4">
            <span className="text-gradient">{displayedText}</span>
            <span className="animate-pulse text-brand-green">|</span>
          </h1>
        </motion.div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-400 text-center max-w-3xl mx-auto mb-12"
        >
          The inventory platform for the real world. Every warehouse is a full PostgreSQL database.
          Update stock with a voice note.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
        >
          <a href="/auth/signin" className="bg-brand-green text-brand-darker px-8 py-4 rounded-lg font-semibold text-lg hover:glow-green transition flex items-center space-x-2 group">
            <span>Get Started</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </a>
          <a href="https://wa.me/27839300255?text=Hi%2C%20I%27d%20like%20to%20try%20The%20Backroom" className="glass px-8 py-4 rounded-lg font-semibold text-lg hover:border-brand-green/50 transition">
            Request a Demo
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20 grid grid-cols-3 gap-8 max-w-3xl mx-auto"
        >
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-brand-green mb-2">
              <AnimatedCounter value={10000} duration={2} formatNumber={true} />
              <span>+</span>
            </div>
            <div className="text-gray-400 text-sm md:text-base">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-brand-green mb-2">
              <AnimatedCounter value={5000000} duration={2.5} formatNumber={true} />
              <span>+</span>
            </div>
            <div className="text-gray-400 text-sm md:text-base">Items Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-brand-green mb-2">
              <AnimatedCounter value={99.9} duration={2} decimals={1} formatNumber={false} />
              <span>%</span>
            </div>
            <div className="text-gray-400 text-sm md:text-base">Uptime</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
