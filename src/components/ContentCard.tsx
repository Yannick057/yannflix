import { Link } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Check, Eye } from 'lucide-react';
import { Content } from '@/types/content';
import { RatingBadge } from './RatingBadge';
import { ProvidersBadges } from './ProvidersBadges';
import { LeavingSoonBadge } from './LeavingSoonBadge';
import { NewSeasonBadge } from './NewSeasonBadge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useContentProviders } from '@/hooks/useStreamingProviders';
import { useContentProgress } from '@/hooks/useContentProgress';

interface ContentCardProps {
  content: Content;
  onAddToList?: (content: Content) => void;
  isInList?: boolean;
  showActions?: boolean;
}

export function ContentCard({ 
  content, 
  onAddToList, 
  isInList = false,
  showActions = true 
}: ContentCardProps) {
  // Fetch providers for this content
  const { data: providers, isLoading: providersLoading } = useContentProviders(content.id);
  
  // Fetch watched episodes progress for series
  const tmdbId = content.tmdbId || (content.id ? parseInt(content.id.split('-').pop() || '0', 10) : undefined);
  const { data: progress } = useContentProgress(
    content.type === 'series' ? tmdbId : undefined,
    content.type
  );

  return (
    <Link
      to={`/content/${content.id}`}
      className="group relative block overflow-hidden rounded-lg bg-card shadow-card transition-all duration-300 hover:shadow-hover hover:scale-[1.02] hover:z-10"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={content.poster_url || content.posterUrl || '/placeholder.svg'}
          alt={content.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Top badges container */}
        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-2">
          {/* Left side - status badges */}
          <div className="flex flex-col gap-1">
            {/* Leaving soon badge */}
            {content.leaving_date && (
              <LeavingSoonBadge date={content.leaving_date} variant="small" />
            )}
            
            {/* New season badge for series */}
            {content.type === 'series' && content.newSeason && (
              <NewSeasonBadge 
                type="season" 
                number={content.newSeasonNumber}
                date={content.newSeasonDate}
                variant="small" 
              />
            )}
          </div>

          {/* Right side - type badge */}
          <div className="rounded bg-background/80 px-2 py-0.5 text-xs font-medium uppercase backdrop-blur-sm shrink-0">
            {content.type === 'movie' ? 'Film' : 'Série'}
          </div>
        </div>

        {/* Hover actions */}
        {showActions && (
          <div className="absolute bottom-2 right-2 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className={cn(
                    "h-9 w-9 rounded-full shadow-lg transition-transform duration-200 hover:scale-125",
                    isInList 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-card text-foreground hover:bg-primary hover:text-primary-foreground border border-border"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddToList?.(content);
                  }}
                >
                  {isInList ? <Check size={16} /> : <Plus size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left" className="text-xs">
                {isInList ? 'Retirer de ma liste' : 'Ajouter à ma liste'}
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      {/* Content info */}
      <div className="p-3">
        <h3 className="mb-1 truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {content.title}
        </h3>
        
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{content.year}</span>
          <span>•</span>
          <RatingBadge rating={content.imdb_rating} size="sm" />
          {content.runtime && (
            <>
              <span>•</span>
              <span>
                {content.type === 'movie' 
                  ? `${Math.floor(content.runtime / 60)}h${content.runtime % 60}m`
                  : `${content.seasons} saison${content.seasons! > 1 ? 's' : ''}`
                }
              </span>
            </>
          )}
        </div>

        {/* Streaming providers from API */}
        <ProvidersBadges 
          providers={providers?.flatrate} 
          isLoading={providersLoading}
          maxDisplay={4}
          size="sm"
        />

        {/* Watched episodes progress for series */}
        {content.type === 'series' && progress && progress.watchedCount > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-primary">
                <Eye size={12} />
                {progress.watchedCount}/{progress.totalEpisodes} épisodes
              </span>
              <span className="text-muted-foreground">{progress.percentage}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
