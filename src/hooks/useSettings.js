import { useEffect, useRef, useState } from 'react';

const KEY = 'kitchenvoice_settings_v1';

export const DEFAULT_SETTINGS = {
  profile: null, // 'instinct' | 'disabled' | 'home'
  fontScale: 18,
  highContrast: false,
  voiceOnly: false,
  switchAccess: false,
  wakeWord: 'Hey Kitchen',
  ttsRate: 1,
  onboarded: false
};

export function loadSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(KEY) || '{}') };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function useSettings() {
  const [settings, setSettings] = useState(loadSettings);
  const first = useRef(true);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings));
    document.documentElement.style.fontSize = settings.fontScale + 'px';
    document.documentElement.classList.toggle('hc', !!settings.highContrast);
    document.documentElement.classList.toggle('voice-only', !!settings.voiceOnly);
    document.documentElement.classList.toggle('switch-access', !!settings.switchAccess);
  }, [settings]);

  const update = (patch) => setSettings((s) => ({ ...s, ...patch }));
  return { settings, update, setSettings };
}