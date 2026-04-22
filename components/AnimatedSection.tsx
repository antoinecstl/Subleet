'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  children: React.ReactNode
  delay?: number          // ms
  direction?: 'up' | 'left' | 'right' | 'none'
  className?: string
  style?: React.CSSProperties
}

export default function AnimatedSection({
  children,
  delay = 0,
  direction = 'up',
  className,
  style,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect()
          if (delay) setTimeout(() => setVisible(true), delay)
          else setVisible(true)
        }
      },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  const translate =
    direction === 'up' ? 'translateY(28px)' :
    direction === 'left' ? 'translateX(-28px)' :
    direction === 'right' ? 'translateX(28px)' :
    'none'

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(0,0)' : translate,
        transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
