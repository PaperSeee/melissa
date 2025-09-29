"use client"

import { motion } from 'framer-motion'
import { Home, History, Settings, Battery } from 'lucide-react'

interface BottomNavbarProps {
  activeTab: 'home' | 'history' | 'settings'
  onTabChange: (tab: 'home' | 'history' | 'settings') => void
}

export function BottomNavbar({ activeTab, onTabChange }: BottomNavbarProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Accueil' },
    { id: 'history', icon: History, label: 'Historique' },
    { id: 'settings', icon: Settings, label: 'Réglages' },
  ] as const

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-xl border-t border-white/10 px-4 py-2 safe-area-pb">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center p-2 min-w-[60px]"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-blue-500/20 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  color: isActive ? '#3b82f6' : '#94a3b8'
                }}
                transition={{ duration: 0.2 }}
                className="relative z-10"
              >
                <Icon className="w-6 h-6 mb-1" />
              </motion.div>
              
              <span 
                className={`text-xs relative z-10 transition-colors duration-200 ${
                  isActive ? 'text-blue-400 font-medium' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
