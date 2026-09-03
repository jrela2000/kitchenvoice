import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Pause, Play, Repeat, Home, Timer as TimerIcon, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useSettings } from '@/hooks/useSettings';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import StepView from '@/components/kitchen/StepView';
import TimerBanner from '@/components/kitchen/TimerBanner';
import ConversionPanel from '@/components/kitchen/ConversionPanel';
import CommandBar from '@/components/kitchen/CommandBar';
import { parseConversion, parseStepTime } from '@/lib/convert';

export default function Cooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [conv, setConv] = useState(null);

  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  useEffect(() => { indexRef.current = index; }, [index]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    (async () => {
      try {
        const r = await base44.entities.Recipe.get(id);
        setRecipe(r);
      } catch {
        setRecipe(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const steps = recipe?.steps || [];
  const total = steps.length;

  const speakStep = useCallback((voice, i) => {
    if (!steps[i]) return;
    voice.speak(`Step ${i + 1}. ${steps[i]}.`, {
      onEnd: () => {
        const secs = parseStepTime(steps[i]);
        if (secs) { setTimerSec(secs); setTimerActive(true); }
      }
    });
  }, [steps]);

  const onCommand = useCallback((cmd) => {
    switch (cmd.command) {
      case 'next':
        setIndex((i) => {
          if (i >= total - 1) { voiceRef.current?.speak("You're done. Great cooking!"); return i; }
          const n = i + 1;
          speakStep(voiceRef.current, n);
          return n;
        });
        setTimerActive(false); setTimerSec(0);
        break;
      case 'back':
        setIndex((i) => { const n = Math.max(0, i - 1); speakStep(voiceRef.current, n); return n; });
        setTimerActive(false); setTimerSec(0);
        break;
      case 'repeat':
        speakStep(voiceRef.current, indexRef.current);
        break;
      case 'pause':
        setPaused(true); setTimerActive(false); voiceRef.current?.stopSpeaking();
        voiceRef.current?.speak('Paused.');
        break;
      case 'resume':
        setPaused(false);
        voiceRef.current?.speak('Resuming.'); 
        setTimerActive(timerSec > 0);
        speakStep(voiceRef.current, indexRef.current);
        break;
      case 'time': {
        if (timerActive && timerSec > 0) voiceRef.current?.speak(`${timerSec} seconds left on the timer.`);
        else voiceRef.current?.speak(`You're on step ${indexRef.current + 1} of ${total}.`);
        break;
      }
      case 'convert': {
        const res = parseConversion(cmd.arg);
        setConv(res);
        if (res && !res.error) voiceRef.current?.speak(res.spoken);
        else if (res?.error) voiceRef.current?.speak(res.message);
        break;
      }
      case 'ingredients':
        voiceRef.current?.speak(`You will need: ${(recipe?.ingredients || []).join(', ')}`);
        break;
      case 'finish':
      case 'home':
        voiceRef.current?.stopSpeaking();
        navigate('/');
        break;
      case 'unknown':
      default:
        break;
    }
  }, [total, recipe, timerActive, timerSec, navigate, speakStep]);

  const voice = useVoiceAssistant({
    alwaysOn: true,
    wakeWord: settings.wakeWord,
    ttsRate: settings.ttsRate,
    onCommand
  });
  const voiceRef = useRef(voice);
  useEffect(() => { voiceRef.current = voice; }, [voice]);

  // Intro on load
  useEffect(() => {
    if (!loading && recipe && steps.length) {
      const t = setTimeout(() => {
        voiceRef.current?.speak(`Let's cook ${recipe.title}. ${steps.length} steps. ${steps[0]}`, {
          onEnd: () => {
            const secs = parseStepTime(steps[0]);
            if (secs) { setTimerSec(secs); setTimerActive(true); }
          }
        });
      }, 400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, recipe]);

  // Timer tick
  useEffect(() => {
    if (!timerActive) return;
    const t = setInterval(() => {
      setTimerSec((s) => {
        if (s <= 1) {
          setTimerActive(false);
          voiceRef.current?.speak('Timer is done.');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [timerActive]);

  const goNext = () => onCommand({ command: 'next' });
  const goBack = () => onCommand({ command: 'back' });

  if (loading) return <div className="flex flex-1 items-center justify-center text-muted-foreground">Loading recipe…</div>;
  if (!recipe) return <div className="flex flex-1 flex-col items-center justify-center gap-3"><p>Recipe not found.</p><button onClick={() => navigate('/')} className="font-semibold text-primary">Home</button></div>;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold truncate">{recipe.title}</h2>
        <button onClick={() => { voice.stopSpeaking(); navigate('/'); }} className="rounded-full p-2 hover:bg-accent" aria-label="Exit cooking"><X size={24} /></button>
      </div>

      <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-border">
        <motion.div className="h-full bg-primary" animate={{ width: `${((index + 1) / total) * 100}%` }} transition={{ duration: 0.4 }} />
      </div>

      <TimerBanner
        seconds={timerSec}
        active={timerActive}
        onPause={() => setTimerActive(false)}
        onResume={() => setTimerActive(true)}
        onClear={() => { setTimerActive(false); setTimerSec(0); }}
      />

      <ConversionPanel result={conv} onSpeak={(t) => voice.speak(t)} />

      <div className="flex-1 flex items-center">
        <StepView step={steps[index]} index={index} total={total} />
      </div>

      <div className="mt-4">
        <CommandBar
          interim={voice.interim}
          lastHeard={voice.lastHeard}
          listening={voice.listening}
          hint={paused ? 'Paused — say “resume”' : 'Say “next”, “repeat”, “how long”, or “convert”'}
        />
        {voice.error && <p className="text-center text-sm text-destructive">{voice.error}</p>}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <BigBtn icon={ArrowLeft} label="Back" onClick={goBack} />
        <BigBtn icon={Repeat} label="Repeat" onClick={() => speakStep(voice, index)} />
        {paused ? (
          <BigBtn icon={Play} label="Resume" onClick={() => onCommand({ command: 'resume' })} primary />
        ) : (
          <BigBtn icon={Pause} label="Pause" onClick={() => onCommand({ command: 'pause' })} primary />
        )}
        <BigBtn icon={ArrowRight} label="Next" onClick={goNext} primary />
      </div>
    </div>
  );
}

function BigBtn({ icon: Icon, label, onClick, primary }) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl text-sm font-semibold ${primary ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}
    >
      <Icon size={22} />
      {label}
    </button>
  );
}