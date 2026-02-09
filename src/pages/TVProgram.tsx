import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Loader2, Tv, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getImageUrl } from "@/lib/tmdb";
import { Link } from "react-router-dom";
import { format, addDays, subDays } from "date-fns";
import { fr } from "date-fns/locale";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

interface TMDBAiringResult {
  id: number;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date?: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
  origin_country?: string[];
  networks?: { id: number; name: string; logo_path: string | null }[];
}

const GENRE_MAP: Record<number, string> = {
  10759: "Action & Aventure",
  16: "Animation",
  35: "Comédie",
  80: "Crime",
  99: "Documentaire",
  18: "Drame",
  10751: "Familial",
  10762: "Enfants",
  9648: "Mystère",
  10763: "Actualités",
  10764: "Téléréalité",
  10765: "Science-Fiction & Fantastique",
  10766: "Feuilleton",
  10767: "Talk-show",
  10768: "Guerre & Politique",
  37: "Western",
};

const fetchAiringToday = async (date: Date): Promise<TMDBAiringResult[]> => {
  const dateStr = format(date, "yyyy-MM-dd");
  
  // Fetch multiple pages for a more complete program
  const pages = await Promise.all(
    [1, 2, 3].map(async (page) => {
      const res = await fetch(
        `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=fr-FR&sort_by=popularity.desc&air_date.gte=${dateStr}&air_date.lte=${dateStr}&page=${page}`
      );
      if (!res.ok) throw new Error("Erreur TMDB");
      const data = await res.json();
      return data.results || [];
    })
  );

  // Deduplicate by id
  const allShows = pages.flat();
  const seen = new Set<number>();
  return allShows.filter((show: TMDBAiringResult) => {
    if (seen.has(show.id)) return false;
    seen.add(show.id);
    return true;
  });
};

const TVProgram = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);

  const { data: shows, isLoading } = useQuery({
    queryKey: ["tvProgram", format(selectedDate, "yyyy-MM-dd")],
    queryFn: () => fetchAiringToday(selectedDate),
    staleTime: 15 * 60 * 1000,
  });

  const filteredShows = useMemo(() => {
    if (!shows) return [];
    if (!selectedGenre) return shows;
    return shows.filter((s) => s.genre_ids.includes(selectedGenre));
  }, [shows, selectedGenre]);

  // Collect all genres from current results
  const availableGenres = useMemo(() => {
    if (!shows) return [];
    const genreSet = new Set<number>();
    shows.forEach((s) => s.genre_ids.forEach((g) => genreSet.add(g)));
    return Array.from(genreSet)
      .filter((g) => GENRE_MAP[g])
      .sort((a, b) => (GENRE_MAP[a] || "").localeCompare(GENRE_MAP[b] || ""));
  }, [shows]);

  const dateLabel = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sel = new Date(selectedDate);
    sel.setHours(0, 0, 0, 0);
    const diff = Math.round((sel.getTime() - today.getTime()) / 86400000);
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return "Demain";
    if (diff === -1) return "Hier";
    return format(selectedDate, "EEEE d MMMM", { locale: fr });
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white mb-2">
            <Tv className="h-8 w-8 text-primary" />
            Programme TV complet
          </h1>
          <p className="text-muted-foreground">
            Toutes les séries et émissions diffusées aujourd'hui à travers le monde
          </p>
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setSelectedDate((d) => subDays(d, 1))}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-lg font-semibold text-white capitalize min-w-[200px] text-center">
            {dateLabel}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setSelectedDate((d) => addDays(d, 1))}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Genre filter */}
        {availableGenres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedGenre === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedGenre(null)}
            >
              Tous
            </Button>
            {availableGenres.map((genreId) => (
              <Button
                key={genreId}
                variant={selectedGenre === genreId ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGenre(genreId)}
              >
                {GENRE_MAP[genreId]}
              </Button>
            ))}
          </div>
        )}

        {/* Results count */}
        {!isLoading && filteredShows.length > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            {filteredShows.length} programme{filteredShows.length > 1 ? "s" : ""} trouvé{filteredShows.length > 1 ? "s" : ""}
          </p>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : filteredShows.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-xl">Aucune diffusion trouvée pour cette date</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredShows.map((show) => (
              <Link
                key={show.id}
                to={`/content/tv-${show.id}`}
                className="group flex gap-3 rounded-lg bg-card p-3 transition-all hover:bg-secondary/50 hover:shadow-md"
              >
                <img
                  src={getImageUrl(show.poster_path, "w200")}
                  alt={show.name}
                  className="h-28 w-20 flex-shrink-0 rounded object-cover"
                  loading="lazy"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {show.name}
                  </h3>
                  {show.origin_country && show.origin_country.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {show.origin_country.join(", ")}
                    </p>
                  )}
                  {show.genre_ids.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {show.genre_ids.slice(0, 2).map((gid) => (
                        <span key={gid} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                          {GENRE_MAP[gid] || "Autre"}
                        </span>
                      ))}
                    </div>
                  )}
                  {show.vote_average > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="text-yellow-400">★</span>
                      {show.vote_average.toFixed(1)}
                    </div>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {show.overview || "Pas de description disponible"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TVProgram;
