import { Clock, Flame, ListOrdered, Utensils } from 'lucide-react';
import { foodEmoji, foodGradient } from '@/lib/food';
import { motion } from 'framer-motion';

const DIFF = {
  easy: { label: 'Easy', color: 'text-green-600' },
  medium: { label: 'Medium', color: 'text-amber-600' },
  hard: { label: 'Hard', color: 'text-red-600' }
};

export default function RecipeCard({ recipe, index, onSelect }) {
  const diff = DIFF[recipe.difficulty] || DIFF.easy;
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(recipe, index)}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left rounded-3xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow focus:outline-none focus:ring-4 focus:ring-primary/30"
    >
      <div className={`relative h-32 bg-gradient-to-br ${foodGradient(recipe.title)} flex items-center justify-center`}>
        <span className="text-6xl drop-shadow-sm">{foodEmoji(recipe.title)}</span>
        <span className="absolute top-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-foreground text-sm font-bold">
          {index + 1}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-heading text-xl font-bold leading-tight">{recipe.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock size={16} /> {recipe.cook_time_minutes} min
          </span>
          <span className={`inline-flex items-center gap-1 font-medium ${diff.color}`}>
            <Flame size={16} /> {diff.label}
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <ListOrdered size={16} /> {recipe.steps?.length || 0} steps
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Utensils size={16} /> {recipe.ingredients?.length || 0}
          </span>
        </div>
      </div>
    </motion.button>
  );
}