import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Zap, Music, Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEmotionDetection } from "@/hooks/useEmotionDetection";
import { useZenMode } from "@/hooks/useZenMode";
import { WebcamPreview } from "@/components/WebcamPreview";
import { EmotionDisplay } from "@/components/EmotionDisplay";
import { MusicPlayer } from "@/components/MusicPlayer";
import { MoodScoreCard } from "@/components/MoodScoreCard";
import { RecommendedPlaylists } from "@/components/RecommendedPlaylists";
import { MoodProgressDashboard } from "@/components/MoodProgressDashboard";
import { ZenModeOverlay } from "@/components/ZenModeOverlay";
import { LanguageSelector } from "@/components/LanguageSelector";
import { PlatformSelector } from "@/components/PlatformSelector";
import { OnboardingWalkthrough } from "@/components/OnboardingWalkthrough";
import { Button } from "@/components/ui/button";
import type { MusicPlatform } from "@/hooks/useEmotionDetection";
import { EMOTION_EMOJIS } from "@/hooks/useEmotionDetection";

const Index = () => {
  const { signOut } = useAuth();
  const {
    videoRef, modelsLoaded, detecting, result,
    cameraActive, cameraError, language, musicPlatform, detectionState,
    scanPhase, scanProgress, therapyTimeLeft, emotionBreakdown, moodScore, SCAN_DURATION, THERAPY_DURATION,
    setLanguage, setMusicPlatform, startCamera, stopCamera, stopDetection,
    startScan, spotifyPlaylistId,
  } = useEmotionDetection();
  const zenMode = useZenMode();
  const [customPlaylistId, setCustomPlaylistId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem("moodsync_onboarded");
  });

  const handleStart = (platform: MusicPlatform) => {
    setMusicPlatform(platform);
    setShowOnboarding(false);
    localStorage.setItem("moodsync_onboarded", "true");
  };

  const handleToggleCamera = () => {
    if (cameraActive) { stopDetection(); stopCamera(); }
    else { startCamera(); }
  };

  const handleSelectPlaylist = (playlistId: string) => {
    setCustomPlaylistId(playlistId);
  };

  return (
    <>
      <AnimatePresence>
        <ZenModeOverlay active={zenMode.active} formattedTime={zenMode.formattedTime} progress={zenMode.progress} onStop={zenMode.stop} />
      </AnimatePresence>

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingWalkthrough
            musicPlatform={musicPlatform}
            onPlatformChange={setMusicPlatform}
            onComplete={handleStart}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-10">
          <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-2 rounded-xl bg-primary/15 glow-primary"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <Brain className="w-5 h-5 text-primary" />
              </motion.div>
              <div>
                <h1 className="text-base font-bold text-foreground flex items-center gap-1.5">
                  MoodSync <Sparkles className="w-3.5 h-3.5 text-accent" />
                </h1>
                <p className="text-[9px] font-mono text-muted-foreground tracking-widest uppercase">
                  AI-Powered Adaptive Music
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <PlatformSelector platform={musicPlatform} onPlatformChange={setMusicPlatform} />
              <LanguageSelector language={language} onLanguageChange={setLanguage} />
              {!modelsLoaded && (
                <span className="text-[10px] font-mono text-accent animate-pulse">Loading AI...</span>
              )}
              <Button variant="outline" size="sm" onClick={zenMode.active ? zenMode.stop : zenMode.start} className="font-mono text-[10px] h-8 px-2.5">
                <Zap className="w-3 h-3 mr-1" />
                {zenMode.active ? "Exit Zen" : "Zen"}
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut} className="font-mono text-[10px] h-8 px-2.5 text-muted-foreground hover:text-destructive">
                <LogOut className="w-3 h-3 mr-1" />
                Out
              </Button>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="container max-w-6xl mx-auto px-4 py-5">
          {/* Hero hint */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3 rounded-xl bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border border-primary/15 text-center"
          >
            <p className="text-xs text-muted-foreground font-mono flex items-center justify-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-accent" />
              {scanPhase === "scanning"
                ? `Scanning your mood... ${Math.round(scanProgress)}%`
                : scanPhase === "result"
                ? `Dominant mood: ${EMOTION_EMOJIS[result.emotion]} ${result.emotion} (${Math.round(result.confidence * 100)}% of scan)`
                : scanPhase === "therapy"
                ? `🎵 Therapy session — ${therapyTimeLeft}s remaining`
                : scanPhase === "done"
                ? "✅ Session complete! Check your progress below or rescan."
                : cameraActive && detecting
                ? "Camera ready — Click \"Scan My Mood\" to begin"
                : "Enable camera → Click \"Scan My Mood\" → 60s therapy session"
              }
            </p>
            {scanPhase === "scanning" && (
              <div className="mt-2 w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left — Camera + Emotion */}
            <div className="space-y-4">
              {/* Scan or Rescan Button */}
              {cameraActive && detecting && (scanPhase === "idle" || scanPhase === "done") && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Button
                    size="lg"
                    className={`w-full font-bold tracking-wide text-base py-6 ${scanPhase === "done" ? "bg-green-600 hover:bg-green-700" : ""} glow-primary`}
                    onClick={startScan}
                  >
                    <Brain className="w-5 h-5 mr-2" />
                    {scanPhase === "done" ? `Rescan My Mood (${SCAN_DURATION}s)` : `Scan My Mood (${SCAN_DURATION}s)`}
                  </Button>
                </motion.div>
              )}

              {/* Therapy Timer */}
              {scanPhase === "therapy" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl glass border border-accent/30 bg-accent/5 text-center"
                >
                  <p className="text-xs font-mono text-muted-foreground mb-1">THERAPY SESSION</p>
                  <p className="text-3xl font-bold text-accent tabular-nums">
                    {Math.floor(therapyTimeLeft / 60)}:{String(therapyTimeLeft % 60).padStart(2, '0')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Just relax and listen...</p>
                </motion.div>
              )}

              {/* Mood Score Card */}
              {(scanPhase === "result" || scanPhase === "therapy") && (
                <MoodScoreCard
                  moodScore={moodScore}
                  dominantEmotion={result.emotion}
                  confidence={result.confidence}
                  breakdown={emotionBreakdown}
                />
              )}

              {result.aiMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl glass border border-primary/20 bg-primary/5 text-sm font-mono text-foreground/90 whitespace-pre-wrap"
                >
                  <Sparkles className="w-4 h-4 text-primary inline mr-2 align-text-bottom" />
                  {result.aiMessage}
                </motion.div>
              )}

              <WebcamPreview
                videoRef={videoRef}
                cameraActive={cameraActive}
                onToggleCamera={handleToggleCamera}
                detecting={detecting}
                cameraError={cameraError}
                emotion={result.emotion}
                confidence={result.confidence}
                detectionState={detectionState}
              />

              <EmotionDisplay
                emotion={result.emotion}
                mode={result.mode}
                playlist={result.playlist}
                confidence={result.confidence}
              />
            </div>

            {/* Right — Player + Recommendations */}
            <div className="space-y-4">
              <MusicPlayer
                spotifyPlaylistId={spotifyPlaylistId}
                platform={musicPlatform}
                mode={result.mode}
                language={language}
                zenMode={zenMode.active}
                customPlaylistId={customPlaylistId}
              />

              <RecommendedPlaylists
                mode={result.mode}
                onSelect={handleSelectPlaylist}
              />

              {/* Mood Progress Dashboard */}
              <MoodProgressDashboard />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Index;
