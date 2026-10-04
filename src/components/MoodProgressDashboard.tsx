import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { API_URL } from "@/lib/apiConfig";
import type { Emotion } from "@/hooks/useEmotionDetection";
import { EMOTION_EMOJIS } from "@/hooks/useEmotionDetection";

interface ProgressEntry {
  id: number;
  emotion: string;
  mood_score: number;
  scan_type: string;
  confidence: number;
  detected_at: string;
}

const EMOTION_COLORS: Record<string, string> = {
  happy: "#22c55e",
  neutral: "#3b82f6",
  sad: "#6366f1",
  angry: "#ef4444",
  tired: "#eab308",
};

function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#3b82f6";
  if (score >= 40) return "#eab308";
  if (score >= 20) return "#f97316";
  return "#ef4444";
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MoodProgressDashboard() {
  const [data, setData] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("moodsync_token");
    if (!token) return;

            fetch(`${API_URL}/emotions/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) {
          return Promise.reject(new Error(`Progress fetch failed (${r.status})`));
        }
        return r.json();
      })
      .then((rows) => {
        setData(Array.isArray(rows) ? rows : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 rounded-xl glass border border-border/70 text-center">
        <p className="text-xs font-mono text-muted-foreground animate-pulse">Loading mood history...</p>
      </div>
    );
  }

  const entries = data.filter((d) => d.mood_score > 0);

  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-xl glass border border-border/70 text-center"
      >
        <p className="text-xs font-mono text-muted-foreground">
          No mood history yet. Complete a scan to start tracking your progress! 📊
        </p>
      </motion.div>
    );
  }

  // Chart dimensions
  const W = 500;
  const H = 160;
  const PAD = 30;
  const chartW = W - PAD * 2;
  const chartH = H - PAD * 2;

  // Build SVG path
  const maxScore = 100;
  const points = entries.map((e, i) => {
    const x = PAD + (i / Math.max(entries.length - 1, 1)) * chartW;
    const y = PAD + chartH - (e.mood_score / maxScore) * chartH;
    return { x, y, entry: e };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${PAD + chartH} L ${points[0].x} ${PAD + chartH} Z`;

  // Stats
  const latest = entries[entries.length - 1];
  const first = entries[0];
  const scoreDiff = latest.mood_score - first.mood_score;
  const avgScore = Math.round(entries.reduce((s, e) => s + e.mood_score, 0) / entries.length);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-xl glass border border-border/70 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
          📈 Mood Progress
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-muted-foreground">
            Avg: <span className="text-foreground font-bold">{avgScore}</span>
          </span>
          <span className={`text-[10px] font-mono font-bold ${scoreDiff >= 0 ? "text-green-400" : "text-red-400"}`}>
            {scoreDiff >= 0 ? "↑" : "↓"} {Math.abs(scoreDiff)} pts
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const y = PAD + chartH - (val / maxScore) * chartH;
            return (
              <g key={val}>
                <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="currentColor" strokeOpacity={0.08} strokeDasharray="4 4" />
                <text x={PAD - 5} y={y + 3} textAnchor="end" fontSize="8" fill="currentColor" opacity={0.3}>
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={getScoreColor(latest.mood_score)} stopOpacity="0.3" />
              <stop offset="100%" stopColor={getScoreColor(latest.mood_score)} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <motion.path
            d={areaPath}
            fill="url(#areaGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />

          {/* Line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke={getScoreColor(latest.mood_score)}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill={EMOTION_COLORS[p.entry.emotion] || "#888"} stroke="var(--background)" strokeWidth="2" />
              {/* Labels on first & last */}
              {(i === 0 || i === points.length - 1) && (
                <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="9" fontWeight="bold" fill={EMOTION_COLORS[p.entry.emotion] || "#888"}>
                  {p.entry.mood_score}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Session timeline */}
      <div className="px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {entries.slice(-6).map((e, i) => (
            <div
              key={e.id}
              className="flex-shrink-0 px-2.5 py-1.5 rounded-lg bg-muted/20 border border-border/50 text-center min-w-[70px]"
            >
              <p className="text-base">{EMOTION_EMOJIS[e.emotion as Emotion] || "😐"}</p>
              <p className="text-[10px] font-mono font-bold" style={{ color: getScoreColor(e.mood_score) }}>
                {e.mood_score}
              </p>
              <p className="text-[8px] font-mono text-muted-foreground">{formatTime(e.detected_at)}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
