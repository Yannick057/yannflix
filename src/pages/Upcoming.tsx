import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { ContentGrid } from "@/components/ContentGrid";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Content } from "@/types/content";
import { getImageUrl, GENRES } from "@/lib/tmdb";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

interface TMDBResult {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
}

const fetchUpcoming = async (type: "movie" | "tv"): Promise<TMDBResult[]> => {
  const today = new Date().toISOString().split("T")[0];
  const future = new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0];

  const dateParam = type === "movie"
    ? `primary_release_date.gte=${today}&primary_release_date.lte=${future}`
    : `first_air_date.gte=${today}&first_air_date.lte=${future}`;

  const res = await fetch(
    `https://api.themoviedb.org/3/discover/${type}?api_key=${TMDB_API_KEY}&language=fr-FR&sort_by=popularity.desc&${dateParam}&page=1&page_size=40`
  );
  if (!res.ok) throw new Error("Erreur TMDB");
  const data = await res.json();
  return data.results || [];
};

const Upcoming = () => {
  const [tab, setTab] = useState<"all" | "movie" | "tv">("all");

  const { data: movies, isLoading: moviesLoading } = useQuery({
    queryKey: ["upcoming", "movie"],
    queryFn: () => fetchUpcoming("movie"),
    staleTime: 30 * 60 * 1000,
  });

  const { data: tvShows, isLoading: tvLoading } = useQuery({
    queryKey: ["upcoming", "tv"],
    queryFn: () => fetchUpcoming("tv"),
    staleTime: 30 * 60 * 1000,
  });

  const isLoading = moviesLoading || tvLoading;

  const content = useMemo(() => {
    const convert = (items: TMDBResult[] | undefined, type: "movie" | "series"): Content[] =>
      (items || []).map((item) => ({
        id: `${type === "movie" ? "movie" : "tv"}-${item.id}`,
        tmdbId: item.id,
        type,
        title: item.title || item.name || "Sans titre",
        year: (item.release_date || item.first_air_date || "").split("-")[0] || "",
        rating: Math.round(item.vote_average * 10) / 10,
        imdb_rating: Math.round(item.vote_average * 10) / 10,
        posterUrl: getImageUrl(item.poster_path, "w500"),
        poster_url: getImageUrl(item.poster_path, "w500"),
        backdropUrl: getImageUrl(item.backdrop_path, "w780"),
        backdrop_url: getImageUrl(item.backdrop_path, "w780"),
        genres: item.genre_ids?.map((id) => GENRES[id]).filter(Boolean) as string[] || [],
        overview: item.overview || "",
        country: "FR",
        streamingServices: [],
        streaming_services: [],
      }));

    if (tab === "movie") return convert(movies, "movie");
    if (tab === "tv") return convert(tvShows, "series");
    return [...convert(movies, "movie"), ...convert(tvShows, "series")].sort(
      (a, b) => (b.rating || 0) - (a.rating || 0)
    );
  }, [movies, tvShows, tab]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white mb-2">
            <Calendar className="h-8 w-8 text-primary" />
            À venir
          </h1>
          <p className="text-muted-foreground">Films et séries à venir dans les prochains mois</p>
        </div>

        <div className="flex gap-2 mb-6">
          {(["all", "movie", "tv"] as const).map((t) => (
            <Button
              key={t}
              variant={tab === t ? "default" : "secondary"}
              size="sm"
              onClick={() => setTab(t)}
            >
              {t === "all" ? "Tous" : t === "movie" ? "Films" : "Séries"}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <ContentGrid content={content} emptyMessage="Aucun contenu à venir trouvé" />
        )}
      </div>
    </div>
  );
};

export default Upcoming;
