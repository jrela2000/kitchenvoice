import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getSpeechRecognition,
  speechSupported,
  speak as ttsSpeak,
  stopSpeaking,
  parseCommand,
  warmVoices
} from '@/lib/voice';

// Central voice assistant hook.
// onCommand(cmd, rawText) is called for every recognized utterance.
// alwaysOn: keep listening (wake-word style). push: listen until silence then stop.
export function useVoiceAssistant({ onCommand, wakeWord = 'Hey Kitchen', alwaysOn = false, enabled = true, ttsRate = 1 }) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [lastHeard, setLastHeard] = useState('');
  const [error, setError] = useState('');
  const supported = speechSupported();

  const recRef = useRef(null);
  const onCommandRef = useRef(onCommand);
  const wakeRef = useRef(wakeWord);
  const alwaysOnRef = useRef(alwaysOn);
  const enabledRef = useRef(enabled);
  const rateRef = useRef(ttsRate);
  const manualStopRef = useRef(false);
  const speakingRef = useRef(false);
  const runningRef = useRef(false);
  const lastStartRef = useRef(0);

  useEffect(() => { onCommandRef.current = onCommand; }, [onCommand]);
  useEffect(() => { wakeRef.current = wakeWord; }, [wakeWord]);
  useEffect(() => { alwaysOnRef.current = alwaysOn; }, [alwaysOn]);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);
  useEffect(() => { rateRef.current = ttsRate; }, [ttsRate]);

  useEffect(() => { warmVoices(); }, []);

  const handleResult = useCallback((event) => {
    let finalText = '';
    let interimText = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const r = event.results[i];
      if (r.isFinal) finalText += r[0].transcript;
      else interimText += r[0].transcript;
    }
    setInterim(interimText);
    if (finalText.trim()) {
      setLastHeard(finalText.trim());
      setInterim('');
      const cmd = parseCommand(finalText, wakeRef.current);
      onCommandRef.current?.(cmd, finalText.trim());
    }
  }, []);

  const start = useCallback(() => {
    if (!supported || !enabledRef.current) return;
    if (runningRef.current) return;
    const rec = getSpeechRecognition();
    if (!rec) return;
    recRef.current = rec;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onresult = handleResult;
    rec.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setError('Microphone access is blocked. Enable it in your browser settings.');
      } else if (e.error === 'no-speech') {
        // benign
      }
    };
    rec.onend = () => {
      runningRef.current = false;
      if (alwaysOnRef.current && enabledRef.current && !manualStopRef.current && !speakingRef.current) {
        // Keep "listening" steady across the restart gap so the orb and screen
        // readers don't re-announce a start/stop churn. Debounce so the mic
        // can't rapidly restart in a tight loop (which chimes on some devices).
        const sinceLast = Date.now() - lastStartRef.current;
        const delay = Math.max(250, 1500 - sinceLast);
        setTimeout(() => {
          if (alwaysOnRef.current && enabledRef.current && !manualStopRef.current && !speakingRef.current) start();
        }, delay);
      } else {
        setListening(false);
      }
    };
    manualStopRef.current = false;
    try {
      rec.start();
      runningRef.current = true;
      lastStartRef.current = Date.now();
      setListening(true);
      setError('');
    } catch {
      /* already started */
    }
  }, [supported, handleResult]);

  const stop = useCallback(() => {
    manualStopRef.current = true;
    runningRef.current = false;
    try { recRef.current?.stop(); } catch { /* noop */ }
    setListening(false);
  }, []);

  // Speak while pausing recognition, then resume if always-on.
  const speak = useCallback((text, opts = {}) => {
    if (!text) {
      opts.onEnd?.();
      return;
    }
    speakingRef.current = true;
    if (runningRef.current) {
      try { recRef.current?.stop(); } catch { /* noop */ }
      runningRef.current = false;
      setListening(false);
    }
    ttsSpeak(text, {
      rate: opts.rate ?? rateRef.current,
      onEnd: () => {
        speakingRef.current = false;
        opts.onEnd?.();
        if (alwaysOnRef.current && enabledRef.current && !manualStopRef.current) {
          setTimeout(() => start(), 300);
        }
      }
    });
  }, [start]);

  const stopSpeakingNow = useCallback(() => {
    stopSpeaking();
    speakingRef.current = false;
  }, []);

  useEffect(() => {
    if (!enabled) {
      stop();
      return;
    }
    if (alwaysOn && supported) start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alwaysOn, enabled, supported]);

  return { listening, interim, lastHeard, error, supported, start, stop, speak, stopSpeaking: stopSpeakingNow };
}