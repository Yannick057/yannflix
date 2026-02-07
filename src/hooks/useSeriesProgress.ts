import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SeriesProgress {
  tmdbId: number;
  watchedCount: number;
}

export function useSeriesProgress(tmdbIds: number[]) {
  const { user } = useAuth();

  return useQuery<Record<number, number>>({
    queryKey: ["seriesProgress", user?.id, tmdbIds.sort().join(",")],
    queryFn: async () => {
      if (!user || tmdbIds.length === 0) return {};
      const { data, error } = await supabase
        .from("watched_episodes")
        .select("tmdb_id, episode_number")
        .eq("user_id", user.id)
        .in("tmdb_id", tmdbIds);
      if (error) throw error;

      const counts: Record<number, number> = {};
      for (const row of data || []) {
        counts[row.tmdb_id] = (counts[row.tmdb_id] || 0) + 1;
      }
      return counts;
    },
    enabled: !!user && tmdbIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
