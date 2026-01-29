'use client'

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
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    const startTime = Date.now() + delay * 1000
    const endTime = startTime + duration * 1000
    
    const animate = () => {
      const now = Date.now()
      
      if (now < startTime) {
        requestAnimationFrame(animate)
        return
      }
      
      if (now >= endTime) {
        setDisplayValue(value)
        return
      }
      
      const progress = (now - startTime) / (duration * 1000)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplayValue(value * eased)
      
      requestAnimationFrame(animate)
    }
    
    requestAnimationFrame(animate)
  }, [value, duration, delay])

  const formattedValue = decimals > 0 
    ? displayValue.toFixed(decimals)
    : formatNumber && displayValue >= 1000
      ? formatLargeNumber(Math.round(displayValue))
      : Math.round(displayValue).toString()

  return (
    <span className={className} suppressHydrationWarning>
      {formattedValue}
    </span>
  )
}
