import { useState, useMemo } from "react";

import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/components/SearchBar";
import { FilterSidebar, FilterState } from "@/components/FilterSidebar";
import { ContentGrid } from "@/components/ContentGrid";

import { Content } from "@/types/content";

import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import {
  useSearchContent,
  useDiscoverContent,
  useTrending,
} from "@/hooks/useContent";
import {
  getImageUrl,
  GENRES,
  GENRE_IDS,
  TMDBContent,
} from "@/lib/tmdb";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    type: "all",
    genres: [],
    yearRange: [1990, 2024],
    minRating: 0,
    streamingServices: [],
    countries: [],
  });
  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Construction des filtres TMDB à partir de l'UI
  const tmdbFilters = useMemo(() => {
    const f: Record<string, any> = { page: 1 };

    if (filters.genres.length > 0) {
      const genreIds = filters.genres
        .map((g) => GENRE_IDS[g])
        .filter(Boolean);
      if (genreIds.length > 0) {
        f.with_genres = genreIds.join(",");
      }
    }

    if (filters.minRating > 0) {
      f["vote_average.gte"] = filters.minRating;
    }

    if (filters.yearRange[0] !== 1990 || filters.yearRange[1] !== 2024) {
      f["primary_release_date.gte"] = `${filters.yearRange[0]}-01-01`;
      f["primary_release_date.lte"] = `${filters.yearRange[1]}-12-31`;
      f["first_air_date.gte"] = `${filters.yearRange[0]}-01-01`;
      f["first_air_date.lte"] = `${filters.yearRange[1]}-12-31`;
    }

    return f;
  }, [filters]);

  // Requêtes TMDB via React Query
  const { data: searchResults, isLoading: searchLoading } =
    useSearchContent(searchQuery, 1);

  const { data: discoverMoviesData, isLoading: moviesLoading } =
    useDiscoverContent("movie", tmdbFilters);

  const { data: discoverTVData, isLoading: tvLoading } =
    useDiscoverContent("tv", tmdbFilters);

  const { data: trendingData, isLoading: trendingLoading } =
    useTrending("all");

  // Conversion TMDB -> type Content utilisé par ton UI
  const convertToContent = (item: TMDBContent): Content => {
    const isMovie = item.media_type === "movie" || !!item.title;

    const title = item.title || item.name || "Sans titre";
    const yearStr =
      (item.release_date || item.first_air_date || "").split("-")[0] || "";
    const rating = Number.isFinite(item.vote_average)
      ? Math.round(item.vote_average * 10) / 10
      : 0;

    const genres =
      item.genre_ids
        ?.map((id: number) => GENRES[id])
        .filter((g): g is string => Boolean(g)) || [];

    return {
      id: `${item.media_type || (isMovie ? "movie" : "tv")}-${item.id}`,
      tmdbId: item.id,
      type: isMovie ? "movie" : "series",
      title,
      year: yearStr,
      rating,
      imdb_rating: rating,
      posterUrl: getImageUrl(item.poster_path, "w500"),
      poster_url: getImageUrl(item.poster_path, "w500"),
      backdropUrl: getImageUrl(item.backdrop_path, "w780"),
      backdrop_url: getImageUrl(item.backdrop_path, "w780"),
      genres,
      overview: item.overview || "",
      streamingServices: [],
      streaming_services: [],
      country: "FR",
    };
  };

  // Préparation + filtrage du contenu
  const filteredContent = useMemo(() => {
    let results: Content[] = [];

    if (searchQuery && searchResults?.results) {
      // Mode recherche
      results = searchResults.results
        .filter(
          (item: TMDBContent) =>
            item.media_type === "movie" || item.media_type === "tv"
        )
        .map(convertToContent);
    } else {
      // Mode découverte
      if (filters.type === "all" && trendingData?.results) {
        results = trendingData.results.map(convertToContent);
      } else if (filters.type === "movie" && discoverMoviesData?.results) {
        results = discoverMoviesData.results.map(convertToContent);
      } else if (filters.type === "series" && discoverTVData?.results) {
        results = discoverTVData.results.map(convertToContent);
      } else if (filters.type === "all") {
        const movies =
          discoverMoviesData?.results?.map(convertToContent) || [];
        const tv = discoverTVData?.results?.map(convertToContent) || [];
        results = [...movies, ...tv].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
    }

    if (filters.countries.length > 0) {
      results = results.filter((item) =>
        filters.countries.includes(item.country)
      );
    }

    return results;
  }, [
    searchQuery,
    searchResults,
    discoverMoviesData,
    discoverTVData,
    trendingData,
    filters,
  ]);

  const handleAddToWatchlist = (content: Content) => {
    if (!content.tmdbId) return;

    setWatchlist((prev) =>
      prev.includes(content.tmdbId)
        ? prev.filter((id) => id !== content.tmdbId)
        : [...prev, content.tmdbId]
    );
  };

  const activeFilterCount =
    (filters.type !== "all" ? 1 : 0) +
    filters.genres.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.yearRange[0] !== 1990 || filters.yearRange[1] !== 2024 ? 1 : 0);

  const isLoading =
    searchLoading || moviesLoading || tvLoading || trendingLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navbar />

      {/* Hero section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/50 via-blue-900/50 to-teal-900/50 py-20">
        <div className="absolute inset-0 bg-grid-white/[0.05]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Trouvez votre prochain{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                film ou série
              </span>
            </h1>
            <p className="text-xl text-gray-300">
              Découvrez où regarder vos contenus préférés sur toutes les
              plateformes de streaming
            </p>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar filters={filters} onChange={setFilters} />
            </div>
          </aside>

          {/* Content area */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter + results */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-gray-300">
                <span className="font-semibold text-white">
                  {filteredContent.length}
                </span>{" "}
                résultat{filteredContent.length !== 1 ? "s" : ""}
                {searchQuery && (
                  <span className="ml-1">
                    pour{" "}
                    <span className="text-purple-400">
                      "{searchQuery}"
                    </span>
                  </span>
                )}
              </div>

              {/* Mobile filters */}
              <Sheet
                open={mobileFiltersOpen}
                onOpenChange={setMobileFiltersOpen}
              >
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtres
                    {activeFilterCount > 0 && (
                      <span className="ml-2 bg-purple-500 text-white rounded-full px-2 py-0.5 text-xs">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <h2 className="text-xl font-bold mb-4">Filtres</h2>
                  <FilterSidebar
                    filters={filters}
                    onChange={(newFilters) => {
                      setFilters(newFilters);
                      setMobileFiltersOpen(false);
                    }}
                  />
                </SheetContent>
              </Sheet>
            </div>

            {/* Content grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500" />
              </div>
            ) : filteredContent.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-xl">Aucun résultat trouvé</p>
                <p className="text-sm mt-2">
                  Essayez d&apos;ajuster vos filtres ou votre recherche
                </p>
              </div>
            ) : (
              <ContentGrid
                content={filteredContent}
                watchlist={watchlist}
                onAddToWatchlist={handleAddToWatchlist}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
