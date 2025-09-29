"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Battery, Edit3, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StorageManager } from '@/lib/storage'

interface BatteryInputProps {
  batteryLevel: number | null
  onBatteryChange: (level: number) => void
}

export function BatteryInput({ batteryLevel, onBatteryChange }: BatteryInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(batteryLevel?.toString() || '50')

  const handleSave = () => {
    const level = parseInt(inputValue)
    if (level >= 0 && level <= 100) {
      onBatteryChange(level)
      // Sauvegarder dans le cache
      StorageManager.setCurrentBatteryLevel(level)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setInputValue(batteryLevel?.toString() || '50')
    setIsEditing(false)
  }

  const getBatteryColor = (level: number) => {
    if (level <= 20) return 'text-red-500'
    if (level <= 50) return 'text-orange-500'
    return 'text-green-500'
  }

  const getBatteryIcon = (level: number) => {
    return <Battery className={`w-8 h-8 ${getBatteryColor(level)}`} />
  }

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Batterie actuelle</h3>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-slate-400 hover:text-white p-2"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center justify-center space-x-4">
        {batteryLevel && getBatteryIcon(batteryLevel)}
        
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              max="100"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center focus:outline-none focus:border-blue-500"
              autoFocus
            />
            <span className="text-white">%</span>
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 p-2"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-slate-400 hover:text-white p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <motion.div
              key={batteryLevel}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-4xl font-bold ${batteryLevel ? getBatteryColor(batteryLevel) : 'text-slate-400'}`}
            >
              {batteryLevel || '--'}%
            </motion.div>
            <p className="text-sm text-slate-400 mt-1">Toucher pour modifier</p>
          </div>
        )}
      </div>
    </div>
  )
}
