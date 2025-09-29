export interface ChargeRecord {
  id: string;
  date: string;
  time: string;
  timestamp: number;
  batteryLevel?: number;
}

export interface AppSettings {
  notifications: boolean;
  reminderInterval: number; // en minutes
  lastCharged?: string;
}

const STORAGE_KEYS = {
  CHARGE_HISTORY: 'charge-history',
  SETTINGS: 'app-settings',
  LAST_NOTIFICATION: 'last-notification'
} as const;

export class StorageManager {
  static getChargeHistory(): ChargeRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const history = localStorage.getItem(STORAGE_KEYS.CHARGE_HISTORY);
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  }

  static addChargeRecord(batteryLevel?: number): ChargeRecord {
    const now = new Date();
    const record: ChargeRecord = {
      id: crypto.randomUUID(),
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      timestamp: now.getTime(),
      batteryLevel
    };

    const history = this.getChargeHistory();
    history.unshift(record); // Ajouter au début
    
    // Garder seulement les 100 derniers enregistrements
    if (history.length > 100) {
      history.splice(100);
    }

    localStorage.setItem(STORAGE_KEYS.CHARGE_HISTORY, JSON.stringify(history));
    return record;
  }

  static getSettings(): AppSettings {
    if (typeof window === 'undefined') return { notifications: true, reminderInterval: 360 };
    try {
      const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : { notifications: true, reminderInterval: 360 };
    } catch {
      return { notifications: true, reminderInterval: 360 };
    }
  }

  static updateSettings(settings: Partial<AppSettings>): void {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  }

  static getLastNotificationTime(): number {
    if (typeof window === 'undefined') return 0;
    return parseInt(localStorage.getItem(STORAGE_KEYS.LAST_NOTIFICATION) || '0');
  }

  static setLastNotificationTime(timestamp: number): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.LAST_NOTIFICATION, timestamp.toString());
  }

  static clearHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.CHARGE_HISTORY);
  }
}
