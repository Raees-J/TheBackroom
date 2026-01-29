'use client'

import { motion } from 'framer-motion'
import { Menu, X, Database, Shield, Zap, Terminal, MessageSquare, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'

const productDropdown = [
  {
    icon: Database,
    title: 'Database',
    description: 'PostgreSQL database for your inventory',
    href: '#database',
  },
  {
    icon: Shield,
    title: 'Authentication',
    description: 'Secure phone number verification',
    href: '#auth',
  },
  {
    icon: Zap,
    title: 'Real-time',
    description: 'Instant inventory updates',
    href: '#realtime',
  },
  {
    icon: Terminal,
    title: 'API',
    description: 'RESTful API for integrations',
    href: '#api',
  },
]

const solutionsDropdown = [
  {
    icon: MessageSquare,
    title: 'WhatsApp Integration',
    description: 'Manage inventory via WhatsApp',
    href: '#whatsapp',
  },
  {
    icon: Database, // Reuse Database icon instead of emoji
    title: 'Analytics',
    description: 'Track stock levels and trends',
    href: '#analytics',
  },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [hidden, setHidden] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setHidden(true)
      } else {
        setHidden(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: hidden ? -100 : 0 }}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
              <span className="text-brand-darker font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold">The Backroom</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Product Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('product')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="text-gray-300 hover:text-white transition px-4 py-2 rounded-lg hover:bg-white/5 flex items-center space-x-1">
                <span>Product</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {activeDropdown === 'product' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 w-96 bg-[#1a1a1a] rounded-xl border border-white/20 p-2 shadow-2xl backdrop-blur-xl"
                >
                  {productDropdown.map((item) => (
                    <a
                      key={item.title}
                      href={item.href}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/10 transition group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-green/20 transition">
                        <item.icon className="w-5 h-5 text-brand-green" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold mb-1 group-hover:text-brand-green transition">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-400">
                          {item.description}
                        </div>
                      </div>
                    </a>
                  ))}
                </motion.div>
              )}
            </div>

            {/* Solutions Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('solutions')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="text-gray-300 hover:text-white transition px-4 py-2 rounded-lg hover:bg-white/5 flex items-center space-x-1">
                <span>Solutions</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {activeDropdown === 'solutions' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 mt-2 w-96 bg-[#1a1a1a] rounded-xl border border-white/20 p-2 shadow-2xl backdrop-blur-xl"
                >
                  {solutionsDropdown.map((item) => (
                    <a
                      key={item.title}
                      href={item.href}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/10 transition group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-green/20 transition">
                        <item.icon className="w-5 h-5 text-brand-green" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold mb-1 group-hover:text-brand-green transition">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-400">
                          {item.description}
                        </div>
                      </div>
                    </a>
                  ))}
                </motion.div>
              )}
            </div>

            <a href="/pricing" className="text-gray-300 hover:text-white transition px-4 py-2 rounded-lg hover:bg-white/5">
              Pricing
            </a>
            <a href="/support" className="text-gray-300 hover:text-white transition px-4 py-2 rounded-lg hover:bg-white/5">
              Support
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="/auth/signin" className="text-gray-300 hover:text-white transition px-4 py-2">
              Sign In
            </a>
            <a href="/dashboard" className="bg-brand-green text-brand-darker px-6 py-2 rounded-lg font-semibold hover:glow-green transition">
              Dashboard
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden glass border-t border-white/10 overflow-hidden"
        >
          <div className="px-4 py-6 space-y-4">
            <a href="#product" className="block text-gray-300 hover:text-white">
              Product
            </a>
            <a href="#solutions" className="block text-gray-300 hover:text-white">
              Solutions
            </a>
            <a href="/pricing" className="block text-gray-300 hover:text-white">
              Pricing
            </a>
            <a href="/support" className="block text-gray-300 hover:text-white">
              Support
            </a>
            <a href="/auth/signin" className="block text-gray-300 hover:text-white">
              Sign In
            </a>
            <a href="/dashboard" className="block w-full bg-brand-green text-brand-darker px-6 py-2 rounded-lg font-semibold text-center">
              Dashboard
            </a>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}
