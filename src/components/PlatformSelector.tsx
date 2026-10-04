import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Headphones } from "lucide-react";
import type { MusicPlatform } from "@/hooks/useEmotionDetection";

interface PlatformSelectorProps {
  platform: MusicPlatform;
  onPlatformChange: (platform: MusicPlatform) => void;
}

const PLATFORMS: { value: MusicPlatform; label: string }[] = [
  { value: "spotify", label: "Spotify" },
  { value: "wynk", label: "Wynk Music" },
  { value: "jiosaavn", label: "JioSaavn" },
  { value: "gaana", label: "Gaana" },
];

export function PlatformSelector({ platform, onPlatformChange }: PlatformSelectorProps) {
  const currentPlatform = PLATFORMS.find((p) => p.value === platform) || PLATFORMS[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="font-mono text-[10px] h-8 px-2.5">
          <Headphones className="w-3 h-3 mr-1.5" />
          {currentPlatform.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[140px] bg-card/95 backdrop-blur-xl border border-border">
        {PLATFORMS.map((p) => (
          <DropdownMenuItem
            key={p.value}
            onClick={() => onPlatformChange(p.value)}
            className={`cursor-pointer ${platform === p.value ? "bg-accent/10 text-accent font-medium glow-accent" : "text-muted-foreground hover:text-foreground"}`}
          >
            {p.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
