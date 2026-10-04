import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Camera, Music, BarChart3, Sparkles, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MusicPlatform } from "@/hooks/useEmotionDetection";

interface OnboardingWalkthroughProps {
  musicPlatform: MusicPlatform;
  onPlatformChange: (p: MusicPlatform) => void;
  onComplete: (platform: MusicPlatform) => void;
}

const STEPS = [
  {
    icon: Brain,
    title: "Welcome to MoodSync",
    subtitle: "AI-Powered Adaptive Music Therapy",
    description: "MoodSync uses real-time facial emotion detection to understand how you're feeling — then plays the perfect music to match or improve your mood.",
    color: "text-primary",
    bgColor: "bg-primary/15",
  },
  {
    icon: Camera,
    title: "15-Second Mood Scan",
    subtitle: "Privacy-First AI Detection",
    description: "Enable your camera and click 'Scan My Mood'. Our AI scans your facial expressions for 15 seconds to determine your dominant emotion — all processing happens locally in your browser. No images are ever sent to a server.",
    color: "text-blue-400",
    bgColor: "bg-blue-400/15",
  },
  {
    icon: BarChart3,
    title: "Your Mood Score",
    subtitle: "Detailed Emotion Breakdown",
    description: "After the scan, you'll see a Mood Score (0-100) with a full breakdown of all detected emotions. This tells you exactly how you're feeling with scientific precision.",
    color: "text-green-400",
    bgColor: "bg-green-400/15",
  },
  {
    icon: Music,
    title: "60-Second Therapy",
    subtitle: "AI-Curated Music Session",
    description: "Based on your mood score, our MCP-powered AI Agent selects the perfect playlist from your chosen platform and plays a 60-second therapeutic music session to help you feel better.",
    color: "text-accent",
    bgColor: "bg-accent/15",
  },
];

const PLATFORMS: { value: MusicPlatform; label: string; color: string }[] = [
  { value: "spotify", label: "Spotify", color: "bg-[#1DB954] hover:bg-[#1aa34a]" },
  { value: "wynk", label: "Wynk", color: "bg-[#ff0000] hover:bg-[#cc0000]" },
  { value: "jiosaavn", label: "JioSaavn", color: "bg-[#2bc5b4] hover:bg-[#209c8d]" },
  { value: "gaana", label: "Gaana", color: "bg-[#e21e25] hover:bg-[#b8171d]" },
];

export function OnboardingWalkthrough({ musicPlatform, onPlatformChange, onComplete }: OnboardingWalkthroughProps) {
  const [step, setStep] = useState(0);
  const isLastStep = step === STEPS.length;
  const totalSteps = STEPS.length + 1; // +1 for platform selection

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
    >
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="glass p-8 rounded-2xl max-w-md w-full border border-primary/20 flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Progress dots */}
        <div className="flex gap-1.5 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-primary" : i < step ? "w-3 bg-primary/50" : "w-3 bg-muted/30"
              }`}
            />
          ))}
        </div>

        {!isLastStep ? (
          <>
            {/* Feature step */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`p-4 rounded-2xl ${STEPS[step].bgColor} mb-5`}
            >
              {(() => {
                const Icon = STEPS[step].icon;
                return <Icon className={`w-10 h-10 ${STEPS[step].color}`} />;
              })()}
            </motion.div>
            <h2 className="text-xl font-bold mb-1">{STEPS[step].title}</h2>
            <p className={`text-xs font-mono ${STEPS[step].color} mb-4 tracking-wider uppercase`}>
              {STEPS[step].subtitle}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8 max-w-[340px]">
              {STEPS[step].description}
            </p>
          </>
        ) : (
          <>
            {/* Platform selection step */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="p-4 rounded-2xl bg-accent/15 mb-5"
            >
              <Sparkles className="w-10 h-10 text-accent" />
            </motion.div>
            <h2 className="text-xl font-bold mb-1">Choose Your Platform</h2>
            <p className="text-xs font-mono text-accent mb-6 tracking-wider uppercase">
              Where do you listen to music?
            </p>

            <div className="grid grid-cols-2 gap-2.5 w-full mb-8">
              {PLATFORMS.map((p) => (
                <Button
                  key={p.value}
                  variant={musicPlatform === p.value ? "default" : "outline"}
                  className={`h-12 font-bold transition-all ${
                    musicPlatform === p.value
                      ? `${p.color} text-white border-transparent shadow-lg`
                      : "hover:border-primary/40"
                  }`}
                  onClick={() => onPlatformChange(p.value)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex items-center gap-3 w-full">
          {step > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(step - 1)}
              className="font-mono text-xs"
            >
              <ChevronLeft className="w-3 h-3 mr-1" /> Back
            </Button>
          )}
          <div className="flex-1" />
          {!isLastStep ? (
            <Button
              size="sm"
              onClick={() => setStep(step + 1)}
              className="font-mono text-xs px-4"
            >
              Next <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full font-bold tracking-wide"
              onClick={() => onComplete(musicPlatform)}
            >
              Start MoodSync <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Step counter */}
        <p className="text-[10px] text-muted-foreground/50 font-mono mt-4">
          {step + 1} / {totalSteps}
        </p>
      </motion.div>
    </motion.div>
  );
}
