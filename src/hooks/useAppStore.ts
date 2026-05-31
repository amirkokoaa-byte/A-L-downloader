import { useState, useEffect } from 'react';
import { Settings, getSettings, saveSettings } from '../lib/db';

export function useAppStore() {
  const [settings, setSettings] = useState<Settings>({
    id: 'user_settings',
    darkMode: true,
    lockEnabled: false,
    passcode: null,
    notificationsEnabled: true,
  });
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const s = await getSettings();
      setSettings(s);
      if (s.lockEnabled && s.passcode) {
        setIsLocked(true);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await saveSettings(updated);
    
    if (updated.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const unlock = (code: string) => {
    if (settings.passcode === code) {
      setIsLocked(false);
      return true;
    }
    return false;
  };

  const lock = () => {
    if (settings.lockEnabled && settings.passcode) {
      setIsLocked(true);
    }
  };

  return { settings, updateSettings, isLocked, unlock, lock, isLoading };
}
