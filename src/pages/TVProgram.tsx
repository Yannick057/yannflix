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

// French TV network IDs on TMDB
const FRENCH_NETWORKS = [
  { id: 671, name: "TF1", logo: null as string | null },
  { id: 34, name: "France 2", logo: null as string | null },
  { id: 236, name: "France 3", logo: null as string | null },
  { id: 285, name: "Canal+", logo: null as string | null },
  { id: 1132, name: "M6", logo: null as string | null },
  { id: 223, name: "Arte", logo: null as string | null },
  { id: 78, name: "France 5", logo: null as string | null },
  { id: 817, name: "TMC", logo: null as string | null },
  { id: 818, name: "W9", logo: null as string | null },
  { id: 174, name: "TFX", logo: null as string | null },
  { id: 1714, name: "NRJ 12", logo: null as string | null },
  { id: 3153, name: "C8", logo: null as string | null },
  { id: 1947, name: "6ter", logo: null as string | null },
  { id: 3627, name: "CStar", logo: null as string | null },
  { id: 1695, name: "Gulli", logo: null as string | null },
  { id: 2001, name: "RMC Story", logo: null as string | null },
  { id: 2739, name: "RMC Découverte", logo: null as string | null },
];

interface TMDBShow {
  id: number;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

interface ChannelProgram {
  network: { id: number; name: string };
  shows: TMDBShow[];
  isLoading: boolean;
}

const fetchNetworkShows = async (networkId: number, date: Date): Promise<TMDBShow[]> => {
  const dateStr = format(date, "yyyy-MM-dd");
  const res = await fetch(
    `https://api.themoviedb.org/3/discover/tv?api_key=${TMDB_API_KEY}&language=fr-FR&sort_by=popularity.desc&air_date.gte=${dateStr}&air_date.lte=${dateStr}&with_networks=${networkId}&page=1`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.results || [];
};

const TVProgram = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedNetwork, setSelectedNetwork] = useState<number | null>(null);

  // Fetch shows for all French networks
  const { data: channelPrograms, isLoading } = useQuery({
    queryKey: ["tvProgramFR", format(selectedDate, "yyyy-MM-dd")],
    queryFn: async (): Promise<ChannelProgram[]> => {
      const results = await Promise.all(
        FRENCH_NETWORKS.map(async (network) => {
          const shows = await fetchNetworkShows(network.id, selectedDate);
          return { network, shows, isLoading: false };
        })
      );
      // Only return channels that have shows
      return results.filter((r) => r.shows.length > 0);
    },
    staleTime: 15 * 60 * 1000,
  });

  const filteredPrograms = useMemo(() => {
    if (!channelPrograms) return [];
    if (!selectedNetwork) return channelPrograms;
    return channelPrograms.filter((p) => p.network.id === selectedNetwork);
  }, [channelPrograms, selectedNetwork]);

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

  const totalShows = channelPrograms?.reduce((sum, p) => sum + p.shows.length, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white mb-2">
            <Tv className="h-8 w-8 text-primary" />
            Programme TV
          </h1>
          <p className="text-muted-foreground">
            Programmes diffusés sur les chaînes françaises
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

        {/* Channel filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedNetwork === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedNetwork(null)}
          >
            Toutes les chaînes
          </Button>
          {FRENCH_NETWORKS.map((network) => (
            <Button
              key={network.id}
              variant={selectedNetwork === network.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedNetwork(network.id)}
            >
              {network.name}
            </Button>
          ))}
        </div>

        {!isLoading && totalShows > 0 && (
          <p className="text-sm text-muted-foreground mb-4">
            {totalShows} programme{totalShows > 1 ? "s" : ""} sur {filteredPrograms.length} chaîne{filteredPrograms.length > 1 ? "s" : ""}
          </p>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : filteredPrograms.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-xl">Aucun programme trouvé pour cette date</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredPrograms.map((channel) => (
              <section key={channel.network.id}>
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2 border-b border-border pb-2">
                  <Tv className="h-5 w-5 text-primary" />
                  {channel.network.name}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({channel.shows.length} programme{channel.shows.length > 1 ? "s" : ""})
                  </span>
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {channel.shows.map((show) => (
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
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TVProgram;
