import { StorageManager } from './storage';

export class NotificationManager {
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Ce navigateur ne supporte pas les notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  static async showChargeReminder(): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    const settings = StorageManager.getSettings();
    if (!settings.notifications) return;

    // Vérifier si on a déjà envoyé une notification récemment
    const lastNotification = StorageManager.getLastNotificationTime();
    const now = Date.now();
    const timeSinceLastNotification = now - lastNotification;
    const minInterval = 30 * 60 * 1000; // 30 minutes minimum entre notifications

    if (timeSinceLastNotification < minInterval) {
      return;
    }

    const notification = new Notification('💡 Melissa, pense à charger !', {
      body: 'Il est temps de brancher ton téléphone pour éviter la panne de batterie.',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'charge-reminder',
      requireInteraction: true
    });

    StorageManager.setLastNotificationTime(now);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  static scheduleReminders(): void {
    const settings = StorageManager.getSettings();
    if (!settings.notifications) return;

    // Programmer les rappels toutes les X minutes
    setInterval(() => {
      this.showChargeReminder();
    }, settings.reminderInterval * 60 * 1000);
  }

  static async getBatteryLevel(): Promise<number | null> {
    // D'abord essayer de récupérer depuis le cache
    const cachedLevel = StorageManager.getCurrentBatteryLevel();
    if (cachedLevel !== null) {
      return cachedLevel;
    }

    // Sinon essayer l'API Battery (si disponible)
    try {
      // @ts-ignore - Battery API n'est pas typée
      if ('getBattery' in navigator) {
        // @ts-ignore
        const battery = await navigator.getBattery();
        const level = Math.round(battery.level * 100);
        StorageManager.setCurrentBatteryLevel(level);
        return level;
      }
    } catch (error) {
      console.warn('Impossible d\'accéder au niveau de batterie:', error);
    }

    // Valeur par défaut si aucune source disponible
    const defaultLevel = 75;
    StorageManager.setCurrentBatteryLevel(defaultLevel);
    return defaultLevel;
  }

  static simulateBatteryDrain(): void {
    const currentLevel = StorageManager.getCurrentBatteryLevel();
    if (currentLevel !== null && currentLevel > 0) {
      // Simuler une petite baisse (0.5% à 2% toutes les minutes)
      const drain = Math.random() * 1.5 + 0.5;
      const newLevel = Math.max(0, currentLevel - drain);
      StorageManager.setCurrentBatteryLevel(Math.round(newLevel));
    }
  }
}
