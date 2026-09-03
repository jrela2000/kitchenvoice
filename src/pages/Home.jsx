import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, BookOpen, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useSettings } from '@/hooks/useSettings';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import VoiceOrb from '@/components/kitchen/VoiceOrb';
import RecipeCard from '@/components/kitchen/RecipeCard';
import CommandBar from '@/components/kitchen/CommandBar';
import { speechSupported } from '@/lib/voice';

export default function Home() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState([]);
  const [toast, setToast] = useState('');

  const runSearch = useCallback(async (q) => {
    const term = (q || '').trim();
    if (!term) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await base44.functions.invoke('discoverRecipes', { query: term });
      setResults(res.data?.recipes || []);
    } catch {
      setToast('Search failed. Try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSaved = useCallback(async () => {
    try {
      const res = await base44.entities.Recipe.list('-updated_date', 50);
      setSaved(res || []);
    } catch {
      setSaved([]);
    }
  }, []);

  useEffect(() => { loadSaved(); }, [loadSaved]);

  useEffect(() => {
    if (!settings.onboarded) navigate('/onboarding', { replace: true });
  }, [settings.onboarded, navigate]);

  const openRecipe = useCallback(async (recipe, index) => {
    try {
      // Persist discovered recipe so cooking mode can load it by id.
      let id = recipe.id;
      if (!id) {
        const created = await base44.entities.Recipe.create({ ...recipe, source: 'discovered' });
        id = created.id;
        loadSaved();
      }
      navigate(`/recipe/${id}`);
    } catch {
      navigate(`/recipe/${recipe.id || 'temp'}`, { state: { recipe } });
    }
  }, [navigate, loadSaved]);

  const voice = useVoiceAssistant({
    alwaysOn: settings.voiceOnly,
    wakeWord: settings.wakeWord,
    ttsRate: settings.ttsRate,
    onCommand: (cmd, raw) => {
      if (cmd.command === 'search') { setQuery(cmd.arg); runSearch(cmd.arg); }
      else if (cmd.command === 'select' && cmd.arg != null && results[cmd.arg]) openRecipe(results[cmd.arg], cmd.arg);
      else if (cmd.command === 'create') navigate('/create');
      else if (cmd.command === 'settings') navigate('/settings');
      else if (cmd.command === 'home') loadSaved();
    }
  });

  return (
    <div className="mx-auto w-full max-w-md flex-1 px-5 py-6">
      <h1 className="font-heading text-3xl font-extrabold">What are we cooking?</h1>
      <p className="mt-1 text-muted-foreground">Speak a dish or ingredient. Say “{settings.wakeWord}” then your request.</p>

      <form
        onSubmit={(e) => { e.preventDefault(); runSearch(query); }}
        className="mt-4 flex items-center gap-2"
      >
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-card px-4">
          <Search size={20} className="text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. creamy tomato pasta"
            className="h-14 flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground"
          />
        </div>
      </form>

      <div className="mt-6 flex flex-col items-center">
        <VoiceOrb
          listening={voice.listening}
          disabled={!speechSupported()}
          onClick={() => (voice.listening ? voice.stop() : voice.start())}
          size="lg"
        />
        <CommandBar interim={voice.interim} lastHeard={voice.lastHeard} listening={voice.listening} hint="Say a dish name, or “search for…”" />
        {voice.error && <p className="text-sm text-destructive">{voice.error}</p>}
      </div>

      {loading && (
        <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="animate-spin" /> Finding recipes…
        </div>
      )}

      {!loading && results.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-bold">Results</h2>
          <div className="grid gap-4">
            {results.map((r, i) => (
              <RecipeCard key={i} recipe={r} index={i} onSelect={openRecipe} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2"><BookOpen size={20} /> Saved recipes</h2>
          <button onClick={() => navigate('/create')} className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            <Plus size={18} /> New
          </button>
        </div>
        {saved.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">
            No saved recipes yet. Cook or create one to see it here.
          </p>
        ) : (
          <div className="grid gap-4">
            {saved.map((r, i) => (
              <RecipeCard key={r.id || i} recipe={r} index={i} onSelect={openRecipe} />
            ))}
          </div>
        )}
      </section>

      {toast && <p className="mt-4 text-center text-sm text-muted-foreground">{toast}</p>}
    </div>
  );
}