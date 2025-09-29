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
    try {
      // @ts-ignore - Battery API n'est pas typée
      if ('getBattery' in navigator) {
        // @ts-ignore
        const battery = await navigator.getBattery();
        return Math.round(battery.level * 100);
      }
    } catch (error) {
      console.warn('Impossible d\'accéder au niveau de batterie:', error);
    }
    return null;
  }
}
       