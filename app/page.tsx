"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Smartphone, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BottomNavbar } from '@/components/bottom-navbar'
import { BatteryInput } from '@/components/battery-input'
import { HistoryTab } from '@/components/history-tab'
import { StorageManager } from '@/lib/storage'
import { NotificationManager } from '@/lib/notifications'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'settings'>('home')
  const [notifications, setNotifications] = useState(true)
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null)
  const [lastCharged, setLastCharged] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Timer pour l'heure
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)

    // Timer pour la simulation de batterie (toutes les minutes)
    const batteryTimer = setInterval(() => {
      NotificationManager.simulateBatteryDrain();
      // Mettre à jour l'affichage de la batterie
      const newLevel = StorageManager.getCurrentBatteryLevel();
      if (newLevel !== null) {
        setBatteryLevel(newLevel);
      }
    }, 60000); // Toutes les minutes

    // Charger les paramètres
    const settings = StorageManager.getSettings();
    setNotifications(settings.notifications);
    setLastCharged(settings.lastCharged || null);

    // Setup notifications
    NotificationManager.requestPermission();
    NotificationManager.scheduleReminders();

    // Obtenir le niveau de batterie (depuis le cache ou l'API)
    NotificationManager.getBatteryLevel().then(level => {
      if (level !== null) setBatteryLevel(level);
    });

    return () => {
      clearInterval(timer);
      clearInterval(batteryTimer);
    };
  }, [])

  const handleMarkAsCharged = async () => {
    const record = StorageManager.addChargeRecord(batteryLevel || undefined);
    StorageManager.updateSettings({ lastCharged: new Date().toISOString() });
    setLastCharged(new Date().toISOString());
    
    // Remettre la batterie à 100% lors de la charge
    if (batteryLevel !== null) {
      const newLevel = Math.min(100, (batteryLevel || 0) + Math.random() * 20 + 10); // Charge de 10-30%
      StorageManager.setCurrentBatteryLevel(Math.round(newLevel));
      setBatteryLevel(Math.round(newLevel));
    }
  }

  const toggleNotifications = (enabled: boolean) => {
    setNotifications(enabled)
    StorageManager.updateSettings({ notifications: enabled })
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6 pb-24">
            {/* Header avec heure */}
            <div className="text-center mb-8">
              <motion.div
                key={currentTime.getMinutes()}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                className="text-5xl font-light text-white mb-2"
              >
                {currentTime.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </motion.div>
              <div className="text-slate-400">
                {currentTime.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </div>
            </div>

            {/* Greeting Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 text-white"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Salut Melissa ! 👋</h1>
                  <p className="text-blue-100">Prête à gérer ta batterie ?</p>
                </div>
              </div>
            </motion.div>

            {/* Battery Status */}
            <BatteryInput
              batteryLevel={batteryLevel}
              onBatteryChange={setBatteryLevel}
            />

            {/* Last Charged Info */}
            {lastCharged && (
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Dernière charge</p>
                    <p className="text-slate-400 text-sm">
                      {new Date(lastCharged).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <motion.div
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleMarkAsCharged}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-2xl py-6 text-lg font-semibold shadow-lg"
              >
                <Zap className="w-6 h-6 mr-3" />
                Marquer comme chargé
              </Button>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-slate-400 text-sm">Cette semaine</p>
                    <p className="text-white text-xl font-semibold">
                      {StorageManager.getChargeHistory().filter(r => 
                        new Date(r.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      ).length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${notifications ? 'bg-green-400' : 'bg-red-400'}`} />
                  <div>
                    <p className="text-slate-400 text-sm">Notifications</p>
                    <p className="text-white text-xl font-semibold">
                      {notifications ? 'ON' : 'OFF'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'history':
        return <div className="pb-24"><HistoryTab /></div>

      case 'settings':
        return (
          <div className="space-y-6 pb-24">
            <h1 className="text-2xl font-bold text-white mb-6">Réglages</h1>
            
            <div className="bg-white/5 rounded-2xl border border-white/10">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Notifications</h3>
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Rappels de charge</p>
                    <p className="text-slate-400 text-sm">
                      Recevoir des notifications automatiques
                    </p>
                  </div>
                  <button
                    onClick={() => toggleNotifications(!notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications ? 'bg-blue-500' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">À propos</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Version</span>
                  <span className="text-white">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Type</span>
                  <span className="text-white">PWA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Stockage</span>
                  <span className="text-white">Local</span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container max-w-md mx-auto px-4 pt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNavbar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
