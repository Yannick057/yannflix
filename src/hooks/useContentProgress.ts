import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const TMDB_API_KEY = "7a3274f34ebaa7ba918d500f64524558";

interface ContentProgressData {
  watchedCount: number;
  totalEpisodes: number;
  percentage: number;
}

export function useContentProgress(tmdbId: number | undefined, type: string) {
  const { user } = useAuth();

  return useQuery<ContentProgressData | null>({
    queryKey: ["contentProgress", user?.id, tmdbId],
    queryFn: async () => {
      if (!user || !tmdbId) return null;

      // Fetch watched count and total episodes in parallel
      const [watchedResult, tmdbResult] = await Promise.all([
        supabase
          .from("watched_episodes")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("tmdb_id", tmdbId),
        fetch(
          `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}&language=fr-FR`
        ).then((r) => (r.ok ? r.json() : null)),
      ]);

      if (watchedResult.error) throw watchedResult.error;

      const watchedCount = watchedResult.count || 0;
      const totalEpisodes = tmdbResult?.number_of_episodes || 0;
      const percentage = totalEpisodes > 0 ? Math.round((watchedCount / totalEpisodes) * 100) : 0;

      return { watchedCount, totalEpisodes, percentage };
    },
    enabled: !!user && !!tmdbId && type === "series",
    staleTime: 10 * 60 * 1000,
  });
}
