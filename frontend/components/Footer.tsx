'use client'

import { motion } from 'framer-motion'
import { Terminal, Github, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative py-20 px-4 border-t border-white/10">
      {/* Terminal-style background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-brand-darker/50" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 mb-16 border border-brand-green/20"
        >
          <div className="flex items-start space-x-4 mb-6">
            <Terminal className="w-6 h-6 text-brand-green mt-1" />
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">Stay updated</h3>
              <p className="text-gray-400 mb-4">
                Get the latest updates on features, integrations, and best practices.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-brand-dark border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-brand-green transition font-mono"
                />
                <button className="bg-brand-green text-brand-darker px-6 py-3 rounded-lg font-semibold hover:glow-green transition whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div>
            <h4 className="font-bold mb-4 text-brand-green">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Features</a></li>
              <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition">Changelog</a></li>
              <li><a href="#" className="hover:text-white transition">Roadmap</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-brand-green">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-brand-green">Resources</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition">API Reference</a></li>
              <li><a href="#" className="hover:text-white transition">Guides</a></li>
              <li><a href="#" className="hover:text-white transition">Support</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-brand-green">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms</a></li>
              <li><a href="#" className="hover:text-white transition">Security</a></li>
              <li><a href="#" className="hover:text-white transition">Compliance</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
              <span className="text-brand-darker font-bold">B</span>
            </div>
            <span className="font-bold">The Backroom</span>
          </div>

          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2026 The Backroom. All rights reserved.
          </div>

          <div className="flex items-center space-x-4">
            <a href="#" className="text-gray-400 hover:text-brand-green transition">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-brand-green transition">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-brand-green transition">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Terminal Command Line Effect */}
        <div className="mt-8 font-mono text-sm text-gray-600">
          <span className="text-brand-green">$</span> npm install @thebackroom/sdk
        </div>
      </div>
    </footer>
  )
}
