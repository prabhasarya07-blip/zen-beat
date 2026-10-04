import type { MusicLanguage } from "@/hooks/useEmotionDetection";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

interface LanguageSelectorProps {
  language: MusicLanguage;
  onLanguageChange: (lang: MusicLanguage) => void;
}

const LANGUAGES: { value: MusicLanguage; label: string; flag: string }[] = [
  { value: "english", label: "English", flag: "🇬🇧" },
  { value: "hindi", label: "Hindi", flag: "🇮🇳" },
  { value: "telugu", label: "Telugu", flag: "🇮🇳" },
  { value: "tamil", label: "Tamil", flag: "🇮🇳" },
  { value: "other", label: "Other", flag: "🌍" },
];

export function LanguageSelector({ language, onLanguageChange }: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <Select value={language} onValueChange={(v) => onLanguageChange(v as MusicLanguage)}>
        <SelectTrigger className="w-[148px] h-9 font-mono text-xs bg-secondary border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.value} value={lang.value} className="font-mono text-xs">
              {lang.flag} {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
