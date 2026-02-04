// src/components/FollowSeriesButton.tsx

import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  useFollowedSeries,
  useFollowSeries,
  useUnfollowSeries,
} from "@/hooks/useFollowedSeries";
import { cn } from "@/lib/utils";

interface FollowSeriesButtonProps {
  tmdbId: number;
  seriesName: string;
  variant?: "default" | "icon";
  className?: string;
}

export function FollowSeriesButton({
  tmdbId,
  seriesName,
  variant = "default",
  className,
}: FollowSeriesButtonProps) {
  const { user } = useAuth();
  const { data: followedSeries, isLoading: isLoadingFollowed } = useFollowedSeries();
  const followMutation = useFollowSeries();
  const unfollowMutation = useUnfollowSeries();

  const isFollowing = followedSeries?.some((s) => s.tmdb_id === tmdbId) || false;
  const isLoading =
    isLoadingFollowed || followMutation.isPending || unfollowMutation.isPending;

  const handleToggle = () => {
    if (isFollowing) {
      unfollowMutation.mutate(tmdbId);
    } else {
      followMutation.mutate({ tmdbId, seriesName });
    }
  };

  if (!user) {
    return null;
  }

  if (variant === "icon") {
    return (
      <Button
        size="icon"
        variant={isFollowing ? "default" : "outline"}
        className={cn(
          "h-10 w-10",
          isFollowing && "bg-primary text-primary-foreground",
          className
        )}
        onClick={handleToggle}
        disabled={isLoading}
        title={isFollowing ? "Désactiver les notifications" : "Activer les notifications"}
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : isFollowing ? (
          <Bell size={18} />
        ) : (
          <BellOff size={18} />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? "default" : "outline"}
      className={cn(isFollowing && "bg-primary text-primary-foreground", className)}
      onClick={handleToggle}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 size={16} className="mr-2 animate-spin" />
      ) : isFollowing ? (
        <Bell size={16} className="mr-2" />
      ) : (
        <BellOff size={16} className="mr-2" />
      )}
      {isFollowing ? "Notifications activées" : "Recevoir les notifications"}
    </Button>
  );
}
