import { motion } from "framer-motion";
import { X } from "lucide-react";

interface ZenModeOverlayProps {
  active: boolean;
  formattedTime: string;
  progress: number;
  onStop: () => void;
}

export function ZenModeOverlay({ active, formattedTime, progress, onStop }: ZenModeOverlayProps) {
  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl flex flex-col items-center justify-center"
    >
      <button
        onClick={onStop}
        className="absolute top-6 right-6 p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
      >
        <X className="w-5 h-5 text-muted-foreground" />
      </button>

      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="text-center space-y-8"
      >
        <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Zen Mode</p>
        <p className="text-8xl font-bold font-mono text-foreground">{formattedTime}</p>

        <div className="w-64 h-1 bg-secondary rounded-full overflow-hidden mx-auto">
          <motion.div
            className="h-full bg-accent rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <p className="text-muted-foreground text-sm">Stay focused. You've got this.</p>
      </motion.div>
    </motion.div>
  );
}
