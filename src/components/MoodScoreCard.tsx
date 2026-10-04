import { motion } from "framer-motion";
import type { Emotion } from "@/hooks/useEmotionDetection";
import { EMOTION_EMOJIS } from "@/hooks/useEmotionDetection";

interface MoodScoreCardProps {
  moodScore: number;
  dominantEmotion: Emotion;
  confidence: number;
  breakdown: Record<Emotion, number>;
}

const SCORE_LABELS: { min: number; label: string; color: string }[] = [
  { min: 80, label: "Great Mood!", color: "text-green-400" },
  { min: 60, label: "Calm & Steady", color: "text-blue-400" },
  { min: 40, label: "Needs a Boost", color: "text-yellow-400" },
  { min: 20, label: "Feeling Low", color: "text-orange-400" },
  { min: 0, label: "Stressed Out", color: "text-red-400" },
];

const EMOTION_COLORS: Record<Emotion, string> = {
  happy: "bg-green-500",
  neutral: "bg-blue-500",
  sad: "bg-indigo-500",
  angry: "bg-red-500",
  tired: "bg-yellow-500",
};

export function MoodScoreCard({ moodScore, dominantEmotion, confidence, breakdown }: MoodScoreCardProps) {
  const scoreLabel = SCORE_LABELS.find((s) => moodScore >= s.min) || SCORE_LABELS[SCORE_LABELS.length - 1];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-5 rounded-xl glass border border-primary/20 bg-primary/5"
    >
      {/* Score Circle */}
      <div className="flex items-center gap-5 mb-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" strokeWidth="8" fill="none" className="stroke-muted/20" />
            <motion.circle
              cx="50" cy="50" r="42" strokeWidth="8" fill="none"
              strokeLinecap="round"
              className="stroke-primary"
              initial={{ strokeDasharray: "0 264" }}
              animate={{ strokeDasharray: `${(moodScore / 100) * 264} 264` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold">{moodScore}</span>
            <span className="text-[8px] text-muted-foreground font-mono">/ 100</span>
          </div>
        </div>
        <div>
          <p className={`text-lg font-bold ${scoreLabel.color}`}>{scoreLabel.label}</p>
          <p className="text-sm text-muted-foreground font-mono">
            {EMOTION_EMOJIS[dominantEmotion]} Dominant: <span className="text-foreground capitalize">{dominantEmotion}</span>
            <span className="text-xs ml-1">({Math.round(confidence * 100)}%)</span>
          </p>
        </div>
      </div>

      {/* Emotion Breakdown Bars */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Emotion Breakdown</p>
        {(Object.entries(breakdown) as [Emotion, number][])
          .sort((a, b) => b[1] - a[1])
          .map(([emotion, pct]) => (
            <div key={emotion} className="flex items-center gap-2">
              <span className="text-xs w-16 font-mono text-muted-foreground capitalize">{EMOTION_EMOJIS[emotion]} {emotion}</span>
              <div className="flex-1 bg-muted/30 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${EMOTION_COLORS[emotion]}`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground w-8 text-right">{pct}%</span>
            </div>
          ))}
      </div>
    </motion.div>
  );
}
