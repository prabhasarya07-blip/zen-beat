import { motion } from "framer-motion";
import type { MusicLanguage, MusicMode, MusicPlatform } from "@/hooks/useEmotionDetection";

interface MusicPlayerProps {
  spotifyPlaylistId: string;
  platform?: MusicPlatform;
  mode: MusicMode;
  language: MusicLanguage;
  zenMode: boolean;
  customPlaylistId?: string | null;
}

const ZEN_PLAYLIST_ID = "0vvXsWCC9xrXsKd4FyS8kM";

const LANGUAGE_LABELS: Record<MusicLanguage, string> = {
  english: "English",
  hindi: "Hindi",
  telugu: "Telugu",
  tamil: "Tamil",
  other: "Global",
};

const MODE_LABELS: Record<MusicMode, string> = {
  focus: "Focus",
  relax: "Relax",
  calm: "Calm",
};

export function MusicPlayer({ spotifyPlaylistId, platform = "spotify", mode, language, zenMode, customPlaylistId }: MusicPlayerProps) {
  const playlistId = zenMode ? ZEN_PLAYLIST_ID : (customPlaylistId || spotifyPlaylistId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-xl overflow-hidden border border-border/70"
    >
      <div className="p-4 border-b border-border flex items-center justify-between gap-3">
        <h3 className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
          {zenMode ? "🧘 Zen Mode — Deep Focus" : `🎵 ${LANGUAGE_LABELS[language]} • ${MODE_LABELS[mode]}`}
        </h3>
        {!zenMode && (
          <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-full">
            {customPlaylistId ? "Custom" : platform !== "spotify" ? platform.charAt(0).toUpperCase() + platform.slice(1) : "Adaptive Spotify"}
          </span>
        )}
      </div>
      
      {platform !== "spotify" ? (
        <div className="p-4 flex flex-col items-center justify-center min-h-[352px] bg-background/50 rounded-b-xl border-t border-border/50">
           <img src={platform === "wynk" ? "https://wynk.in/assets/icons/icon-192x192.png" : platform === "jiosaavn" ? "https://www.jiosaavn.com/favicon.ico" : "https://gaana.com/favicon.ico"} className="w-16 h-16 mb-4 rounded-xl shadow-lg opacity-80 bg-white p-1" alt={platform} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
           <p className="text-sm text-muted-foreground mb-6 font-mono text-center max-w-[250px]">
             AI has prepared a perfect {platform === "jiosaavn" ? "JioSaavn" : platform.charAt(0).toUpperCase() + platform.slice(1)} playlist for your current mood.
             <br/><br/>
             <span className="text-xs text-accent">Click the button below to start playing.</span>
           </p>
           <a 
            href={playlistId} 
            target="_blank" 
            rel="noreferrer"
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-bold text-sm tracking-wide hover:brightness-110 transition-colors shadow-[0_0_15px_rgba(var(--primary),0.3)] glow-primary"
           >
            Open in {platform === "jiosaavn" ? "JioSaavn" : platform.charAt(0).toUpperCase() + platform.slice(1)}
           </a>
        </div>
      ) : (
        <div className="p-4 relative group">
          <div className="absolute top-6 right-6 text-[10px] bg-background/80 px-2 py-1 rounded text-muted-foreground/70 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            Click Play (Browser autoplay disabled)
          </div>
          <iframe
            key={playlistId}
            src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0&autoplay=1`}
            width="100%"
            height="352"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="border-0 rounded-lg"
            title="Spotify Player"
          />
        </div>
      )}
    </motion.div>
  );
}
