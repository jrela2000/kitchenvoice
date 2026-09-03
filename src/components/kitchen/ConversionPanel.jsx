import { Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConversionPanel({ result, onSpeak }) {
  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="mx-auto mb-4 max-w-md rounded-2xl border border-accent bg-accent/40 px-5 py-4"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-accent-foreground">
            <Scale size={18} /> Conversion
          </div>
          {result.error ? (
            <p className="mt-2 text-lg">{result.message}</p>
          ) : (
            <button onClick={() => onSpeak(result.spoken)} className="mt-1 block text-left">
              <p className="text-2xl font-bold">
                {result.value} {result.from} = {result.result} {result.to}
              </p>
              <p className="text-sm text-muted-foreground">Tap to hear it spoken</p>
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}