import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Square, Loader2, Save, Play, RotateCcw, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useSettings } from '@/hooks/useSettings';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import VoiceOrb from '@/components/kitchen/VoiceOrb';
import CommandBar from '@/components/kitchen/CommandBar';
import { foodEmoji, foodGradient } from '@/lib/food';

const FREE_LIMIT = 10;

export default function CreateRecipe() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [recording, setRecording] = useState(false);
  const [narration, setNarration] = useState('');
  const [structuring, setStructuring] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [gate, setGate] = useState(false);
  const [saved, setSaved] = useState(false);
  const [count, setCount] = useState(0);
  const chunksRef = useRef([]);

  useEffect(() => {
    (async () => {
      try { const res = await base44.entities.Recipe.list('-updated_date', 100); setCount((res || []).length); } catch {}
    })();
  }, []);

  const voice = useVoiceAssistant({
    alwaysOn: false,
    wakeWord: settings.wakeWord,
    onCommand: (cmd, raw) => {
      if (recording) {
        setNarration((n) => (n ? n + ' ' + raw : raw));
      }
      if (cmd.command === 'save' && recipe) handleSave();
      if (cmd.command === 'finish' && recording) stopRecording();
    }
  });

  const startRecording = () => {
    setRecipe(null);
    setNarration('');
    chunksRef.current = [];
    setRecording(true);
    voice.start();
    voice.speak('Recording. Tell me your recipe.');
  };

  const stopRecording = async () => {
    setRecording(false);
    voice.stop();
    const text = narration.trim();
    if (!text) return;
    setStructuring(true);
    try {
      const res = await base44.functions.invoke('structureRecipe', { narration: text });
      setRecipe(res.data?.recipe || null);
      if (res.data?.recipe) voice.speak(`I've structured your recipe: ${res.data.recipe.title}. Say save to keep it.`);
    } catch {
      voice.speak('Something went wrong structuring your recipe.');
    } finally {
      setStructuring(false);
    }
  };

  const handleSave = async () => {
    if (!recipe) return;
    if (count >= FREE_LIMIT) { setGate(true); return; }
    try {
      await base44.entities.Recipe.create({ ...recipe, source: 'created' });
      setSaved(true);
      voice.speak('Recipe saved.');
      setCount((c) => c + 1);
    } catch {
      voice.speak('Could not save.');
    }
  };

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-5 py-6">
      <h1 className="font-heading text-3xl font-extrabold">Create by voice</h1>
      <p className="mt-1 text-muted-foreground">Narrate your recipe freely. We'll structure it for you.</p>

      <div className="mt-6 flex flex-col items-center">
        <VoiceOrb
          listening={recording && voice.listening}
          onClick={() => (recording ? stopRecording() : startRecording())}
          size="lg"
          label={recording ? 'Tap to stop' : 'Tap to record'}
        />
        <CommandBar
          interim={voice.interim}
          lastHeard={recording ? narration.slice(-80) : voice.lastHeard}
          listening={recording}
          hint={recording ? 'Narrate your recipe…' : 'Tap the mic and start talking'}
        />
      </div>

      {structuring && (
        <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" /> Structuring your recipe…
        </div>
      )}

      {recipe && !structuring && (
        <div className="mt-6">
          <div className={`h-32 rounded-3xl bg-gradient-to-br ${foodGradient(recipe.title)} flex items-center justify-center`}>
            <span className="text-6xl">{foodEmoji(recipe.title)}</span>
          </div>
          <h2 className="mt-3 font-heading text-2xl font-bold">{recipe.title}</h2>
          <p className="text-muted-foreground">{recipe.description}</p>

          <div className="mt-4">
            <h3 className="font-bold mb-2">Ingredients</h3>
            <ul className="grid gap-1.5">{(recipe.ingredients || []).map((i, n) => (
              <li key={n} className="flex gap-2 rounded-lg bg-card border border-border px-3 py-2"><span className="text-primary">•</span><span>{i}</span></li>
            ))}</ul>
          </div>
          <div className="mt-4">
            <h3 className="font-bold mb-2">Steps</h3>
            <ol className="grid gap-1.5">{(recipe.steps || []).map((s, n) => (
              <li key={n} className="flex gap-3 rounded-lg bg-card border border-border p-3"><span className="font-bold text-primary">{n + 1}</span><span>{s}</span></li>
            ))}</ol>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button onClick={() => voice.speak(`${recipe.title}. ${(recipe.steps || []).join(' ')}`)} className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl border border-border font-semibold"><Play size={20} /> Listen</button>
            <button onClick={startRecording} className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl border border-border font-semibold"><RotateCcw size={20} /> Re-record</button>
          </div>
          <button onClick={handleSave} disabled={saved} className="mt-3 flex w-full min-h-[64px] items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground text-lg font-bold disabled:opacity-60">
            {saved ? <><Check size={22} /> Saved</> : <><Save size={22} /> Save recipe</>}
          </button>
          {saved && <button onClick={() => navigate('/')} className="mt-3 w-full text-center font-semibold text-primary">Back to home</button>}
        </div>
      )}

      {gate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
          <div className="w-full max-w-sm rounded-3xl bg-card p-6 text-center shadow-2xl">
            <h3 className="font-heading text-2xl font-bold">You've reached 10 saved recipes</h3>
            <p className="mt-2 text-muted-foreground">Upgrade to keep your whole kitchen.</p>
            <div className="mt-4 grid gap-2 text-left">
              <Tier name="Chef Mode" price="$6.99/mo" features="Unlimited recipes · Meal planning · Offline · Ad-free" />
              <Tier name="Culinary Pro" price="$14.99/mo" features="Everything + batch scaling · Nutrition · Priority voice" />
            </div>
            <button onClick={() => setGate(false)} className="mt-4 w-full min-h-[52px] rounded-2xl border border-border font-semibold">Maybe later</button>
          </div>
        </div>
      )}
    </div>
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