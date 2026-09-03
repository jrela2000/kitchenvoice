import { useEffect, useState } from 'react';
import { Volume2, Eye, Type, SwitchCamera, Mic, Gauge, Crown, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useSettings } from '@/hooks/useSettings';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';

export default function Settings() {
  const { settings, update } = useSettings();
  const [count, setCount] = useState(0);

  useEffect(() => {
    (async () => {
      try { const res = await base44.entities.Recipe.list('-updated_date', 100); setCount((res || []).length); } catch {}
    })();
  }, []);

  const voice = useVoiceAssistant({
    alwaysOn: settings.voiceOnly,
    wakeWord: settings.wakeWord,
    onCommand: (cmd) => {
      if (cmd.command === 'home') window.history.back();
    }
  });

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-5 py-6">
      <h1 className="font-heading text-3xl font-extrabold">Settings</h1>

      <section className="mt-6">
        <h2 className="mb-2 text-lg font-bold">Accessibility</h2>
        <div className="grid gap-3">
          <Toggle icon={Volume2} label="Voice only" desc="Zero-touch navigation" on={settings.voiceOnly} onClick={() => update({ voiceOnly: !settings.voiceOnly })} />
          <Toggle icon={Eye} label="High contrast" desc="Bold colors everywhere" on={settings.highContrast} onClick={() => update({ highContrast: !settings.highContrast })} />
          <Toggle icon={SwitchCamera} label="Switch access" desc="Two-input navigation" on={settings.switchAccess} onClick={() => update({ switchAccess: !settings.switchAccess })} />
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2"><Type size={20} /> <span className="font-semibold">Text size: {settings.fontScale}px</span></div>
            <input type="range" min={18} max={28} step={2} value={settings.fontScale} onChange={(e) => update({ fontScale: Number(e.target.value) })} className="mt-3 w-full accent-primary" />
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2"><Gauge size={20} /> <span className="font-semibold">Voice speed: {settings.ttsRate.toFixed(1)}x</span></div>
            <input type="range" min={0.6} max={1.4} step={0.1} value={settings.ttsRate} onChange={(e) => update({ ttsRate: Number(e.target.value) })} className="mt-3 w-full accent-primary" />
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-lg font-bold flex items-center gap-2"><Mic size={18} /> Wake word</h2>
        <div className="grid grid-cols-3 gap-2">
          {['Hey Kitchen', 'Hey Chef', 'Okay Kitchen'].map((w) => (
            <button key={w} onClick={() => update({ wakeWord: w })} className={`min-h-[52px] rounded-2xl border text-sm font-semibold ${settings.wakeWord === w ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>{w}</button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-lg font-bold flex items-center gap-2"><Crown size={18} /> Plan</h2>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="font-semibold">Free tier</p>
          <p className="text-sm text-muted-foreground">{count} / 10 saved recipes used</p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border"><div className="h-full bg-primary" style={{ width: `${Math.min(100, (count / 10) * 100)}%` }} /></div>
        </div>
        <div className="mt-3 grid gap-2">
          <Tier name="Chef Mode" price="$6.99/mo" features="Unlimited recipes · Meal planning · Offline · Ad-free" />
          <Tier name="Culinary Pro" price="$14.99/mo" features="Batch scaling · Nutrition · Priority voice" />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Upgrade to enable payments and unlock these tiers.</p>
      </section>

      <button
        onClick={() => { update({ onboarded: false }); window.location.href = '/onboarding'; }}
        className="mt-6 flex w-full min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-border font-semibold text-muted-foreground"
      >
        <LogOut size={18} /> Redo onboarding
      </button>
    </div>
  );
}

function Toggle({ icon: Icon, label, desc, on, onClick }) {
  return (
    <button onClick={onClick} className={`flex min-h-[64px] items-center gap-3 rounded-2xl border px-4 text-left ${on ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
      <Icon size={22} />
      <span className="flex-1"><span className="block font-semibold">{label}</span><span className="block text-sm text-muted-foreground">{desc}</span></span>
      <span className={`h-7 w-12 rounded-full p-1 transition ${on ? 'bg-primary' : 'bg-muted'}`}><span className={`block h-5 w-5 rounded-full bg-white transition ${on ? 'translate-x-5' : ''}`} /></span>
    </button>
  );
}

function Tier({ name, price, features }) {
  return (
    <div className="rounded-2xl border border-border p-4">
      <div className="flex items-center justify-between"><span className="font-bold">{name}</span><span className="font-bold text-primary">{price}</span></div>
      <p className="mt-1 text-sm text-muted-foreground">{features}</p>
    </div>
  );
}