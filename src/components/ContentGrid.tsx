import { Content } from '@/types/content';
import { ContentCard } from './ContentCard';
import { cn } from '@/lib/utils';

interface ContentGridProps {
  content: Content[];
  onAddToList?: (content: Content) => void;
  onAddToWatchlist?: (content: Content) => void;
  watchlist?: (string | number)[];
  className?: string;
  emptyMessage?: string;
}

export function ContentGrid({ 
  content, 
  onAddToList,
  onAddToWatchlist, 
  watchlist = [],
  className,
  emptyMessage = "Aucun contenu trouvé"
}: ContentGridProps) {
  const handleAddToList = onAddToList || onAddToWatchlist;
  if (content.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <svg
            className="h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
            />
          </svg>
        </div>
        <p className="text-lg font-medium text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-5",
        "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
        className
      )}
    >
      {content.map((item, index) => (
        <div
          key={item.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ContentCard
            content={item}
            onAddToList={handleAddToList}
            isInList={watchlist.includes(item.id) || (item.tmdbId !== undefined && watchlist.includes(item.tmdbId))}
          />
        </div>
      ))}
    </div>
  );
}
