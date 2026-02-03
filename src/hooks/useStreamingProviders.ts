// src/hooks/useStreamingProviders.ts
import { useQueries, useQuery } from "@tanstack/react-query";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority?: number;
}

export interface WatchProviderResult {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface ContentProviders {
  contentId: string;
  providers: WatchProviderResult | null;
  isLoading: boolean;
}

const fetchProviders = async (
  tmdbId: number,
  type: "movie" | "tv"
): Promise<WatchProviderResult | null> => {
  const url = `${TMDB_BASE_URL}/${type}/${tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`;
  const res = await fetch(url);
  
  if (!res.ok) {
    throw new Error("Failed to fetch providers");
  }
  
  const data = await res.json();
  return data.results?.FR || null;
};

// Hook pour un seul contenu
export const useContentProviders = (
  contentId: string,
  enabled = true
) => {
  const parsed = contentId?.split("-") || [];
  const type = parsed[0] as "movie" | "tv";
  const tmdbId = parseInt(parsed[1], 10);

  return useQuery({
    queryKey: ["providers", contentId],
    queryFn: () => fetchProviders(tmdbId, type),
    enabled: enabled && !!contentId && !isNaN(tmdbId),
    staleTime: 30 * 60 * 1000, // 30 minutes cache
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection
  });
};

// Hook pour plusieurs contenus en batch
export const useBatchProviders = (
  contentIds: string[],
  enabled = true
) => {
  const queries = useQueries({
    queries: contentIds.map((id) => {
      const parsed = id?.split("-") || [];
      const type = parsed[0] as "movie" | "tv";
      const tmdbId = parseInt(parsed[1], 10);

      return {
        queryKey: ["providers", id],
        queryFn: () => fetchProviders(tmdbId, type),
        enabled: enabled && !!id && !isNaN(tmdbId),
        staleTime: 30 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
      };
    }),
  });

  // Create a map of contentId -> providers
  const providersMap = new Map<string, WatchProviderResult | null>();
  const isLoadingMap = new Map<string, boolean>();

  contentIds.forEach((id, index) => {
    const query = queries[index];
    providersMap.set(id, query?.data || null);
    isLoadingMap.set(id, query?.isLoading || false);
  });

  return {
    providersMap,
    isLoadingMap,
    isAnyLoading: queries.some((q) => q.isLoading),
  };
};

// Mapping des provider IDs vers nos IDs internes
export const PROVIDER_TO_PLATFORM: Record<number, string> = {
  8: "netflix",
  119: "prime",
  337: "disney",
  381: "canal",
  350: "apple",
  56: "ocs",
  531: "paramount",
  283: "crunchyroll",
  415: "adn",
  1899: "max",
};

// Platform IDs pour le filtrage TMDB
export const PLATFORM_PROVIDER_IDS: Record<string, number> = {
  netflix: 8,
  prime: 119,
  disney: 337,
  canal: 381,
  apple: 350,
  ocs: 56,
  paramount: 531,
  crunchyroll: 283,
  adn: 415,
  max: 1899,
};
