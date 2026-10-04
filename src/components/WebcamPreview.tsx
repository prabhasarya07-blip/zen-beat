import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, AlertTriangle } from "lucide-react";
import { RefObject } from "react";
import type { Emotion, DetectionState } from "@/hooks/useEmotionDetection";
import { EMOTION_EMOJIS } from "@/hooks/useEmotionDetection";

interface WebcamPreviewProps {
  videoRef: RefObject<HTMLVideoElement>;
  cameraActive: boolean;
  onToggleCamera: () => void;
  detecting: boolean;
  cameraError: string | null;
  emotion?: Emotion;
  confidence?: number;
  detectionState?: DetectionState;
}

export function WebcamPreview({
  videoRef, cameraActive, onToggleCamera, detecting, cameraError,
  emotion = "neutral", confidence = 0, detectionState = "idle",
}: WebcamPreviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl overflow-hidden relative group"
    >
      <div className="aspect-video bg-secondary flex items-center justify-center relative">
        <video
          ref={videoRef}
          className={`w-full h-full object-cover ${cameraActive ? "block" : "hidden"}`}
          muted
          playsInline
          autoPlay
        />

        {/* Emotion overlay when face detected */}
        <AnimatePresence>
          {cameraActive && detecting && detectionState === "face_detected" && (
            <motion.div
              key={emotion}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute top-3 left-3 flex items-center gap-2 bg-card/80 backdrop-blur-md rounded-lg px-3 py-2 border border-border/50"
            >
              <span className="text-2xl">{EMOTION_EMOJIS[emotion]}</span>
              <div>
                <p className="text-sm font-semibold text-foreground capitalize">{emotion}</p>
                <p className="text-[10px] font-mono text-muted-foreground">
                  {Math.round(confidence * 100)}% match
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* No face warning */}
        <AnimatePresence>
          {cameraActive && detecting && detectionState === "no_face" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-3 left-3 flex items-center gap-2 bg-destructive/20 backdrop-blur-md rounded-lg px-3 py-2 border border-destructive/30"
            >
              <span className="text-lg">👤</span>
              <p className="text-xs font-mono text-destructive">No face — look at camera</p>
            </motion.div>
          )}
        </AnimatePresence>

        {!cameraActive && (
          <button
            onClick={onToggleCamera}
            className="flex flex-col items-center gap-3 text-muted-foreground hover:text-foreground transition-colors cursor-pointer w-full h-full justify-center"
          >
            {cameraError ? (
              <>
                <AlertTriangle className="w-12 h-12 text-destructive" />
                <p className="text-sm font-mono text-destructive max-w-xs text-center px-4">{cameraError}</p>
                <p className="text-xs font-mono text-muted-foreground mt-2">Click to retry</p>
              </>
            ) : (
              <>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Camera className="w-14 h-14" />
                </motion.div>
                <p className="text-sm font-mono">Click to enable camera</p>
                <p className="text-[10px] font-mono text-muted-foreground">AI will auto-detect your mood</p>
              </>
            )}
          </button>
        )}

        {/* Scanning indicator */}
        {detecting && cameraActive && (
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-mono text-accent">Live</span>
          </div>
        )}
      </div>

      {cameraActive && (
        <button
          onClick={onToggleCamera}
          className="absolute bottom-3 left-3 p-2 rounded-lg bg-secondary/80 backdrop-blur-sm hover:bg-destructive/20 transition-colors group/btn"
          title="Turn off camera"
        >
          <CameraOff className="w-4 h-4 text-muted-foreground group-hover/btn:text-destructive" />
        </button>
      )}
    </motion.div>
  );
}
