// src/components/LeavingSoonBadge.tsx
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, differenceInDays, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface LeavingSoonBadgeProps {
  date: string;
  platformName?: string;
  variant?: "small" | "large";
}

export function LeavingSoonBadge({
  date,
  platformName,
  variant = "small",
}: LeavingSoonBadgeProps) {
  const leavingDate = parseISO(date);
  const daysRemaining = differenceInDays(leavingDate, new Date());

  if (daysRemaining < 0) return null;

  const isUrgent = daysRemaining <= 7;
  const formattedDate = format(leavingDate, "d MMM", { locale: fr });

  if (variant === "small") {
    return (
      <div
        className={cn(
          "flex items-center gap-1 rounded px-2 py-1 text-xs font-medium",
          isUrgent
            ? "bg-destructive text-destructive-foreground"
            : "bg-amber-500/90 text-white"
        )}
      >
        <Clock size={12} />
        <span>
          {daysRemaining === 0
            ? "Dernier jour"
            : daysRemaining === 1
            ? "Demain"
            : `${daysRemaining}j`}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg p-3",
        isUrgent ? "bg-destructive/10 border border-destructive" : "bg-amber-500/10 border border-amber-500"
      )}
    >
      <AlertTriangle
        size={20}
        className={isUrgent ? "text-destructive" : "text-amber-500"}
      />
      <div className="flex-1">
        <p className={cn("font-medium", isUrgent ? "text-destructive" : "text-amber-500")}>
          {isUrgent ? "Bientôt indisponible !" : "Quitte la plateforme"}
        </p>
        <p className="text-sm text-muted-foreground">
          {platformName ? `Quitte ${platformName} le ` : "Disponible jusqu'au "}
          {formattedDate}
          {daysRemaining <= 3 && ` (${daysRemaining === 0 ? "aujourd'hui" : daysRemaining === 1 ? "demain" : `dans ${daysRemaining} jours`})`}
        </p>
      </div>
    </div>
  );
}
