// src/components/NewSeasonBadge.tsx
import { Sparkles, Tv } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, isAfter, subDays } from "date-fns";
import { fr } from "date-fns/locale";

interface NewSeasonBadgeProps {
  type: "season" | "episode";
  number?: number;
  date?: string;
  variant?: "small" | "large";
}

export function NewSeasonBadge({
  type,
  number,
  date,
  variant = "small",
}: NewSeasonBadgeProps) {
  // Check if the release is within the last 30 days (new)
  const isNew = date
    ? isAfter(parseISO(date), subDays(new Date(), 30))
    : true;

  if (!isNew && date) return null;

  const formattedDate = date
    ? format(parseISO(date), "d MMM yyyy", { locale: fr })
    : null;

  if (variant === "small") {
    return (
      <div
        className={cn(
          "flex items-center gap-1 rounded px-2 py-1 text-xs font-medium",
          "bg-gradient-to-r from-primary to-purple-500 text-white shadow-glow animate-pulse"
        )}
      >
        <Sparkles size={12} />
        <span>
          {type === "season"
            ? `S${number || "?"} nouvelle`
            : `Nouvel ép.`}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Tv size={20} />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-foreground flex items-center gap-2">
          {type === "season"
            ? `Nouvelle saison ${number ? `(S${number})` : ""}`
            : `Nouvel épisode`}
          <Sparkles size={14} className="text-primary" />
        </p>
        {formattedDate && (
          <p className="text-sm text-muted-foreground">
            Sorti le {formattedDate}
          </p>
        )}
      </div>
    </div>
  );
}
