'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const faqs = [
  {
    question: 'How does it understand my slang?',
    answer: 'Our AI is trained on supply-chain terminology and local warehouse slang. It understands context, abbreviations, and even typos. Whether you say "50 units" or "50pcs" or "fifty boxes", it gets it.',
  },
  {
    question: 'Do I need to install an app?',
    answer: 'No. If your staff can use WhatsApp, they can use The Backroom. There\'s nothing to download, no training required, and no complicated setup.',
  },
  {
    question: 'Where is my data stored?',
    answer: 'Every client gets a dedicated, encrypted PostgreSQL instance hosted on Supabase. Your data is isolated, backed up daily, and you can export it anytime.',
  },
  {
    question: 'Can I use voice notes?',
    answer: 'Absolutely! Voice notes are transcribed and processed just like text messages. Perfect for busy warehouse environments where typing is inconvenient.',
  },
  {
    question: 'What happens if I make a mistake?',
    answer: 'Every transaction is logged with a timestamp and user ID. You can view the full history and make corrections by sending another message. It\'s as simple as "Actually, that was 40 units, not 50".',
  },
  {
    question: 'How many team members can use it?',
    answer: 'Our standard plan includes up to 5 team members. Need more? You can add unlimited users for just R30/user/month.',
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently asked <span className="text-gradient">questions</span>
          </h2>
          <p className="text-xl text-gray-400">
            Everything you need to know about The Backroom
          </p>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="glass rounded-xl border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition group"
              >
                <span className="font-semibold text-lg pr-8">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  <ChevronDown className="w-5 h-5 text-brand-green flex-shrink-0" />
                </motion.div>
              </button>
              
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ 
                      height: 'auto', 
                      opacity: 1,
                      transition: {
                        height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                        opacity: { duration: 0.25, delay: 0.1 }
                      }
                    }}
                    exit={{ 
                      height: 0, 
                      opacity: 0,
                      transition: {
                        height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                        opacity: { duration: 0.2 }
                      }
                    }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-gray-400 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
