'use client'

import { motion } from 'framer-motion'

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M3 9h18M9 3v18" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    title: 'PostgreSQL Database',
    description: 'Every client gets a full PostgreSQL database, the world\'s most trusted relational database.',
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500',
    size: 'col-span-1 md:col-span-2 row-span-1',
    features: ['100% portable', 'Built-in Auth with RLS', 'Easy to extend'],
    artwork: (
      <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path
            d="M100,40 Q140,60 140,100 Q140,140 100,160 Q60,140 60,100 Q60,60 100,40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-blue-400"
          />
          <circle cx="100" cy="100" r="8" fill="currentColor" className="text-blue-400" />
          <path
            d="M100,70 L100,130 M70,100 L130,100"
            stroke="currentColor"
            strokeWidth="2"
            className="text-cyan-400"
          />
        </svg>
      </div>
    ),
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Authentication',
    description: 'Add user sign ups and logins, securing your data with Row Level Security.',
    gradient: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500',
    size: 'col-span-1 row-span-1',
    features: ['Phone number OTP', 'JWT tokens', 'Secure sessions'],
    artwork: (
      <div className="absolute bottom-4 right-4 w-48 h-32 opacity-10">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-purple-500 rounded h-8"></div>
          <div className="bg-pink-500 rounded h-8"></div>
          <div className="bg-purple-400 rounded h-8"></div>
          <div className="bg-pink-400 rounded h-8"></div>
        </div>
      </div>
    ),
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 2v4m0 12v4M2 12h4m12 0h4m-2.8-7.2l-2.8 2.8m-5.6 5.6l-2.8 2.8m12.4 0l-2.8-2.8M7.2 7.2L4.4 4.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'AI Functions',
    description: 'Easily write custom code without deploying or scaling servers.',
    gradient: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500',
    size: 'col-span-1 row-span-1',
    features: ['Natural language', 'Voice notes', 'Slang support'],
    artwork: (
      <div className="absolute bottom-0 right-0 w-full h-24 opacity-10">
        <div className="flex items-end justify-end space-x-2 h-full p-4">
          <div className="w-2 h-12 bg-green-500 rounded"></div>
          <div className="w-2 h-20 bg-emerald-500 rounded"></div>
          <div className="w-2 h-16 bg-green-400 rounded"></div>
          <div className="w-2 h-24 bg-emerald-400 rounded"></div>
        </div>
      </div>
    ),
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <rect x="3" y="6" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M7 10h4m-4 4h2m4-4h4m-4 4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: 'WhatsApp Native',
    description: 'No apps to install. Your team already knows how to use it. Send voice notes, text, or images.',
    gradient: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500',
    size: 'col-span-1 md:col-span-2 row-span-1',
    features: ['Zero training', 'Voice messages', 'Instant updates'],
    artwork: (
      <div className="absolute bottom-4 right-4 w-56 h-40 opacity-10">
        <div className="space-y-2">
          <div className="bg-green-500/50 rounded-2xl rounded-br-sm h-10 w-40 ml-auto"></div>
          <div className="bg-emerald-500/50 rounded-2xl rounded-bl-sm h-10 w-32"></div>
          <div className="bg-green-400/50 rounded-2xl rounded-br-sm h-10 w-48 ml-auto"></div>
        </div>
      </div>
    ),
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    title: 'Real-time',
    description: 'Listen to database changes instantly. Build collaborative features with real-time subscriptions.',
    gradient: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500',
    size: 'col-span-1 row-span-1',
    features: ['Sub-second sync', 'Live updates', 'WebSocket powered'],
    artwork: (
      <div className="absolute bottom-0 right-0 w-full h-full opacity-10 overflow-hidden">
        <div className="absolute bottom-4 right-4">
          <div className="w-16 h-16 border-4 border-yellow-500 rounded-full animate-ping"></div>
          <div className="w-16 h-16 border-4 border-orange-500 rounded-full absolute top-0 left-0"></div>
        </div>
      </div>
    ),
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M12 3c2.5 0 4.5 4 4.5 9s-2 9-4.5 9m0-18c-2.5 0-4.5 4-4.5 9s2 9 4.5 9" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
    title: 'Multi-location',
    description: 'Manage inventory across multiple warehouses, regions, or countries from a single dashboard.',
    gradient: 'from-teal-500 to-cyan-500',
    bgColor: 'bg-teal-500',
    size: 'col-span-1 row-span-1',
    features: ['Unlimited locations', 'Centralized view', 'Role-based access'],
    artwork: (
      <div className="absolute bottom-0 right-0 w-48 h-48 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" className="text-teal-400" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" className="text-cyan-400" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="1" className="text-teal-300" />
          <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="1" className="text-cyan-400" />
          <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="1" className="text-cyan-400" />
        </svg>
      </div>
    ),
  },
]

export default function BentoGrid() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Built for <span className="text-gradient">real warehouses</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to manage inventory at scale, without the complexity
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`${feature.size} glass rounded-2xl p-8 border border-white/10 hover:border-brand-green/30 transition group cursor-pointer relative overflow-hidden`}
            >
              {/* Artwork Background */}
              {feature.artwork}

              {/* Content */}
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition text-white`}>
                  {feature.icon}
                </div>
                
                <h3 className="text-2xl font-bold mb-3 group-hover:text-brand-green transition">
                  {feature.title}
                </h3>
                
                <p className="text-gray-400 mb-6 leading-relaxed">
                  {feature.description}
                </p>

                {/* Feature List */}
                <div className="space-y-2">
                  {feature.features.map((item) => (
                    <div key={item} className="flex items-center space-x-2 text-sm text-gray-500">
                      <Check className="w-4 h-4 text-brand-green" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-green/0 to-brand-green/0 group-hover:from-brand-green/5 group-hover:to-transparent transition-all duration-500 rounded-2xl"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
