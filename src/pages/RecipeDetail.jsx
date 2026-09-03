import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, Flame, Utensils, Play, ListOrdered, Share2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { foodEmoji, foodGradient } from '@/lib/food';
import { useSettings } from '@/hooks/useSettings';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import CommandBar from '@/components/kitchen/CommandBar';

const DIFF = { easy: 'text-green-600', medium: 'text-amber-600', hard: 'text-red-600' };

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const loc = useLocation();
  const { settings } = useSettings();
  const [recipe, setRecipe] = useState(loc.state?.recipe || null);
  const [loading, setLoading] = useState(!recipe);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (recipe) return;
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
  }, [id, recipe]);

  const voice = useVoiceAssistant({
    alwaysOn: settings.voiceOnly,
    wakeWord: settings.wakeWord,
    onCommand: (cmd) => {
      if (cmd.command === 'start') startCooking();
      else if (cmd.command === 'ingredients') voice.speak(`You will need: ${(recipe?.ingredients || []).join(', ')}`);
      else if (cmd.command === 'home' || cmd.command === 'back') navigate('/');
    }
  });

  const startCooking = () => recipe?.id && navigate(`/cooking/${recipe.id}`);

  if (loading) return <div className="flex flex-1 items-center justify-center text-muted-foreground">Loading…</div>;
  if (!recipe) return <div className="flex flex-1 flex-col items-center justify-center gap-3"><p>Recipe not found.</p><button onClick={() => navigate('/')} className="font-semibold text-primary">Back home</button></div>;

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-5 py-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-muted-foreground mb-4"><ArrowLeft size={20} /> Back</button>

      <div className={`relative h-40 rounded-3xl bg-gradient-to-br ${foodGradient(recipe.title)} flex items-center justify-center`}>
        <span className="text-7xl drop-shadow">{foodEmoji(recipe.title)}</span>
      </div>

      <h1 className="mt-4 font-heading text-3xl font-extrabold leading-tight">{recipe.title}</h1>
      <p className="mt-1 text-muted-foreground">{recipe.description}</p>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <span className="inline-flex items-center gap-1"><Clock size={18} /> {recipe.cook_time_minutes} min</span>
        <span className={`inline-flex items-center gap-1 font-medium ${DIFF[recipe.difficulty] || DIFF.easy}`}><Flame size={18} /> {recipe.difficulty}</span>
        <span className="inline-flex items-center gap-1"><Utensils size={18} /> {recipe.servings} servings</span>
        <span className="inline-flex items-center gap-1"><ListOrdered size={18} /> {recipe.steps?.length || 0} steps</span>
      </div>

      <section className="mt-6">
        <h2 className="mb-2 text-xl font-bold">Ingredients</h2>
        <ul className="grid gap-2">
          {(recipe.ingredients || []).map((ing, i) => (
            <li key={i} className="flex min-h-[44px] items-center gap-3 rounded-xl bg-card border border-border px-3">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span className="text-lg">{ing}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-xl font-bold">Steps</h2>
        <ol className="grid gap-2">
          {(recipe.steps || []).map((s, i) => (
            <li key={i} className="flex gap-3 rounded-xl bg-card border border-border p-3">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
              <span className="pt-1 text-lg">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8 flex flex-col items-center gap-3">
        <CommandBar interim={voice.interim} lastHeard={voice.lastHeard} listening={voice.listening} hint="Say “start cooking” to begin" />
        <button onClick={startCooking} className="inline-flex w-full min-h-[64px] items-center justify-center gap-2 rounded-2xl bg-primary text-primary-foreground text-xl font-bold">
          <Play size={24} /> Start cooking
        </button>
        <button
          onClick={async () => {
            if (navigator.share) { try { await navigator.share({ title: recipe.title, text: recipe.ingredients?.join(', ') }); } catch {} }
            else { setToast('Share link copied'); }
          }}
          className="inline-flex w-full min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-border text-lg font-semibold"
        >
          <Share2 size={20} /> Share
        </button>
        {toast && <p className="mt-2 text-center text-sm text-muted-foreground">{toast}</p>}
      </div>
    </div>
  );
}