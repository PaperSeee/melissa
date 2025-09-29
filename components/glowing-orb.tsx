"use client"

import { motion } from 'framer-motion'

interface GlowingOrbProps {
  size?: 'sm' | 'md' | 'lg'
}

export function GlowingOrb({ size = 'md' }: GlowingOrbProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 opacity-20 blur-xl absolute -z-10`}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.2, 0.4, 0.2]
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  )
}
  