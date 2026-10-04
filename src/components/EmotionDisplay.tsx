import { motion, AnimatePresence } from "framer-motion";
import { Smile, Meh, Frown, Flame, Moon } from "lucide-react";
import type { Emotion, MusicMode } from "@/hooks/useEmotionDetection";
import { EMOTION_EMOJIS } from "@/hooks/useEmotionDetection";

const EMOTION_ICONS: Record<Emotion, typeof Smile> = {
  happy: Smile,
  neutral: Meh,
  sad: Frown,
  angry: Flame,
  tired: Moon,
};

const EMOTION_COLORS: Record<Emotion, string> = {
  happy: "text-emotion-happy",
  neutral: "text-emotion-neutral",
  sad: "text-emotion-sad",
  angry: "text-emotion-angry",
  tired: "text-emotion-tired",
};

const EMOTION_BG: Record<Emotion, string> = {
  happy: "bg-emotion-happy/10",
  neutral: "bg-emotion-neutral/10",
  sad: "bg-emotion-sad/10",
  angry: "bg-emotion-angry/10",
  tired: "bg-emotion-tired/10",
};

const MODE_LABELS: Record<MusicMode, string> = {
  focus: "🎯 Focus Mode",
  relax: "🌊 Relax Mode",
  calm: "🧘 Calm Mode",
};

interface EmotionDisplayProps {
  emotion: Emotion;
  mode: MusicMode;
  playlist: string;
  confidence: number;
}

export function EmotionDisplay({ emotion, mode, playlist, confidence }: EmotionDisplayProps) {
  const Icon = EMOTION_ICONS[emotion];
  const colorClass = EMOTION_COLORS[emotion];
  const bgClass = EMOTION_BG[emotion];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass rounded-xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">Detected Mood</h3>
        {confidence > 0 && (
          <motion.span
            key={confidence}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-xs font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full"
          >
            {Math.round(confidence * 100)}%
          </motion.span>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={emotion}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="flex items-center gap-4"
        >
          <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
            <Icon className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <p className={`text-2xl font-bold capitalize ${colorClass}`}>
              {EMOTION_EMOJIS[emotion]} {emotion}
            </p>
            <p className="text-sm text-muted-foreground">{MODE_LABELS[mode]}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="pt-3 border-t border-border">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Now Playing</p>
        <p className="text-foreground font-medium mt-1 text-sm">🎵 {playlist}</p>
      </div>
    </motion.div>
  );
}
