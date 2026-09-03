import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Accessibility, ChefHat, Volume2, Type, Eye, SwitchCamera, Mic } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import VoiceOrb from '@/components/kitchen/VoiceOrb';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { speechSupported } from '@/lib/voice';

const PROFILES = [
  { id: 'instinct', label: 'Instinct Cook', desc: 'I cook by feel and technique', icon: Hand },
  { id: 'disabled', label: 'Disabled Chef', desc: 'I need hands-free & accessible tools', icon: Accessibility },
  { id: 'home', label: 'Home Cook', desc: 'I want a smart voice helper', icon: ChefHat }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { settings, update } = useSettings();
  const [step, setStep] = useState(0);
  const [tutCmd, setTutCmd] = useState('');

  const voice = useVoiceAssistant({
    alwaysOn: true,
    wakeWord: settings.wakeWord,
    onCommand: (cmd) => {
      setTutCmd(cmd.command);
      if (cmd.command === 'next') setStep((s) => Math.min(s + 1, 4));
      if (cmd.command === 'back') setStep((s) => Math.max(s - 1, 0));
      if (cmd.command === 'home' || cmd.command === 'finish') finish();
    }
  });

  useEffect(() => {
    if (step === 3 && speechSupported()) voice.speak('Say Hey Kitchen, then try saying next.');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const finish = () => {
    update({ onboarded: true });
    navigate('/');
  };

  const steps = [
    // 0 profile
    {
      node: (
        <>
          <h1 className="font-heading text-4xl font-extrabold">Welcome to KitchenVoice</h1>
          <p className="mt-2 text-lg text-muted-foreground">Cook by voice, not by reading. How do you cook best?</p>
          <div className="mt-6 grid gap-3">
            {PROFILES.map((p) => (
              <button
                key={p.id}
                onClick={() => { update({ profile: p.id }); setStep(1); }}
                className="flex min-h-[72px] items-center gap-4 rounded-2xl border border-border bg-card px-4 text-left hover:border-primary hover:shadow-md transition"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <p.icon size={26} />
                </span>
                <span>
                  <span className="block text-xl font-bold">{p.label}</span>
                  <span className="block text-sm text-muted-foreground">{p.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </>
      )
    },
    // 1 accessibility
    {
      node: (
        <>
          <h1 className="font-heading text-3xl font-extrabold">Accessibility</h1>
          <p className="mt-2 text-lg text-muted-foreground">Set up your kitchen. Toggle what you need.</p>
          <div className="mt-6 grid gap-3">
            <Toggle icon={Volume2} label="Voice only" desc="Navigate with zero touch" on={settings.voiceOnly} onClick={() => update({ voiceOnly: !settings.voiceOnly })} />
            <Toggle icon={Eye} label="High contrast" desc="Bold colors on every screen" on={settings.highContrast} onClick={() => update({ highContrast: !settings.highContrast })} />
            <Toggle icon={SwitchCamera} label="Switch access" desc="Two-input navigation" on={settings.switchAccess} onClick={() => update({ switchAccess: !settings.switchAccess })} />
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2"><Type size={20} /> <span className="font-semibold">Text size: {settings.fontScale}px</span></div>
              <input type="range" min={18} max={28} step={2} value={settings.fontScale} onChange={(e) => update({ fontScale: Number(e.target.value) })} className="mt-3 w-full accent-primary" />
            </div>
          </div>
          <button onClick={() => setStep(2)} className="mt-6 w-full min-h-[56px] rounded-2xl bg-primary text-primary-foreground text-lg font-bold">Continue</button>
        </>
      )
    },
    // 2 wake word
    {
      node: (
        <>
          <h1 className="font-heading text-3xl font-extrabold">Your wake word</h1>
          <p className="mt-2 text-lg text-muted-foreground">Say this to get the assistant's attention.</p>
          <div className="mt-6 grid gap-3">
            {['Hey Kitchen', 'Hey Chef', 'Okay Kitchen'].map((w) => (
              <button
                key={w}
                onClick={() => update({ wakeWord: w })}
                className={`flex min-h-[64px] items-center gap-3 rounded-2xl border px-4 text-left text-xl font-semibold ${settings.wakeWord === w ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
              >
                <Mic size={22} /> {w}
              </button>
            ))}
          </div>
          <button onClick={() => setStep(3)} className="mt-6 w-full min-h-[56px] rounded-2xl bg-primary text-primary-foreground text-lg font-bold">Continue</button>
        </>
      )
    },
    // 3 tutorial
    {
      node: (
        <>
          <h1 className="font-heading text-3xl font-extrabold">Voice tutorial</h1>
          <p className="mt-2 text-lg text-muted-foreground">Try it. Say “{settings.wakeWord}, next”.</p>
          <div className="my-8 flex justify-center"><VoiceOrb listening={voice.listening} onClick={() => (voice.listening ? voice.stop() : voice.start())} size="lg" /></div>
          <div className="rounded-2xl bg-accent/50 p-4 text-center">
            <p className="text-lg">Heard: <span className="font-bold">{tutCmd || '—'}</span></p>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Commands: next · back · repeat · pause · how long · convert · finish</p>
          <button onClick={finish} className="mt-6 w-full min-h-[56px] rounded-2xl bg-primary text-primary-foreground text-lg font-bold">Start cooking</button>
        </>
      )
    }
  ];

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-6">
      <div className="mb-6 flex items-center gap-2">
        {steps.map((_, i) => (
          <span key={i} className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-primary' : 'bg-border'}`} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
          {steps[step].node}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Toggle({ icon: Icon, label, desc, on, onClick }) {
  return (
    <button onClick={onClick} className={`flex min-h-[64px] items-center gap-3 rounded-2xl border px-4 text-left ${on ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
      <Icon size={22} />
      <span className="flex-1">
        <span className="block font-semibold">{label}</span>
        <span className="block text-sm text-muted-foreground">{desc}</span>
      </span>
      <span className={`h-7 w-12 rounded-full p-1 transition ${on ? 'bg-primary' : 'bg-muted'}`}>
        <span className={`block h-5 w-5 rounded-full bg-white transition ${on ? 'translate-x-5' : ''}`} />
      </span>
    </button>
  );
}