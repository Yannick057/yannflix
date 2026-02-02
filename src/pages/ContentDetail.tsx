import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Plus, Check, Eye, Ban, ExternalLink, Clock, Calendar, MapPin, Users } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { StreamingBadge } from '@/components/StreamingBadge';
import { RatingBadge } from '@/components/RatingBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useContentDetail } from '@/hooks/useContent';
import { getImageUrl, GENRES } from '@/lib/tmdb';

interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
}

const ContentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watched, setWatched] = useState(false);
  const [notInterested, setNotInterested] = useState(false);

  // Parse the id to get type and tmdbId
  const parsedId = useMemo(() => {
    if (!id) return null;
    const [type, tmdbId] = id.split('-');
    return {
      type: type as 'movie' | 'tv',
      tmdbId: parseInt(tmdbId, 10),
    };
  }, [id]);

  const { data: content, isLoading, error } = useContentDetail(
    parsedId?.tmdbId || 0,
    parsedId?.type || 'movie'
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="relative h-[50vh] md:h-[60vh]">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="container mx-auto px-4 -mt-64 relative z-10">
          <div className="flex flex-col gap-8 md:flex-row">
            <Skeleton className="w-48 md:w-64 h-80 rounded-xl" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground">Contenu non trouvé</h1>
          <p className="mt-2 text-muted-foreground">Le contenu que vous cherchez n'existe pas.</p>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  // Extract data from TMDB response
  const title = content.title || content.name || 'Sans titre';
  const year = (content.release_date || content.first_air_date || '').split('-')[0];
  const runtime = content.runtime;
  const seasons = content.number_of_seasons;
  const type = parsedId?.type || 'movie';
  const country = content.production_countries?.[0]?.iso_3166_1 || 'N/A';
  const rating = content.vote_average ? Math.round(content.vote_average * 10) / 10 : 0;
  const genres = content.genres?.map(g => g.name) || [];
  const cast = content.credits?.cast?.slice(0, 10).map(c => c.name) || [];
  const director = content.credits?.crew?.find(c => c.job === 'Director')?.name;
  
  // Watch providers (JustWatch data via TMDB)
  const watchProviders = content['watch/providers']?.results?.FR;
  const flatrateProviders = watchProviders?.flatrate || [];
  const rentProviders = watchProviders?.rent || [];
  const buyProviders = watchProviders?.buy || [];
  const providerLink = watchProviders?.link;

  // Get trailer
  const trailer = content.videos?.results?.find(
    v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Backdrop */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img
          src={getImageUrl(content.backdrop_path || content.poster_path, 'original')}
          alt={title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4">
        <div className="-mt-64 relative z-10">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
            Retour
          </Link>

          <div className="flex flex-col gap-8 md:flex-row">
            {/* Poster */}
            <div className="shrink-0">
              <img
                src={getImageUrl(content.poster_path, 'w500')}
                alt={title}
                className="w-48 md:w-64 rounded-xl shadow-hover"
              />
            </div>

            {/* Details */}
            <div className="flex-1 space-y-6">
              {/* Title and meta */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className="uppercase text-xs">
                    {type === 'movie' ? 'Film' : 'Série'}
                  </Badge>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                  {title}
                </h1>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    {year}
                  </div>
                  {runtime && type === 'movie' && (
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      {`${Math.floor(runtime / 60)}h ${runtime % 60}min`}
                    </div>
                  )}
                  {seasons && type === 'tv' && (
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      {`${seasons} saison${seasons > 1 ? 's' : ''}`}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    {country}
                  </div>
                  <RatingBadge rating={rating} size="lg" />
                </div>

                {/* Genres */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <Badge key={genre} variant="secondary" className="text-sm">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                {trailer && (
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
                    asChild
                  >
                    <a href={`https://www.youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noopener noreferrer">
                      <Play size={20} className="mr-2" />
                      Bande-annonce
                    </a>
                  </Button>
                )}
                <Button
                  size="lg"
                  variant={inWatchlist ? 'default' : 'outline'}
                  onClick={() => setInWatchlist(!inWatchlist)}
                  className={cn(inWatchlist && 'bg-primary text-primary-foreground')}
                >
                  {inWatchlist ? <Check size={20} className="mr-2" /> : <Plus size={20} className="mr-2" />}
                  {inWatchlist ? 'Dans ma liste' : 'Ajouter à ma liste'}
                </Button>
                <Button
                  size="lg"
                  variant={watched ? 'default' : 'outline'}
                  onClick={() => setWatched(!watched)}
                  className={cn(watched && 'bg-secondary text-foreground')}
                >
                  <Eye size={20} className="mr-2" />
                  {watched ? 'Vu' : 'Marquer comme vu'}
                </Button>
                <Button
                  size="lg"
                  variant={notInterested ? 'destructive' : 'outline'}
                  onClick={() => setNotInterested(!notInterested)}
                >
                  <Ban size={20} className="mr-2" />
                  Pas intéressé
                </Button>
              </div>

              {/* Synopsis */}
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">Synopsis</h2>
                <p className="text-muted-foreground leading-relaxed">{content.overview || 'Aucun synopsis disponible.'}</p>
              </div>

              {/* Cast */}
              {cast.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Users size={20} />
                    Casting
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {cast.map((actor) => (
                      <Badge key={actor} variant="outline" className="text-sm">
                        {actor}
                      </Badge>
                    ))}
                  </div>
                  {director && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Réalisé par <span className="text-foreground font-medium">{director}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Where to watch - JustWatch data */}
              <div className="rounded-xl bg-card border border-border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    Où regarder
                  </h2>
                  {providerLink && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={providerLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={16} className="mr-1" />
                        JustWatch
                      </a>
                    </Button>
                  )}
                </div>

                {flatrateProviders.length === 0 && rentProviders.length === 0 && buyProviders.length === 0 ? (
                  <p className="text-muted-foreground">Aucune plateforme de streaming disponible pour la France.</p>
                ) : (
                  <div className="space-y-4">
                    {/* Subscription */}
                    {flatrateProviders.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Abonnement</p>
                        <div className="flex flex-wrap gap-3">
                          {flatrateProviders.map((provider: WatchProvider) => (
                            <div
                              key={provider.provider_id}
                              className="flex items-center gap-2 rounded-lg bg-secondary/30 p-3 hover:bg-secondary/50 transition-colors"
                            >
                              <StreamingBadge 
                                platform={provider.provider_name.toLowerCase().replace(/\s+/g, '')} 
                                logoPath={provider.logo_path}
                                name={provider.provider_name}
                                size="lg" 
                              />
                              <span className="text-sm font-medium text-foreground">{provider.provider_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rent */}
                    {rentProviders.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Location</p>
                        <div className="flex flex-wrap gap-3">
                          {rentProviders.map((provider: WatchProvider) => (
                            <div
                              key={provider.provider_id}
                              className="flex items-center gap-2 rounded-lg bg-secondary/30 p-3 hover:bg-secondary/50 transition-colors"
                            >
                              <StreamingBadge 
                                platform={provider.provider_name.toLowerCase().replace(/\s+/g, '')} 
                                logoPath={provider.logo_path}
                                name={provider.provider_name}
                                size="lg" 
                              />
                              <span className="text-sm font-medium text-foreground">{provider.provider_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Buy */}
                    {buyProviders.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Achat</p>
                        <div className="flex flex-wrap gap-3">
                          {buyProviders.map((provider: WatchProvider) => (
                            <div
                              key={provider.provider_id}
                              className="flex items-center gap-2 rounded-lg bg-secondary/30 p-3 hover:bg-secondary/50 transition-colors"
                            >
                              <StreamingBadge 
                                platform={provider.provider_name.toLowerCase().replace(/\s+/g, '')} 
                                logoPath={provider.logo_path}
                                name={provider.provider_name}
                                size="lg" 
                              />
                              <span className="text-sm font-medium text-foreground">{provider.provider_name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom padding */}
      <div className="h-16" />
    </div>
  );
};

export default ContentDetail;
