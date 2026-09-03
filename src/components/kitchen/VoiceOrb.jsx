import { Mic, MicOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VoiceOrb({ listening, onClick, disabled, size = 'md', label }) {
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-36 h-36'
  };
  const icon = { sm: 26, md: 38, lg: 54 };
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label || (listening ? 'Stop listening' : 'Start listening')}
        whileTap={{ scale: 0.94 }}
        className={`relative flex items-center justify-center rounded-full text-white shadow-lg transition-colors ${sizes[size]} ${
          disabled ? 'bg-muted-foreground/40' : listening ? 'bg-primary' : 'bg-primary/90 hover:bg-primary'
        }`}
      >
        {listening && (
          <>
            <motion.span
              className="absolute inset-0 rounded-full bg-primary/40"
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.span
              className="absolute inset-0 rounded-full bg-primary/30"
              animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            />
          </>
        )}
        {disabled ? <MicOff size={icon[size]} /> : <Mic size={icon[size]} />}
      </motion.button>
      {label && <span className="text-sm font-medium text-muted-foreground">{label}</span>}
    </div>
  );
}