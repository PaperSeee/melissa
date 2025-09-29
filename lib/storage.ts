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
  currentBatteryLevel?: number;
  lastBatteryUpdate?: number;
}

const STORAGE_KEYS = {
  CHARGE_HISTORY: 'charge-history',
  SETTINGS: 'app-settings',
  LAST_NOTIFICATION: 'last-notification',
  BATTERY_LEVEL: 'current-battery-level'
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
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    }
  }

  static getCurrentBatteryLevel(): number | null {
    if (typeof window === 'undefined') return null;
    try {
      const batteryData = localStorage.getItem(STORAGE_KEYS.BATTERY_LEVEL);
      if (!batteryData) return null;
      
      const { level, timestamp } = JSON.parse(batteryData);
      const now = Date.now();
      const hoursPassed = (now - timestamp) / (1000 * 60 * 60);
      
      // Simuler une baisse de batterie : 3-7% par heure selon l'usage
      const batteryDrain = Math.random() * 4 + 3; // Entre 3% et 7% par heure
      const simulatedLevel = Math.max(0, level - (hoursPassed * batteryDrain));
      
      return Math.round(simulatedLevel);
    } catch {
      return null;
    }
  }

  static setCurrentBatteryLevel(level: number): void {
    if (typeof window === 'undefined') return;
    const batteryData = {
      level,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.BATTERY_LEVEL, JSON.stringify(batteryData));
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
