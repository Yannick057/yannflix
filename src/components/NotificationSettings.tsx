// src/components/NotificationSettings.tsx

import { Bell, BellOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface NotificationSettingsProps {
  className?: string;
  variant?: "card" | "inline";
}

export function NotificationSettings({
  className,
  variant = "card",
}: NotificationSettingsProps) {
  const { user } = useAuth();
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  if (!user) {
    return (
      <div className={cn("text-muted-foreground text-sm", className)}>
        Connectez-vous pour activer les notifications.
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-muted-foreground text-sm",
          className
        )}
      >
        <AlertCircle size={16} />
        Les notifications ne sont pas supportées par votre navigateur.
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-destructive text-sm",
          className
        )}
      >
        <BellOff size={16} />
        Notifications bloquées. Modifiez les paramètres de votre navigateur.
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center justify-between gap-4", className)}>
        <div className="flex items-center gap-2">
          {isSubscribed ? (
            <Bell size={18} className="text-primary" />
          ) : (
            <BellOff size={18} className="text-muted-foreground" />
          )}
          <Label htmlFor="notifications" className="text-sm font-medium">
            Notifications nouvelles saisons
          </Label>
        </div>
        <Switch
          id="notifications"
          checked={isSubscribed}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl bg-card border border-border p-6 space-y-4",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            isSubscribed ? "bg-primary/20" : "bg-secondary"
          )}
        >
          {isSubscribed ? (
            <Bell size={20} className="text-primary" />
          ) : (
            <BellOff size={20} className="text-muted-foreground" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Notifications Push</h3>
          <p className="text-sm text-muted-foreground">
            Recevez des alertes pour les nouvelles saisons
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">
            Nouvelles saisons & épisodes
          </p>
          <p className="text-xs text-muted-foreground">
            Pour les séries dans votre liste "À regarder"
          </p>
        </div>
        <Switch
          checked={isSubscribed}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
      </div>

      {!isSubscribed && (
        <Button
          onClick={subscribe}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Chargement...
            </>
          ) : (
            <>
              <Bell size={16} className="mr-2" />
              Activer les notifications
            </>
          )}
        </Button>
      )}
    </div>
  );
}
