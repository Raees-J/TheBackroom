declare module 'framer-motion' {
  import * as React from 'react'

  export interface MotionProps {
    initial?: any
    animate?: any
    exit?: any
    transition?: any
    whileHover?: any
    whileTap?: any
    whileInView?: any
    viewport?: any
    className?: string
    style?: React.CSSProperties
    children?: React.ReactNode
    onClick?: () => void
  }

  export const motion: {
    div: React.FC<MotionProps & React.HTMLAttributes<HTMLDivElement>>
    nav: React.FC<MotionProps & React.HTMLAttributes<HTMLElement>>
    section: React.FC<MotionProps & React.HTMLAttributes<HTMLElement>>
    h1: React.FC<MotionProps & React.HTMLAttributes<HTMLHeadingElement>>
    p: React.FC<MotionProps & React.HTMLAttributes<HTMLParagraphElement>>
    button: React.FC<MotionProps & React.ButtonHTMLAttributes<HTMLButtonElement>>
    span: React.FC<MotionProps & React.HTMLAttributes<HTMLSpanElement>>
    tr: React.FC<MotionProps & React.HTMLAttributes<HTMLTableRowElement>>
  }
}
