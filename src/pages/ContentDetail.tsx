import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Plus, Check, Eye, Ban, ExternalLink, Star, Clock, Calendar, MapPin, Users } from 'lucide-react';
import { useState } from 'react';
import { getContentById } from '@/data/mockContent';
import { Navbar } from '@/components/Navbar';
import { StreamingBadge } from '@/components/StreamingBadge';
import { RatingBadge } from '@/components/RatingBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ContentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const content = getContentById(id || '');
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watched, setWatched] = useState(false);
  const [notInterested, setNotInterested] = useState(false);

  if (!content) {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Backdrop */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img
          src={content.backdrop_url || content.poster_url}
          alt={content.title}
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
                src={content.poster_url}
                alt={content.title}
                className="w-48 md:w-64 rounded-xl shadow-hover"
              />
            </div>

            {/* Details */}
            <div className="flex-1 space-y-6">
              {/* Title and meta */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className="uppercase text-xs">
                    {content.type === 'movie' ? 'Film' : 'Série'}
                  </Badge>
                  {content.leaving_date && (
                    <Badge variant="destructive" className="text-xs">
                      <Clock size={12} className="mr-1" />
                      Bientôt indisponible
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                  {content.title}
                </h1>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    {content.year}
                  </div>
                  {content.runtime && (
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      {content.type === 'movie'
                        ? `${Math.floor(content.runtime / 60)}h ${content.runtime % 60}min`
                        : `${content.seasons} saison${content.seasons! > 1 ? 's' : ''}`}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <MapPin size={16} />
                    {content.country}
                  </div>
                  <RatingBadge rating={content.imdb_rating} size="lg" />
                </div>

                {/* Genres */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {content.genres.map((genre) => (
                    <Badge key={genre} variant="secondary" className="text-sm">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
                >
                  <Play size={20} className="mr-2" />
                  Regarder
                </Button>
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
                <p className="text-muted-foreground leading-relaxed">{content.overview}</p>
              </div>

              {/* Cast */}
              {content.cast && content.cast.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Users size={20} />
                    Casting
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {content.cast.map((actor) => (
                      <Badge key={actor} variant="outline" className="text-sm">
                        {actor}
                      </Badge>
                    ))}
                  </div>
                  {content.director && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Réalisé par <span className="text-foreground font-medium">{content.director}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Where to watch */}
              <div className="rounded-xl bg-card border border-border p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Où regarder
                </h2>
                <div className="space-y-3">
                  {content.streaming_services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between rounded-lg bg-secondary/30 p-4 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <StreamingBadge platform={service.id} size="lg" />
                        <div>
                          <p className="font-medium text-foreground">{service.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {service.type === 'subscription' && 'Abonnement inclus'}
                            {service.type === 'rent' && `Location • ${service.price}€`}
                            {service.type === 'buy' && `Achat • ${service.price}€`}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ExternalLink size={18} />
                      </Button>
                    </div>
                  ))}
                </div>
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
