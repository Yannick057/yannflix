// src/hooks/useContent.ts

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
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

export const useInfiniteSearchContent = (query: string) => {
  return useInfiniteQuery<TMDBResponse>({
    queryKey: ["searchInfinite", query],
    queryFn: ({ pageParam = 1 }) => searchContent(query, pageParam as number),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDiscoverContent = (
  type: "movie" | "tv",
  filters: Record<string, unknown>
) => {
  return useQuery<TMDBResponse>({
    queryKey: ["discover", type, filters],
    queryFn: () =>
      type === "movie" ? discoverMovies(filters) : discoverTVShows(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useInfiniteDiscoverContent = (
  type: "movie" | "tv",
  filters: Record<string, unknown>
) => {
  return useInfiniteQuery<TMDBResponse>({
    queryKey: ["discoverInfinite", type, filters],
    queryFn: ({ pageParam = 1 }) => {
      const filtersWithPage = { ...filters, page: pageParam as number };
      return type === "movie"
        ? discoverMovies(filtersWithPage)
        : discoverTVShows(filtersWithPage);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });
};

export const useInfiniteTrending = (mediaType: "all" | "movie" | "tv" = "all") => {
  return useInfiniteQuery<TMDBResponse>({
    queryKey: ["trendingInfinite", mediaType],
    queryFn: async ({ pageParam = 1 }) => {
      // Trending API doesn't support pagination well, so we use discover for subsequent pages
      if (pageParam === 1) {
        return getTrending(mediaType);
      }
      // For pages > 1, use discover with popularity sort
      if (mediaType === "all") {
        const [movies, tv] = await Promise.all([
          discoverMovies({ page: pageParam as number }),
          discoverTVShows({ page: pageParam as number }),
        ]);
        return {
          page: pageParam as number,
          results: [...movies.results, ...tv.results].sort((a, b) => b.vote_average - a.vote_average),
          total_pages: Math.min(movies.total_pages, tv.total_pages),
          total_results: movies.total_results + tv.total_results,
        };
      }
      return mediaType === "movie"
        ? discoverMovies({ page: pageParam as number })
        : discoverTVShows({ page: pageParam as number });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < Math.min(lastPage.total_pages, 500)) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 10 * 60 * 1000,
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
