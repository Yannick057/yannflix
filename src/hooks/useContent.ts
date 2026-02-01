// src/hooks/useContent.ts

import { useQuery } from "@tanstack/react-query";
import {
  searchContent,
  discoverMovies,
  discoverTVShows,
  getContentDetails,
  getTrending,
  TMDBResponse,
  TMDBDetailResponse,
} from "@/lib/tmdb";

export const useSearchContent = (query: string, page = 1) => {
  return useQuery<TMDBResponse>({
    queryKey: ["search", query, page],
    queryFn: () => searchContent(query, page),
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000, // 5 min
  });
};

export const useDiscoverContent = (
  type: "movie" | "tv",
  filters: Record<string, any>
) => {
  return useQuery<TMDBResponse>({
    queryKey: ["discover", type, filters],
    queryFn: () =>
      type === "movie" ? discoverMovies(filters) : discoverTVShows(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useContentDetail = (id: number, type: "movie" | "tv") => {
  return useQuery<TMDBDetailResponse>({
    queryKey: ["content", type, id],
    queryFn: () => getContentDetails(id, type),
    enabled: !!id && !!type,
    staleTime: 10 * 60 * 1000,
  });
};

export const useTrending = (mediaType: "all" | "movie" | "tv" = "all") => {
  return useQuery<TMDBResponse>({
    queryKey: ["trending", mediaType],
    queryFn: () => getTrending(mediaType),
    staleTime: 10 * 60 * 1000,
  });
};
