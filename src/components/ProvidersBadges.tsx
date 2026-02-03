// src/components/ProvidersBadges.tsx
import { getImageUrl } from "@/lib/tmdb";
import { cn } from "@/lib/utils";
import { WatchProvider } from "@/hooks/useStreamingProviders";
import { Skeleton } from "@/components/ui/skeleton";

interface ProvidersBadgesProps {
  providers: WatchProvider[] | null | undefined;
  isLoading?: boolean;
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
  showLinks?: boolean;
  providerLink?: string;
}

export function ProvidersBadges({
  providers,
  isLoading = false,
  maxDisplay = 4,
  size = "sm",
  showLinks = false,
  providerLink,
}: ProvidersBadgesProps) {
  const sizeClasses = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  if (isLoading) {
    return (
      <div className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className={cn("rounded", sizeClasses[size])} />
        ))}
      </div>
    );
  }

  if (!providers || providers.length === 0) {
    return null;
  }

  const displayed = providers.slice(0, maxDisplay);
  const remaining = providers.length - maxDisplay;

  const content = (
    <div className="flex flex-wrap gap-1 items-center">
      {displayed.map((provider) => (
        <img
          key={provider.provider_id}
          src={getImageUrl(provider.logo_path, "w200")}
          alt={provider.provider_name}
          title={provider.provider_name}
          className={cn(
            "rounded object-contain transition-transform hover:scale-110",
            sizeClasses[size]
          )}
        />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-muted-foreground">+{remaining}</span>
      )}
    </div>
  );

  if (showLinks && providerLink) {
    return (
      <a
        href={providerLink}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-80 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </a>
    );
  }

  return content;
}
