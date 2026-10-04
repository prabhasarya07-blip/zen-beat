import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { API_URL } from "@/lib/apiConfig";

export type Emotion = "happy" | "neutral" | "sad" | "angry" | "tired";
export type MusicMode = "focus" | "relax" | "calm";
export type MusicLanguage = "english" | "hindi" | "telugu" | "tamil" | "other";
export type MusicPlatform = "spotify" | "wynk" | "jiosaavn" | "gaana";
export type DetectionState = "idle" | "face_detected" | "no_face";
export type ScanPhase = "idle" | "scanning" | "result" | "therapy" | "done";

interface EmotionResult {
  emotion: Emotion;
  mode: MusicMode;
  playlist: string;
  confidence: number;
  aiMessage?: string;
  mcpPlaylistId?: string;
  mcpPlatform?: MusicPlatform;
}

const EMOTION_MAP: Record<string, Emotion> = {
  happy: "happy",
  neutral: "neutral",
  sad: "sad",
  angry: "angry",
  disgusted: "angry",
  fearful: "tired",
  surprised: "happy",
};

const MODE_MAP: Record<Emotion, MusicMode> = {
  happy: "focus",
  neutral: "focus",
  sad: "relax",
  tired: "relax",
  angry: "calm",
};

const PLAYLIST_MAP: Record<MusicMode, string> = {
  focus: "Lo-fi Beats",
  relax: "Calm Vibes",
  calm: "Meditation Sounds",
};

const SPOTIFY_MAP: Record<MusicLanguage, Record<MusicMode, string>> = {
  english: {
    focus: "0vvXsWCC9xrXsKd4FyS8kM",
    relax: "37i9dQZF1DWZqd5JICZI0u",
    calm: "37i9dQZF1DWZqd5JICZI0u",
  },
  hindi: {
    focus: "37i9dQZF1DX0XUfTFmNBRM",
    relax: "37i9dQZF1DWVlYsZJXqdym",
    calm: "37i9dQZF1DWVlYsZJXqdym",
  },
  telugu: {
    focus: "37i9dQZF1DX6XE7HRLM75P",
    relax: "37i9dQZF1DX2IL65szAVTG",
    calm: "37i9dQZF1DX2IL65szAVTG",
  },
  tamil: {
    focus: "37i9dQZF1DX6MbIz1PWGFe",
    relax: "37i9dQZF1DWYo3YMFnLhZR",
    calm: "37i9dQZF1DWYo3YMFnLhZR",
  },
  other: {
    focus: "0vvXsWCC9xrXsKd4FyS8kM",
    relax: "37i9dQZF1DWZqd5JICZI0u",
    calm: "37i9dQZF1DWZqd5JICZI0u",
  },
};

export const EMOTION_EMOJIS: Record<Emotion, string> = {
  happy: "😊",
  neutral: "😐",
  sad: "😢",
  angry: "😠",
  tired: "😴",
};

export const RECOMMENDED_PLAYLISTS: Record<MusicMode, Array<{ name: string; description: string; id: string }>> = {
  focus: [
    { name: "Deep Focus", description: "Keep calm and focus", id: "37i9dQZF1DWZeKCadgRdKQ" },
    { name: "Lo-Fi Beats", description: "Chill beats to study/relax", id: "0vvXsWCC9xrXsKd4FyS8kM" },
    { name: "Instrumental Study", description: "Instrumental for studying", id: "37i9dQZF1DX9sIqqvKsjG8" },
  ],
  relax: [
    { name: "Peaceful Piano", description: "Relax with beautiful piano", id: "37i9dQZF1DX4sWSpwq3LiO" },
    { name: "Chill Vibes", description: "Chill tracks for unwinding", id: "37i9dQZF1DWZqd5JICZI0u" },
    { name: "Calm Acoustic", description: "Soft acoustic melodies", id: "37i9dQZF1DWXe9gFZP0gtP" },
  ],
  calm: [
    { name: "Meditation Music", description: "Find your inner peace", id: "37i9dQZF1DWZqd5JICZI0u" },
    { name: "Nature Sounds", description: "Sounds of nature to relax", id: "37i9dQZF1DX4PP3DA4J0N8" },
    { name: "Ambient Chill", description: "Ambient atmosphere", id: "37i9dQZF1DX3Ogo9pFvBkY" },
  ],
};

export function useEmotionDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [language, setLanguage] = useState<MusicLanguage>("english");
  const [musicPlatform, setMusicPlatform] = useState<MusicPlatform>("spotify");
  const [detectionState, setDetectionState] = useState<DetectionState>("idle");
  const [scanPhase, setScanPhase] = useState<ScanPhase>("idle");
  const [scanProgress, setScanProgress] = useState(0); // 0-100
  const [therapyTimeLeft, setTherapyTimeLeft] = useState(60);
  const [emotionBreakdown, setEmotionBreakdown] = useState<Record<Emotion, number>>({ happy: 0, neutral: 0, sad: 0, angry: 0, tired: 0 });
  const [moodScore, setMoodScore] = useState(0); // 0-100
  const emotionCountsRef = useRef<Record<Emotion, number>>({ happy: 0, neutral: 0, sad: 0, angry: 0, tired: 0 });
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const therapyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanStartRef = useRef<number>(0);
  const SCAN_DURATION = 15; // seconds
  const THERAPY_DURATION = 60; // seconds
  const [result, setResult] = useState<EmotionResult>({
    emotion: "neutral",
    mode: "focus",
    playlist: "Lo-fi Beats",
    confidence: 0,
  });
  const [cameraActive, setCameraActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceApiRef = useRef<Awaited<typeof import("@vladmandic/face-api")> | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const faceapi = await import("@vladmandic/face-api");
        faceApiRef.current = faceapi;
        const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model/";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        toast.success("AI models ready");
      } catch (err) {
        console.error("Failed to load AI models:", err);
        toast.error("Failed to load AI models. Please refresh.");
      }
    };
    loadModels();
  }, []);

  const detectEmotion = useCallback(async () => {
    const faceapi = faceApiRef.current;
    const video = videoRef.current;
    if (!video || !modelsLoaded || !faceapi || video.readyState < 2) return;

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
        .withFaceExpressions();

      if (!detection) {
        setDetectionState("no_face");
        return;
      }

      const expressions = detection.expressions as unknown as Record<string, number>;
      const sorted = Object.entries(expressions)
        .map(([name, value]) => [name, Number(value)] as const)
        .sort((a, b) => b[1] - a[1]);

      const top = sorted[0];
      if (!top) return;

      const [topExpression, topConfidence] = top;
      const emotion = EMOTION_MAP[topExpression] ?? "neutral";
      const conf = Number.isFinite(topConfidence) ? topConfidence : 0;

      setDetectionState("face_detected");

      // Accumulate emotion during scan phase
      if (scanPhase === "scanning") {
        emotionCountsRef.current[emotion] += 1;
        // Update live preview during scan
        const mode = MODE_MAP[emotion];
        const playlist = PLAYLIST_MAP[mode];
        setResult(prev => ({ ...prev, emotion, mode, playlist, confidence: conf }));
        // Update scan progress
        const elapsed = (Date.now() - scanStartRef.current) / 1000;
        setScanProgress(Math.min((elapsed / SCAN_DURATION) * 100, 100));
      }
    } catch (err) {
      console.error("Emotion detection error:", err);
    }
  }, [modelsLoaded, scanPhase]);

  // Finalize scan: pick dominant emotion, call MCP, start therapy timer
  const finalizeScan = useCallback(async () => {
    const counts = emotionCountsRef.current;
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    
    // Find the dominant emotion
    const dominant = (Object.entries(counts) as [Emotion, number][])
      .sort((a, b) => b[1] - a[1])[0];
    
    const emotion = dominant ? dominant[0] : "neutral";
    const confidence = total > 0 && dominant ? dominant[1] / total : 0;
    const mode = MODE_MAP[emotion];
    const playlist = PLAYLIST_MAP[mode];

    setResult({ emotion, mode, playlist, confidence });
    setScanProgress(100);
    setScanPhase("result");

    // Build percentage breakdown for UI
    const breakdown: Record<Emotion, number> = { happy: 0, neutral: 0, sad: 0, angry: 0, tired: 0 };
    for (const [e, c] of Object.entries(counts)) {
      breakdown[e as Emotion] = total > 0 ? Math.round((c / total) * 100) : 0;
    }
    setEmotionBreakdown(breakdown);

    // Calculate mood score: happy=90, neutral=70, tired=50, sad=30, angry=20
    const MOOD_WEIGHTS: Record<Emotion, number> = { happy: 90, neutral: 70, tired: 50, sad: 30, angry: 20 };
    let weightedScore = 0;
    for (const [e, pct] of Object.entries(breakdown)) {
      weightedScore += MOOD_WEIGHTS[e as Emotion] * (pct / 100);
    }
    setMoodScore(Math.round(weightedScore));

    // Call backend MCP
    const token = localStorage.getItem("moodsync_token");
    if (token) {
      try {
                        const res = await fetch(`${API_URL}/emotions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ emotion, mode, playlist, confidence, platform: musicPlatform, mood_score: Math.round(weightedScore), scan_type: "pre" })
        });

        if (!res.ok) {
          try {
            const errorData = await res.json();
            toast.error(errorData.message || errorData.error || `Emotion detection failed (${res.status})`);
          } catch {
            toast.error(`Emotion detection failed (${res.status})`);
          }
          return;
        }

        const data = await res.json();
        if (data.ai_message || data.playlist_id) {
          setResult(prev => ({
            ...prev,
            aiMessage: data.ai_message,
            mcpPlaylistId: data.playlist_id,
            mcpPlatform: musicPlatform
          }));
        }
      } catch (err) {
        console.error("Failed to save emotion:", err);
      }
    }

    // After 3s showing result, start therapy timer
    setTimeout(() => {
      setScanPhase("therapy");
      setTherapyTimeLeft(THERAPY_DURATION);
      therapyTimerRef.current = setInterval(() => {
        setTherapyTimeLeft(prev => {
          if (prev <= 1) {
            if (therapyTimerRef.current) clearInterval(therapyTimerRef.current);
            setScanPhase("done");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 3000);
  }, [musicPlatform]);

  // Start a new scan
  const startScan = useCallback(() => {
    // Reset counts
    emotionCountsRef.current = { happy: 0, neutral: 0, sad: 0, angry: 0, tired: 0 };
    setScanProgress(0);
    setScanPhase("scanning");
    scanStartRef.current = Date.now();
    setResult(prev => ({ ...prev, aiMessage: undefined, mcpPlaylistId: undefined }));

    // End scan after SCAN_DURATION seconds
    scanTimerRef.current = setTimeout(() => {
      setScanPhase("result");
      finalizeScan();
    }, SCAN_DURATION * 1000);

    toast.success(`Scanning your mood for ${SCAN_DURATION} seconds...`);
  }, [finalizeScan]);

  const startDetection = useCallback(() => {
    if (!modelsLoaded) return;
    setDetecting(true);
    detectEmotion();
    intervalRef.current = setInterval(detectEmotion, 1000); // detect every 1s during scan
  }, [modelsLoaded, detectEmotion]);

  const stopDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    if (therapyTimerRef.current) {
      clearInterval(therapyTimerRef.current);
      therapyTimerRef.current = null;
    }
    setDetecting(false);
    setDetectionState("idle");
    setScanPhase("idle");
    setScanProgress(0);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      const msg = "Camera API not available. Use HTTPS or a modern browser.";
      setCameraError(msg);
      toast.error(msg);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise<void>((resolve) => {
          if (!videoRef.current) return;
          videoRef.current.onloadedmetadata = () => resolve();
        });
        await videoRef.current.play();
      }

      setCameraActive(true);
      setDetectionState("idle");
      toast.success("Camera activated — detection starting...");

      // Auto-start detection after camera activates
      if (modelsLoaded) {
        setTimeout(() => {
          setDetecting(true);
        }, 500);
      }
    } catch (err) {
      let msg = "Could not access camera.";
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") msg = "Camera permission denied.";
        else if (err.name === "NotFoundError") msg = "No camera found.";
        else if (err.name === "NotReadableError") msg = "Camera in use by another app.";
        else msg = `Camera error: ${err.message}`;
      }
      setCameraError(msg);
      toast.error(msg);
    }
  }, [modelsLoaded]);

  // Auto-start detection when camera becomes active and models are loaded
  useEffect(() => {
    if (cameraActive && modelsLoaded && !detecting) {
      startDetection();
    }
  }, [cameraActive, modelsLoaded]); // intentionally not including detecting/startDetection

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
    setCameraError(null);
    setDetectionState("idle");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDetecting(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      stopDetection();
    };
  }, [stopCamera, stopDetection]);

  const spotifyPlaylistId = result.mcpPlaylistId ?? (SPOTIFY_MAP[language]?.[result.mode] ?? SPOTIFY_MAP.english[result.mode]);

  return {
    videoRef,
    modelsLoaded,
    detecting,
    result,
    cameraActive,
    cameraError,
    language,
    musicPlatform,
    detectionState,
    scanPhase,
    scanProgress,
    therapyTimeLeft,
    emotionBreakdown,
    moodScore,
    SCAN_DURATION,
    THERAPY_DURATION,
    setLanguage,
    setMusicPlatform,
    startCamera,
    stopCamera,
    startDetection,
    stopDetection,
    startScan,
    spotifyPlaylistId,
  };
}
