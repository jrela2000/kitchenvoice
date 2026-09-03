import { motion, AnimatePresence } from 'framer-motion';

// Large single-step display, no scrolling. Icon-driven.
export default function StepView({ step, index, total }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
          {index + 1}
        </span>
        <span className="text-lg font-medium text-muted-foreground">of {total}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="font-heading text-4xl sm:text-5xl font-bold leading-tight max-w-2xl"
        >
          {step}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}