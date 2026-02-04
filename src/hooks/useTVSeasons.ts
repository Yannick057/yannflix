// src/hooks/useTVSeasons.ts

import { useQuery } from "@tanstack/react-query";
import {
  getTVDetails,
  getSeasonDetails,
  getAllSeasons,
  TMDBTVDetail,
  TMDBSeasonDetail,
} from "@/lib/tmdb-tv";

export const useTVDetails = (tvId: number) => {
  return useQuery<TMDBTVDetail>({
    queryKey: ["tvDetails", tvId],
    queryFn: () => getTVDetails(tvId),
    enabled: !!tvId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useSeasonDetails = (tvId: number, seasonNumber: number) => {
  return useQuery<TMDBSeasonDetail>({
    queryKey: ["seasonDetails", tvId, seasonNumber],
    queryFn: () => getSeasonDetails(tvId, seasonNumber),
    enabled: !!tvId && seasonNumber > 0,
    staleTime: 10 * 60 * 1000,
  });
};

export const useAllSeasons = (tvId: number, enabled = true) => {
  return useQuery<TMDBSeasonDetail[]>({
    queryKey: ["allSeasons", tvId],
    queryFn: () => getAllSeasons(tvId),
    enabled: !!tvId && enabled,
    staleTime: 10 * 60 * 1000,
  });
};
