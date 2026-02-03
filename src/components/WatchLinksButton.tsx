// src/components/WatchLinksButton.tsx
import { ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getImageUrl } from "@/lib/tmdb";
import { WatchProvider } from "@/hooks/useStreamingProviders";

interface WatchLinksButtonProps {
  providers: {
    flatrate?: WatchProvider[];
    rent?: WatchProvider[];
    buy?: WatchProvider[];
    link?: string;
  } | null;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

export function WatchLinksButton({
  providers,
  variant = "default",
  size = "lg",
}: WatchLinksButtonProps) {
  if (!providers) return null;

  const hasProviders =
    (providers.flatrate?.length || 0) +
    (providers.rent?.length || 0) +
    (providers.buy?.length || 0) > 0;

  if (!hasProviders) return null;

  const handleProviderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (providers.link) {
      window.open(providers.link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant={variant}
          size={size}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
        >
          <Play size={20} className="mr-2" />
          Regarder
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-56"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subscription */}
        {providers.flatrate && providers.flatrate.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Inclus dans l'abonnement
            </DropdownMenuLabel>
            {providers.flatrate.map((p) => (
              <DropdownMenuItem
                key={p.provider_id}
                onClick={handleProviderClick}
                className="cursor-pointer"
              >
                <img
                  src={getImageUrl(p.logo_path, "w200")}
                  alt={p.provider_name}
                  className="h-5 w-5 rounded mr-2"
                />
                {p.provider_name}
                <ExternalLink size={12} className="ml-auto opacity-50" />
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {/* Rent */}
        {providers.rent && providers.rent.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Location
            </DropdownMenuLabel>
            {providers.rent.slice(0, 5).map((p) => (
              <DropdownMenuItem
                key={p.provider_id}
                onClick={handleProviderClick}
                className="cursor-pointer"
              >
                <img
                  src={getImageUrl(p.logo_path, "w200")}
                  alt={p.provider_name}
                  className="h-5 w-5 rounded mr-2"
                />
                {p.provider_name}
                <ExternalLink size={12} className="ml-auto opacity-50" />
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        {/* Buy */}
        {providers.buy && providers.buy.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Achat
            </DropdownMenuLabel>
            {providers.buy.slice(0, 5).map((p) => (
              <DropdownMenuItem
                key={p.provider_id}
                onClick={handleProviderClick}
                className="cursor-pointer"
              >
                <img
                  src={getImageUrl(p.logo_path, "w200")}
                  alt={p.provider_name}
                  className="h-5 w-5 rounded mr-2"
                />
                {p.provider_name}
                <ExternalLink size={12} className="ml-auto opacity-50" />
              </DropdownMenuItem>
            ))}
          </>
        )}

        {/* Full link */}
        {providers.link && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <a
                href={providers.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center text-primary"
              >
                Voir toutes les options
                <ExternalLink size={12} className="ml-2" />
              </a>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
