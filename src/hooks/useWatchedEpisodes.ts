import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface WatchedEpisode {
  user_id: string;
  tmdb_id: number;
  season_number: number;
  episode_number: number;
}

export function useWatchedEpisodes(tmdbId: number) {
  const { user } = useAuth();

  return useQuery<WatchedEpisode[]>({
    queryKey: ["watchedEpisodes", user?.id, tmdbId],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("watched_episodes")
        .select("user_id, tmdb_id, season_number, episode_number")
        .eq("user_id", user.id)
        .eq("tmdb_id", tmdbId);
      if (error) throw error;
      return (data as WatchedEpisode[]) || [];
    },
    enabled: !!user && !!tmdbId,
  });
}

export function useToggleEpisodeWatched(tmdbId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      seasonNumber,
      episodeNumber,
      watched,
    }: {
      seasonNumber: number;
      episodeNumber: number;
      watched: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");

      if (watched) {
        // Remove
        const { error } = await supabase
          .from("watched_episodes")
          .delete()
          .eq("user_id", user.id)
          .eq("tmdb_id", tmdbId)
          .eq("season_number", seasonNumber)
          .eq("episode_number", episodeNumber);
        if (error) throw error;
      } else {
        // Add
        const { error } = await supabase
          .from("watched_episodes")
          .insert({
            user_id: user.id,
            tmdb_id: tmdbId,
            season_number: seasonNumber,
            episode_number: episodeNumber,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchedEpisodes", user?.id, tmdbId] });
    },
  });
}

export function useToggleSeasonWatched(tmdbId: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      seasonNumber,
      episodeNumbers,
      allWatched,
    }: {
      seasonNumber: number;
      episodeNumbers: number[];
      allWatched: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");

      if (allWatched) {
        // Remove all episodes of the season
        const { error } = await supabase
          .from("watched_episodes")
          .delete()
          .eq("user_id", user.id)
          .eq("tmdb_id", tmdbId)
          .eq("season_number", seasonNumber);
        if (error) throw error;
      } else {
        // Add all episodes of the season (upsert to avoid conflicts)
        const rows = episodeNumbers.map((ep) => ({
          user_id: user.id,
          tmdb_id: tmdbId,
          season_number: seasonNumber,
          episode_number: ep,
        }));
        const { error } = await supabase
          .from("watched_episodes")
          .upsert(rows, { onConflict: "user_id,tmdb_id,season_number,episode_number" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchedEpisodes", user?.id, tmdbId] });
    },
  });
}

export function isEpisodeWatched(
  watchedEpisodes: WatchedEpisode[] | undefined,
  seasonNumber: number,
  episodeNumber: number
): boolean {
  if (!watchedEpisodes) return false;
  return watchedEpisodes.some(
    (w) => w.season_number === seasonNumber && w.episode_number === episodeNumber
  );
}

export function isSeasonFullyWatched(
  watchedEpisodes: WatchedEpisode[] | undefined,
  seasonNumber: number,
  totalEpisodes: number
): boolean {
  if (!watchedEpisodes || totalEpisodes === 0) return false;
  const watchedCount = watchedEpisodes.filter((w) => w.season_number === seasonNumber).length;
  return watchedCount >= totalEpisodes;
}

export function seasonWatchedCount(
  watchedEpisodes: WatchedEpisode[] | undefined,
  seasonNumber: number
): number {
  if (!watchedEpisodes) return 0;
  return watchedEpisodes.filter((w) => w.season_number === seasonNumber).length;
}
