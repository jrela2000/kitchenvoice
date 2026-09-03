import { motion, AnimatePresence } from 'framer-motion';

// Shows the live interim transcript + last heard command + a hint chip.
export default function CommandBar({ interim, lastHeard, hint, listening }) {
  return (
    <div className="min-h-[3.5rem] flex flex-col items-center justify-center gap-1 text-center">
      <AnimatePresence mode="wait">
        {interim ? (
          <motion.p
            key="interim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
            className="text-lg italic text-muted-foreground"
          >
            “{interim}”
          </motion.p>
        ) : lastHeard ? (
          <motion.p
            key="heard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-live="polite"
            className="text-lg font-medium"
          >
            {lastHeard}
          </motion.p>
        ) : (
          <motion.p key="hint" className="text-sm text-muted-foreground">
            {hint || (listening ? 'Listening… say a command' : 'Tap the mic to speak')}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}