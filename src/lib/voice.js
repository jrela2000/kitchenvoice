// Web Speech API helpers: recognition (STT) + synthesis (TTS) + command parsing.

// Mic / speech recognition is temporarily disabled. Spoken readback (TTS) still works.
export const VOICE_RECOGNITION_ENABLED = false;

export function speechSupported() {
  return VOICE_RECOGNITION_ENABLED && typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function ttsSupported() {
  return typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined';
}

export function getSpeechRecognition() {
  if (!VOICE_RECOGNITION_ENABLED) return null;
  if (typeof window === 'undefined') return null;
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  return SR ? new SR() : null;
}

let _warmed = false;
export function warmVoices() {
  if (!ttsSupported() || _warmed) return;
  _warmed = true;
  const trigger = () => window.speechSynthesis.getVoices();
  trigger();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = trigger;
  }
}

export function speak(text, { onEnd, onStart, rate = 1, pitch = 1 } = {}) {
  if (!ttsSupported() || !text) {
    onEnd?.();
    return null;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = rate;
  u.pitch = pitch;
  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((v) => /en[-_]US/i.test(v.lang) && /female|samantha|zira|jenny/i.test(v.name)) ||
    voices.find((v) => /en[-_]US/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang));
  if (preferred) u.voice = preferred;
  if (onStart) u.onstart = onStart;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);
  return u;
}

export function stopSpeaking() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

const SEL_MAP = {
  first: 0, '1st': 0, one: 0, '1': 0,
  second: 1, '2nd': 1, two: 1, '2': 1,
  third: 2, '3rd': 2, three: 2, '3': 2
};

export function parseCommand(rawText, wakeWord = 'Hey Kitchen') {
  let t = (rawText || '').toLowerCase().trim().replace(/[.!?，]/g, '');
  const ww = (wakeWord || 'hey kitchen').toLowerCase().trim();
  if (ww && t.includes(ww)) t = t.replace(ww, ' ').trim();
  t = t.replace(/^hey\s+kitchen[\s,]*/, '').replace(/^kitchen[\s,]*/, '').trim();
  if (!t) return { command: 'wake', arg: null, raw: rawText };

  const sel = t.match(/(?:open|choose|select|pick|go to|show)\s+(?:the\s+)?(first|second|third|1st|2nd|3rd|one|two|three|1|2|3)/);
  if (sel) return { command: 'select', arg: SEL_MAP[sel[1]] ?? null, raw: t };

  if (/\b(convert|conversion)\b/.test(t)) return { command: 'convert', arg: t, raw: t };
  const searchMatch = t.match(/(?:search\s+(?:for\s+)?|find\s+(?:me\s+)?|look\s+for\s+|show\s+me\s+(?:recipes?\s+(?:for\s+)?)?)(.+)/);
  if (searchMatch && searchMatch[1]) return { command: 'search', arg: searchMatch[1].trim(), raw: t };
  if (/^(recipe\s+for\s+|cook\s+)\b/.test(t)) return { command: 'search', arg: t.replace(/^(recipe\s+for\s+|cook\s+)/, '').trim(), raw: t };

  if (/\b(next|continue|go on|forward|advance|move on)\b/.test(t)) return { command: 'next', arg: null, raw: t };
  if (/\b(back|previous|go back|last step)\b/.test(t)) return { command: 'back', arg: null, raw: t };
  if (/\b(repeat|again|read (?:it )?again|say that again|read back)\b/.test(t)) return { command: 'repeat', arg: null, raw: t };
  if (/\b(resume|keep going|unpause|play)\b/.test(t)) return { command: 'resume', arg: null, raw: t };
  if (/\b(how long|how much time|time left|how much longer|what'?s the time)\b/.test(t)) return { command: 'time', arg: null, raw: t };
  if (/\b(start cooking|start|begin|let'?s cook|cook this)\b/.test(t)) return { command: 'start', arg: null, raw: t };
  if (/\b(save|save it|save recipe|save this)\b/.test(t)) return { command: 'save', arg: null, raw: t };
  if (/\b(finish|all done|end cooking|stop cooking|i'?m done)\b/.test(t)) return { command: 'finish', arg: null, raw: t };
  if (/\b(home|go home|main menu)\b/.test(t)) return { command: 'home', arg: null, raw: t };
  if (/\b(create|new recipe|record|narrate|make a recipe)\b/.test(t)) return { command: 'create', arg: null, raw: t };
  if (/\b(settings|accessibility|preferences)\b/.test(t)) return { command: 'settings', arg: null, raw: t };
  if (/\b(ingredients|read ingredients|what do i need|shopping)\b/.test(t)) return { command: 'ingredients', arg: null, raw: t };
  if (/\b(pause|stop|hold on|wait)\b/.test(t)) return { command: 'pause', arg: null, raw: t };

  return { command: 'unknown', arg: t, raw: t };
}