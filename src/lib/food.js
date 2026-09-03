// Map a dish/ingredient to a warm emoji + gradient for visual recipe cards.

const KEYWORDS = [
  ['pasta', '🍝', 'from-amber-400 to-orange-500'],
  ['spaghetti', '🍝', 'from-amber-400 to-orange-500'],
  ['noodle', '🍜', 'from-amber-400 to-red-500'],
  ['ramen', '🍜', 'from-amber-400 to-red-500'],
  ['pizza', '🍕', 'from-red-400 to-orange-500'],
  ['burger', '🍔', 'from-amber-500 to-yellow-600'],
  ['salad', '🥗', 'from-lime-400 to-green-600'],
  ['soup', '🍲', 'from-orange-400 to-amber-600'],
  ['stew', '🥘', 'from-orange-500 to-red-600'],
  ['curry', '🍛', 'from-amber-500 to-yellow-600'],
  ['rice', '🍚', 'from-amber-200 to-yellow-400'],
  ['sushi', '🍣', 'from-rose-300 to-pink-500'],
  ['taco', '🌮', 'from-yellow-400 to-amber-500'],
  ['burrito', '🌯', 'from-amber-400 to-orange-500'],
  ['bread', '🍞', 'from-amber-300 to-yellow-500'],
  ['pancake', '🥞', 'from-amber-400 to-orange-500'],
  ['waffle', '🧇', 'from-amber-400 to-yellow-600'],
  ['egg', '🍳', 'from-yellow-300 to-amber-500'],
  ['omelet', '🍳', 'from-yellow-300 to-amber-500'],
  ['cake', '🍰', 'from-pink-300 to-rose-500'],
  ['cookie', '🍪', 'from-amber-500 to-yellow-700'],
  ['chocolate', '🍫', 'from-amber-700 to-yellow-900'],
  ['smoothie', '🥤', 'from-lime-300 to-emerald-500'],
  ['juice', '🧃', 'from-orange-300 to-amber-500'],
  ['coffee', '☕', 'from-amber-700 to-stone-800'],
  ['tea', '🍵', 'from-green-300 to-emerald-500'],
  ['steak', '🥩', 'from-red-500 to-rose-700'],
  ['chicken', '🍗', 'from-amber-400 to-orange-600'],
  ['fish', '🐟', 'from-cyan-300 to-blue-500'],
  ['shrimp', '🍤', 'from-orange-300 to-pink-500'],
  ['vegetable', '🥦', 'from-green-400 to-lime-600'],
  ['potato', '🥔', 'from-amber-300 to-yellow-600'],
  ['tomato', '🍅', 'from-red-400 to-rose-600'],
  ['avocado', '🥑', 'from-lime-400 to-green-600'],
  ['fruit', '🍓', 'from-rose-300 to-red-500'],
  ['dessert', '🍮', 'from-amber-200 to-yellow-500'],
  ['pie', '🥧', 'from-amber-400 to-orange-600'],
  ['donut', '🍩', 'from-pink-300 to-rose-500'],
  ['sandwich', '🥪', 'from-amber-300 to-yellow-500'],
  ['wrap', '🌯', 'from-lime-300 to-green-500']
];

export function foodEmoji(title = '') {
  const t = String(title).toLowerCase();
  for (const [kw, emoji] of KEYWORDS) if (t.includes(kw)) return emoji;
  return '🍽️';
}

export function foodGradient(title = '') {
  const t = String(title).toLowerCase();
  for (const [kw, , grad] of KEYWORDS) if (t.includes(kw)) return grad;
  return 'from-amber-400 to-orange-500';
}