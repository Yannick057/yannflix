// src/components/SeasonsList.tsx

import { useState } from "react";
import { ChevronDown, ChevronUp, Calendar, Clock, Star } from "lucide-react";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAllSeasons } from "@/hooks/useTVSeasons";
import { getImageUrl } from "@/lib/tmdb";
import type { TMDBSeasonDetail, TMDBEpisode } from "@/lib/tmdb-tv";

interface SeasonsListProps {
  tvId: number;
  className?: string;
}

export function SeasonsList({ tvId, className }: SeasonsListProps) {
  const { data: seasons, isLoading, error } = useAllSeasons(tvId);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <h2 className="text-xl font-semibold text-foreground">Saisons & Épisodes</h2>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error || !seasons || seasons.length === 0) {
    return null;
  }

  const toggleSeason = (seasonNumber: number) => {
    setExpandedSeason(expandedSeason === seasonNumber ? null : seasonNumber);
  };

  const now = new Date();

  return (
    <div className={cn("space-y-4", className)}>
      <h2 className="text-xl font-semibold text-foreground">
        Saisons & Épisodes ({seasons.length} saison{seasons.length > 1 ? "s" : ""})
      </h2>

      <div className="space-y-3">
        {seasons.map((season) => (
          <SeasonItem
            key={season.season_number}
            season={season}
            isExpanded={expandedSeason === season.season_number}
            onToggle={() => toggleSeason(season.season_number)}
            now={now}
          />
        ))}
      </div>
    </div>
  );
}

interface SeasonItemProps {
  season: TMDBSeasonDetail;
  isExpanded: boolean;
  onToggle: () => void;
  now: Date;
}

function SeasonItem({ season, isExpanded, onToggle, now }: SeasonItemProps) {
  const airDate = season.air_date ? parseISO(season.air_date) : null;
  const isUpcoming = airDate ? isAfter(airDate, now) : false;
  const airedEpisodes = season.episodes?.filter(
    (ep) => ep.air_date && isBefore(parseISO(ep.air_date), now)
  ).length || 0;

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Season header */}
      <Button
        variant="ghost"
        className="w-full h-auto p-4 justify-between hover:bg-secondary/50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          {season.poster_path && (
            <img
              src={getImageUrl(season.poster_path, "w200")}
              alt={season.name}
              className="w-16 h-24 object-cover rounded-md hidden sm:block"
            />
          )}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{season.name}</h3>
              {isUpcoming && (
                <Badge className="bg-primary text-primary-foreground text-xs">
                  À venir
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              {airDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {format(airDate, "d MMM yyyy", { locale: fr })}
                </span>
              )}
              <span>
                {airedEpisodes}/{season.episode_count} épisodes
              </span>
            </div>
          </div>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </Button>

      {/* Episodes list */}
      {isExpanded && season.episodes && (
        <div className="border-t border-border">
          {season.episodes.map((episode) => (
            <EpisodeItem key={episode.id} episode={episode} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}

interface EpisodeItemProps {
  episode: TMDBEpisode;
  now: Date;
}

function EpisodeItem({ episode, now }: EpisodeItemProps) {
  const airDate = episode.air_date ? parseISO(episode.air_date) : null;
  const isUpcoming = airDate ? isAfter(airDate, now) : false;
  const isNew = airDate
    ? isBefore(airDate, now) && isAfter(airDate, new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000))
    : false;

  return (
    <div
      className={cn(
        "flex gap-4 p-4 border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors",
        isUpcoming && "opacity-60"
      )}
    >
      {/* Episode still */}
      <div className="shrink-0 w-28 h-16 rounded-md overflow-hidden bg-secondary hidden sm:block">
        {episode.still_path ? (
          <img
            src={getImageUrl(episode.still_path, "w300")}
            alt={episode.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            Pas d'image
          </div>
        )}
      </div>

      {/* Episode info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground font-medium">
            E{episode.episode_number}
          </span>
          <h4 className="font-medium text-foreground truncate">{episode.name}</h4>
          {isNew && (
            <Badge className="bg-primary/20 text-primary text-xs">Nouveau</Badge>
          )}
          {isUpcoming && (
            <Badge variant="outline" className="text-xs">
              À venir
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
          {airDate && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {format(airDate, "d MMM yyyy", { locale: fr })}
            </span>
          )}
          {episode.runtime && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {episode.runtime} min
            </span>
          )}
          {episode.vote_average > 0 && (
            <span className="flex items-center gap-1">
              <Star size={12} className="text-yellow-500" />
              {episode.vote_average.toFixed(1)}
            </span>
          )}
        </div>

        {episode.overview && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {episode.overview}
          </p>
        )}
      </div>
    </div>
  );
}
