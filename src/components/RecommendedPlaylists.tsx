import { motion } from "framer-motion";
import { Music, ExternalLink } from "lucide-react";
import type { MusicMode } from "@/hooks/useEmotionDetection";
import { RECOMMENDED_PLAYLISTS } from "@/hooks/useEmotionDetection";

interface RecommendedPlaylistsProps {
  mode: MusicMode;
  onSelect: (playlistId: string) => void;
}

const MODE_LABELS: Record<MusicMode, string> = {
  focus: "Focus",
  relax: "Relax",
  calm: "Calm",
};

export function RecommendedPlaylists({ mode, onSelect }: RecommendedPlaylistsProps) {
  const playlists = RECOMMENDED_PLAYLISTS[mode];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass rounded-xl overflow-hidden border border-border/70"
    >
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Music className="w-3.5 h-3.5 text-accent" />
          Recommended for {MODE_LABELS[mode]} Mode
        </h3>
      </div>
      <div className="p-3 space-y-2">
        {playlists.map((pl, i) => (
          <motion.button
            key={pl.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            onClick={() => onSelect(pl.id)}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/40 hover:bg-secondary/80 border border-border/30 hover:border-primary/30 transition-all group text-left"
          >
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Music className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{pl.name}</p>
              <p className="text-[11px] font-mono text-muted-foreground truncate">{pl.description}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
