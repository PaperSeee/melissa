"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { StorageManager, type ChargeRecord } from '@/lib/storage'
import { Battery, TrendingUp, Calendar, Clock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HistoryTab() {
  const [history, setHistory] = useState<ChargeRecord[]>([])
  const [stats, setStats] = useState({
    totalCharges: 0,
    thisWeek: 0,
    avgPerDay: 0,
    longestStreak: 0
  })

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = () => {
    const records = StorageManager.getChargeHistory()
    setHistory(records)
    calculateStats(records)
  }

  const calculateStats = (records: ChargeRecord[]) => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const thisWeek = records.filter(record => 
      new Date(record.timestamp) > weekAgo
    ).length

    const avgPerDay = records.length > 0 ? records.length / 30 : 0

    setStats({
      totalCharges: records.length,
      thisWeek,
      avgPerDay: Math.round(avgPerDay * 10) / 10,
      longestStreak: calculateStreak(records)
    })
  }

  const calculateStreak = (records: ChargeRecord[]): number => {
    if (records.length === 0) return 0
    
    // Fix: Use Array.from() instead of spread operator for older TypeScript compatibility
    const uniqueDates = new Set(records.map(r => r.date))
    const dates = Array.from(uniqueDates).sort().reverse()
    let streak = 0
    let currentDate = new Date()
    
    for (const date of dates) {
      const recordDate = new Date(date)
      const diffDays = Math.floor((currentDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays <= streak + 1) {
        streak++
        currentDate = recordDate
      } else {
        break
      }
    }
    
    return streak
  }

  const clearHistory = () => {
    if (confirm('Supprimer tout l\'historique ?')) {
      StorageManager.clearHistory()
      loadHistory()
    }
  }

  const groupedHistory = history.reduce((groups, record) => {
    const date = record.date
    if (!groups[date]) groups[date] = []
    groups[date].push(record)
    return groups
  }, {} as Record<string, ChargeRecord[]>)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    
    if (dateStr === today.toISOString().split('T')[0]) return "Aujourd'hui"
    if (dateStr === yesterday.toISOString().split('T')[0]) return "Hier"
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Historique</h1>
        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearHistory}
            className="text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-slate-400 text-sm">Total</p>
              <p className="text-white text-2xl font-bold">{stats.totalCharges}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-slate-400 text-sm">Cette semaine</p>
              <p className="text-white text-2xl font-bold">{stats.thisWeek}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-slate-400 text-sm">Moy/jour</p>
              <p className="text-white text-2xl font-bold">{stats.avgPerDay}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center space-x-2">
            <Battery className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-slate-400 text-sm">Série</p>
              <p className="text-white text-2xl font-bold">{stats.longestStreak}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Historique */}
      <div className="bg-white/5 rounded-2xl border border-white/10">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Charges récentes</h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Battery className="w-12 h-12 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400">Aucune charge enregistrée</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {Object.entries(groupedHistory).map(([date, records]) => (
                <div key={date}>
                  <h4 className="text-sm font-medium text-blue-400 mb-2 sticky top-0 bg-slate-900/80 backdrop-blur-sm py-1">
                    {formatDate(date)}
                  </h4>
                  <div className="space-y-2">
                    {records.map((record, index) => (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                          <div>
                            <p className="text-white font-medium">{record.time}</p>
                            {record.batteryLevel && (
                              <p className="text-slate-400 text-sm">
                                Batterie: {record.batteryLevel}%
                              </p>
                            )}
                          </div>
                        </div>
                        <Battery className="w-5 h-5 text-green-400" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
