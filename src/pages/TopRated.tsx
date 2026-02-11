import { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { useTopRated } from '@/hooks/useTopRated';
import { useContentDetail } from '@/hooks/useContent';
import { getImageUrl } from '@/lib/tmdb';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Trophy, Film, Tv, Filter, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const GENRE_OPTIONS = [
  'Action', 'Aventure', 'Animation', 'Comédie', 'Crime', 'Documentaire',
  'Drame', 'Familial', 'Fantastique', 'Histoire', 'Horreur', 'Musique',
  'Mystère', 'Romance', 'Science-Fiction', 'Thriller', 'Guerre', 'Western',
];

function TopRatedCard({ tmdbId, contentType, avgRating, totalRatings, rank, genreFilter, onGenresResolved }: {
  tmdbId: number;
  contentType: string;
  avgRating: number;
  totalRatings: number;
  rank: number;
  genreFilter: string[];
  onGenresResolved?: (genres: string[]) => void;
}) {
  const { data: content, isLoading } = useContentDetail(tmdbId, contentType as 'movie' | 'tv');

  if (isLoading) {
    return (
      <div className="flex gap-4 items-center p-4 rounded-xl bg-card border border-border">
        <Skeleton className="w-8 h-8 rounded-full" />
        <Skeleton className="w-16 h-24 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!content) return null;

  const contentGenres: string[] = content.genres?.map((g: { id: number; name: string }) => g.name) || [];

  // Filter by genre
  if (genreFilter.length > 0 && !genreFilter.some(g => contentGenres.includes(g))) {
    return null;
  }

  const title = content.title || content.name || 'Sans titre';
  const year = (content.release_date || content.first_air_date || '').split('-')[0];

  return (
    <Link
      to={`/content/${contentType}-${tmdbId}`}
      className="flex gap-4 items-center p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-lg shrink-0">
        {rank <= 3 ? <Trophy size={20} className={rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : 'text-amber-600'} /> : rank}
      </div>
      <img
        src={getImageUrl(content.poster_path, 'w200')}
        alt={title}
        className="w-16 h-24 rounded-lg object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs uppercase">
            {contentType === 'movie' ? 'Film' : 'Série'}
          </Badge>
          <span className="text-xs text-muted-foreground">{year}</span>
        </div>
        {contentGenres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {contentGenres.slice(0, 3).map((name) => (
              <span key={name} className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="text-right shrink-0">
        <div className="flex items-center gap-1 text-primary">
          <Star size={16} fill="currentColor" />
          <span className="font-bold">{avgRating}</span>
          <span className="text-muted-foreground text-xs">/5</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {totalRatings} vote{totalRatings > 1 ? 's' : ''}
        </p>
      </div>
    </Link>
  );
}

const TopRated = () => {
  const { data: topRated, isLoading } = useTopRated(1, 30);
  const [typeFilter, setTypeFilter] = useState<'all' | 'movie' | 'tv'>('all');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const filteredByType = topRated?.filter(item => {
    if (typeFilter !== 'all' && item.content_type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Trophy size={28} className="text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Classement des mieux notés</h1>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={16} className="text-muted-foreground" />
            <Button variant={typeFilter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter('all')}>
              Tous
            </Button>
            <Button variant={typeFilter === 'movie' ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter('movie')}>
              <Film size={14} className="mr-1" /> Films
            </Button>
            <Button variant={typeFilter === 'tv' ? 'default' : 'outline'} size="sm" onClick={() => setTypeFilter('tv')}>
              <Tv size={14} className="mr-1" /> Séries
            </Button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {selectedGenres.length > 0 && (
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => setSelectedGenres([])}>
                <X size={12} className="mr-1" /> Réinitialiser
              </Button>
            )}
            {GENRE_OPTIONS.map(genre => (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-medium transition-colors border",
                  selectedGenres.includes(genre)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/50"
                )}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center p-4 rounded-xl bg-card border border-border">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="w-16 h-24 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : !filteredByType || filteredByType.length === 0 ? (
          <div className="text-center py-16">
            <Star size={48} className="mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Aucun résultat</h2>
            <p className="text-muted-foreground">
              {topRated && topRated.length > 0
                ? 'Aucun contenu ne correspond à ces filtres.'
                : 'Soyez le premier à noter des films et séries !'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {filteredByType.map((item, index) => (
              <TopRatedCard
                key={`${item.content_type}-${item.tmdb_id}`}
                tmdbId={item.tmdb_id}
                contentType={item.content_type}
                avgRating={item.avg_rating}
                totalRatings={item.total_ratings}
                rank={index + 1}
                genreFilter={selectedGenres}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopRated;
