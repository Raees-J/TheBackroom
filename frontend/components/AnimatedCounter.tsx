'use client'

import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  className?: string
  duration?: number
  delay?: number
  decimals?: number
  formatNumber?: boolean
}

function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

export default function AnimatedCounter({ 
  value, 
  className = '', 
  duration = 1,
  delay = 0,
  decimals = 0,
  formatNumber = true
}: AnimatedCounterProps) {
  const [mounted, setMounted] = useState(false)
  
  const spring = useSpring(0, {
    damping: 30,
    stiffness: 200,
  })

  // Handle SSR hydration
  useEffect(() => {
    setMounted(true)
    // Start animation after mount
    const timeout = setTimeout(() => {
      spring.set(value)
    }, delay * 1000)

    return () => clearTimeout(timeout)
  }, [value, spring, delay])

  const display = useTransform(spring, (current) => {
    if (decimals > 0) {
      return current.toFixed(decimals)
    }
    const rounded = Math.round(current)
    if (formatNumber && rounded >= 1000) {
      return formatLargeNumber(rounded)
    }
    return rounded.toString()
  })

  // Return static value during SSR to prevent hydration mismatch
  if (!mounted) {
    const staticValue = decimals > 0 
      ? (0).toFixed(decimals)
      : '0'
    
    return <span className={className} suppressHydrationWarning>{staticValue}</span>
  }

  return (
    <motion.span className={className} suppressHydrationWarning>
      {display}
    </motion.span>
  )
}
