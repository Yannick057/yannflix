import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRating, useSetRating } from "@/hooks/useUserRatings";

interface StarRatingProps {
  tmdbId: number;
  contentType: "movie" | "tv";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
};

export function StarRating({ tmdbId, contentType, size = "md", className }: StarRatingProps) {
  const { user } = useAuth();
  const { data: userRating } = useUserRating(tmdbId, contentType);
  const setRating = useSetRating();
  const [hovered, setHovered] = useState<number | null>(null);

  if (!user) return null;

  const currentRating = userRating?.rating || 0;
  const displayRating = hovered ?? currentRating;
  const iconSize = sizeMap[size];

  const handleClick = (star: number) => {
    // If clicking the same rating, remove it (set to the star value anyway for simplicity)
    setRating.mutate({ tmdbId, contentType, rating: star });
  };

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="p-0.5 transition-transform hover:scale-110 disabled:opacity-50"
          onClick={() => handleClick(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          disabled={setRating.isPending}
          aria-label={`Noter ${star} étoile${star > 1 ? "s" : ""}`}
        >
          <Star
            size={iconSize}
            className={cn(
              "transition-colors",
              star <= displayRating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/40"
            )}
          />
        </button>
      ))}
      {currentRating > 0 && (
        <span className="ml-1.5 text-sm text-muted-foreground">
          {currentRating}/5
        </span>
      )}
    </div>
  );
}
