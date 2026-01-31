import { Link } from 'react-router-dom';
import { Play, Plus, Clock, Check } from 'lucide-react';
import { Content } from '@/types/content';
import { StreamingBadge } from './StreamingBadge';
import { RatingBadge } from './RatingBadge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
  return (
    <Link
      to={`/content/${content.id}`}
      className="group relative block overflow-hidden rounded-lg bg-card shadow-card transition-all duration-300 hover:shadow-hover hover:scale-[1.02] hover:z-10"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={content.poster_url}
          alt={content.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Leaving soon badge */}
        {content.leaving_date && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground">
            <Clock size={12} />
            <span>Bientôt indisponible</span>
          </div>
        )}

        {/* Type badge */}
        <div className="absolute top-2 right-2 rounded bg-background/80 px-2 py-0.5 text-xs font-medium uppercase backdrop-blur-sm">
          {content.type === 'movie' ? 'Film' : 'Série'}
        </div>

        {/* Hover actions */}
        {showActions && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-glow hover:bg-primary/90"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Play size={20} className="ml-0.5" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                "h-10 w-10 rounded-full",
                isInList 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary/90 text-foreground hover:bg-primary hover:text-primary-foreground"
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToList?.(content);
              }}
            >
              {isInList ? <Check size={18} /> : <Plus size={18} />}
            </Button>
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

        {/* Streaming badges */}
        <div className="flex flex-wrap gap-1">
          {content.streaming_services.slice(0, 4).map((service) => (
            <StreamingBadge 
              key={service.id} 
              platform={service.id} 
              size="sm" 
            />
          ))}
          {content.streaming_services.length > 4 && (
            <span className="flex h-5 items-center px-1 text-xs text-muted-foreground">
              +{content.streaming_services.length - 4}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
