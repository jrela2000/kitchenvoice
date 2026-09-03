// Kitchen unit conversion + step time parsing.

const VOLUME = { // -> ml
  cup: 240, cups: 240, c: 240,
  tablespoon: 15, tablespoons: 15, tbsp: 15, tbs: 15, tbspn: 15,
  teaspoon: 5, teaspoons: 5, tsp: 5,
  ml: 1, milliliter: 1, milliliters: 1, millilitre: 1, millilitres: 1,
  liter: 1000, liters: 1000, litre: 1000, litres: 1000, l: 1000,
  pint: 473.176, pints: 473.176, pt: 473.176,
  quart: 946.353, quarts: 946.353, qt: 946.353,
  gallon: 3785.41, gallons: 3785.41, gal: 3785.41
};

const VOLUME_OUNCE = { fluidounce: 29.5735, 'fluid ounce': 29.5735, 'fluid ounces': 29.5735, floz: 29.5735, 'fl oz': 29.5735 };

const MASS = { // -> grams
  gram: 1, grams: 1, g: 1,
  kilogram: 1000, kilograms: 1000, kg: 1000, kilo: 1000, kilos: 1000,
  pound: 453.592, pounds: 453.592, lb: 453.592, lbs: 453.592,
  ounce: 28.3495, ounces: 28.3495, oz: 28.3495
};

function normalizeUnit(u) {
  return u.toLowerCase().trim().replace(/\s+/g, ' ');
}

function evalNumber(str) {
  str = String(str).trim();
  if (str.includes('/')) {
    const [a, b] = str.split('/').map((n) => parseFloat(n));
    if (b) return a / b;
  }
  const words = { 'a ': 1, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'half': 0.5, 'quarter': 0.25 };
  if (words[str] != null) return words[str];
  return parseFloat(str);
}

function pretty(n) {
  if (!isFinite(n)) return '?';
  if (Math.abs(n) >= 100) return Math.round(n).toString();
  if (Math.abs(n) >= 10) return (Math.round(n * 10) / 10).toString();
  return (Math.round(n * 100) / 100).toString();
}

export function parseConversion(text) {
  let t = String(text || '').toLowerCase().replace(/\bconvert(ion)?\b/, '').replace(/\bto\b/, ' -> ').trim();
  const m = t.match(/([\d./]+)\s*([a-z][a-z\s]*?)\s*(?:->|to|in)\s*([a-z][a-z\s]*)/);
  if (!m) return null;
  const value = evalNumber(m[1]);
  const fromU = normalizeUnit(m[2]);
  const toU = normalizeUnit(m[3]);
  if (isNaN(value)) return null;

  const fromVol = VOLUME[fromU] ?? VOLUME_OUNCE[fromU];
  const toVol = VOLUME[toU] ?? VOLUME_OUNCE[toU];
  const fromMass = MASS[fromU];
  const toMass = MASS[toU];

  let result, category;
  if (fromVol != null && toVol != null) {
    result = (value * fromVol) / toVol;
    category = 'volume';
  } else if (fromMass != null && toMass != null) {
    result = (value * fromMass) / toMass;
    category = 'mass';
  } else {
    return { error: true, message: `I can't convert between ${fromU} and ${toU}.` };
  }

  return {
    value,
    from: fromU,
    to: toU,
    result: pretty(result),
    spoken: `${pretty(value)} ${fromU} is about ${pretty(result)} ${toU}.`,
    category
  };
}

// Parse a duration mentioned in a step text -> seconds.
export function parseStepTime(text) {
  const t = String(text || '').toLowerCase();
  const re = /(\d+(?:\.\d+)?)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?)/g;
  let total = 0;
  let match;
  while ((match = re.exec(t)) !== null) {
    const n = parseFloat(match[1]);
    const unit = match[2];
    if (unit.startsWith('hour') || unit.startsWith('hr')) total += n * 3600;
    else if (unit.startsWith('min')) total += n * 60;
    else if (unit.startsWith('sec')) total += n;
  }
  return total;
}

export function formatDuration(seconds) {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}