'use client'

import { motion } from 'framer-motion'
import { Mic, Check, Database } from 'lucide-react'
import { useState, useEffect } from 'react'
import AnimatedCounter from './AnimatedCounter'

const chatScenarios = [
  {
    userMessage: "Just received 50 units of Blue Hoodies",
    isVoiceNote: true,
    duration: "0:03",
    botResponse: "✓ Updated: Blue Hoodies\n10 → 60 units",
    item: "Blue Hoodies",
    oldStock: 10,
    newStock: 60,
  },
  {
    userMessage: "Sold 15 Red T-Shirts today",
    isVoiceNote: false,
    botResponse: "✓ Updated: Red T-Shirts\n45 → 30 units",
    item: "Red T-Shirts",
    oldStock: 45,
    newStock: 30,
  },
  {
    userMessage: "Added 100 Black Jeans to warehouse B",
    isVoiceNote: true,
    duration: "0:04",
    botResponse: "✓ Updated: Black Jeans\n23 → 123 units\nLocation: Warehouse B",
    item: "Black Jeans",
    oldStock: 23,
    newStock: 123,
  },
]

export default function DemoSection() {
  const [currentScenario, setCurrentScenario] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showBotResponse, setShowBotResponse] = useState(false)
  const [stockCount, setStockCount] = useState(10)
  const [highlightedItem, setHighlightedItem] = useState<string | null>(null)

  useEffect(() => {
    const runAnimation = () => {
      const scenario = chatScenarios[currentScenario]
      
      setIsAnimating(true)
      setShowBotResponse(false)
      setStockCount(scenario.oldStock)
      setHighlightedItem(scenario.item)

      // Show bot response after 1.5s
      setTimeout(() => {
        setShowBotResponse(true)
        setStockCount(scenario.newStock)
      }, 1500)

      // Reset and move to next scenario
      setTimeout(() => {
        setIsAnimating(false)
        setShowBotResponse(false)
        setHighlightedItem(null)
        
        setTimeout(() => {
          setCurrentScenario((prev) => (prev + 1) % chatScenarios.length)
        }, 2000)
      }, 5000)
    }

    const interval = setInterval(runAnimation, 9000)
    runAnimation() // Run immediately on mount

    return () => clearInterval(interval)
  }, [currentScenario])

  const scenario = chatScenarios[currentScenario]

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-transparent via-brand-green/5 to-transparent">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            See it in <span className="text-gradient">action</span>
          </h2>
          <p className="text-xl text-gray-400">
            Watch how a simple message updates your database in real-time
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* WhatsApp Chat Simulation with Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            {/* iPhone Mockup */}
            <div className="relative">
              {/* Phone Frame */}
              <div className="w-[320px] h-[650px] bg-black rounded-[3rem] p-3 shadow-2xl border-8 border-gray-800">
                {/* Screen */}
                <div className="w-full h-full bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden relative">
                  {/* Dynamic Island */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-black rounded-b-3xl z-50"></div>
                  
                  {/* WhatsApp Interface */}
                  <div className="h-full flex flex-col">
                    {/* WhatsApp Header */}
                    <div className="bg-[#1a1a1a] px-4 py-3 pt-10 border-b border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center">
                          <span className="text-brand-darker font-bold text-lg">B</span>
                        </div>
                        <div>
                          <div className="font-semibold text-sm">The Backroom</div>
                          <div className="text-xs text-brand-green flex items-center space-x-1">
                            <div className="w-1.5 h-1.5 bg-brand-green rounded-full"></div>
                            <span>Online</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chat Messages */}
            <div className="p-6 min-h-[400px] flex flex-col justify-end space-y-4 bg-[#0a0a0a]">
              {/* Previous messages (static) */}
              <div className="flex justify-start opacity-40">
                <div className="glass rounded-2xl rounded-tl-sm px-3 py-2 max-w-[200px] border border-white/10">
                  <p className="text-xs text-gray-300">
                    👋 Hi! Send me inventory updates via text or voice note.
                  </p>
                </div>
              </div>

              {/* User Message */}
              {isAnimating && (
                <motion.div
                  key={currentScenario}
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-end"
                >
                  <div className="bg-brand-green/20 border border-brand-green/30 rounded-2xl rounded-tr-sm px-3 py-2 max-w-[200px]">
                    {scenario.isVoiceNote && (
                      <div className="flex items-center space-x-2 mb-1">
                        <Mic className="w-3 h-3 text-brand-green" />
                        <div className="flex-1 h-1 bg-brand-green/30 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 2, ease: "linear" }}
                            className="h-full bg-brand-green"
                          />
                        </div>
                        <span className="text-xs text-gray-400">{scenario.duration}</span>
                      </div>
                    )}
                    <p className="text-xs leading-relaxed">{scenario.userMessage}</p>
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      <span className="text-xs text-gray-400">14:32</span>
                      <Check className="w-3 h-3 text-brand-green" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Bot Response */}
              {showBotResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-start"
                  >
                    <div className="glass rounded-2xl rounded-tl-sm px-3 py-2 max-w-[200px] border border-brand-green/30">
                      <div className="flex items-center space-x-2 text-brand-green mb-1">
                        <Check className="w-3 h-3" />
                        <span className="text-xs font-semibold">Inventory Updated</span>
                      </div>
                      <p className="text-xs text-gray-300 whitespace-pre-line leading-relaxed">
                        {scenario.botResponse}
                      </p>
                      <div className="flex items-center justify-start mt-1">
                        <span className="text-xs text-gray-400">14:32</span>
                      </div>
                    </div>
                  </motion.div>
                )}

              {/* Typing indicator */}
              {isAnimating && !showBotResponse && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="glass rounded-2xl rounded-tl-sm px-3 py-2 border border-white/10">
                    <div className="flex space-x-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Database Table View */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-brand-green" />
                <div className="font-semibold font-mono">inventory</div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-400">Live</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm font-mono">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-white/10">
                    <th className="pb-3 pr-4">id</th>
                    <th className="pb-3 pr-4">item_name</th>
                    <th className="pb-3 pr-4">stock</th>
                    <th className="pb-3">updated</th>
                  </tr>
                </thead>
                <tbody>
                  <motion.tr
                    animate={
                      highlightedItem === "Red T-Shirts"
                        ? {
                            backgroundColor: ['rgba(62, 207, 142, 0)', 'rgba(62, 207, 142, 0.15)', 'rgba(62, 207, 142, 0)'],
                          }
                        : {}
                    }
                    transition={{ duration: 2 }}
                    className="border-b border-white/5"
                  >
                    <td className="py-3 pr-4 text-gray-400">001</td>
                    <td className="py-3 pr-4">Red T-Shirts</td>
                    <td className="py-3 pr-4">
                      <span className={highlightedItem === "Red T-Shirts" ? "text-brand-green font-bold" : "text-gray-300"}>
                        {highlightedItem === "Red T-Shirts" ? (
                          <AnimatedCounter value={stockCount} className="text-brand-green font-bold" />
                        ) : (
                          45
                        )}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">
                      {highlightedItem === "Red T-Shirts" ? (
                        <span className="text-brand-green">now</span>
                      ) : (
                        "2m ago"
                      )}
                    </td>
                  </motion.tr>
                  
                  <motion.tr
                    animate={
                      highlightedItem === "Blue Hoodies"
                        ? {
                            backgroundColor: ['rgba(62, 207, 142, 0)', 'rgba(62, 207, 142, 0.15)', 'rgba(62, 207, 142, 0)'],
                          }
                        : {}
                    }
                    transition={{ duration: 2 }}
                    className="border-b border-white/5"
                  >
                    <td className="py-3 pr-4 text-gray-400">002</td>
                    <td className="py-3 pr-4 font-semibold">Blue Hoodies</td>
                    <td className="py-3 pr-4">
                      <motion.span
                        animate={highlightedItem === "Blue Hoodies" ? { scale: [1, 1.2, 1] } : {}}
                        className={highlightedItem === "Blue Hoodies" ? "text-brand-green font-bold" : "text-gray-300"}
                      >
                        {highlightedItem === "Blue Hoodies" ? (
                          <AnimatedCounter value={stockCount} className="text-brand-green font-bold" />
                        ) : (
                          10
                        )}
                      </motion.span>
                    </td>
                    <td className="py-3">
                      {highlightedItem === "Blue Hoodies" ? (
                        <span className="text-brand-green">now</span>
                      ) : (
                        <span className="text-gray-400">5m ago</span>
                      )}
                    </td>
                  </motion.tr>
                  
                  <motion.tr
                    animate={
                      highlightedItem === "Black Jeans"
                        ? {
                            backgroundColor: ['rgba(62, 207, 142, 0)', 'rgba(62, 207, 142, 0.15)', 'rgba(62, 207, 142, 0)'],
                          }
                        : {}
                    }
                    transition={{ duration: 2 }}
                    className="border-b border-white/5"
                  >
                    <td className="py-3 pr-4 text-gray-400">003</td>
                    <td className="py-3 pr-4">Black Jeans</td>
                    <td className="py-3 pr-4">
                      <span className={highlightedItem === "Black Jeans" ? "text-brand-green font-bold" : "text-gray-300"}>
                        {highlightedItem === "Black Jeans" ? (
                          <AnimatedCounter value={stockCount} className="text-brand-green font-bold" />
                        ) : (
                          23
                        )}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">
                      {highlightedItem === "Black Jeans" ? (
                        <span className="text-brand-green">now</span>
                      ) : (
                        "1h ago"
                      )}
                    </td>
                  </motion.tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-mono">→ PostgreSQL Real-time Sync</span>
                <span className="text-brand-green font-mono">~{Math.floor(Math.random() * 200 + 100)}ms</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
