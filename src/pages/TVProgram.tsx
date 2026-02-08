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

interface AiringEpisode {
  id: number;
  name: string;
  show_id: number;
  episode_number: number;
  season_number: number;
  air_date: string;
  overview: string;
  still_path: string | null;
  vote_average: number;
  show?: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  };
}

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
}

const fetchAiringToday = async (date: Date): Promise<TMDBAiringResult[]> => {
  const dateStr = format(date, "yyyy-MM-dd");
  const res = await fetch(
    `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=fr-FR&sort_by=popularity.desc&air_date.gte=${dateStr}&air_date.lte=${dateStr}&watch_region=FR&with_watch_monetization_types=flatrate&page=1`
  );
  if (!res.ok) throw new Error("Erreur TMDB");
  const data = await res.json();
  return data.results || [];
};

const TVProgram = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: shows, isLoading } = useQuery({
    queryKey: ["tvProgram", format(selectedDate, "yyyy-MM-dd")],
    queryFn: () => fetchAiringToday(selectedDate),
    staleTime: 15 * 60 * 1000,
  });

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
            Programme TV
          </h1>
          <p className="text-muted-foreground">Séries diffusées sur les plateformes de streaming</p>
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

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : !shows || shows.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-xl">Aucune diffusion trouvée pour cette date</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shows.map((show) => (
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
                  {show.vote_average > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="text-yellow-400">★</span>
                      {show.vote_average.toFixed(1)}
                    </div>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-3">
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
