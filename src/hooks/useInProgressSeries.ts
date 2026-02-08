import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Returns a Set of TMDB IDs for series the user has started watching (at least 1 episode).
 */
export function useInProgressSeries() {
  const { user } = useAuth();

  return useQuery<Set<number>>({
    queryKey: ["inProgressSeries", user?.id],
    queryFn: async () => {
      if (!user) return new Set();
      const { data, error } = await supabase
        .from("watched_episodes")
        .select("tmdb_id")
        .eq("user_id", user.id);
      if (error) throw error;

      const ids = new Set<number>();
      for (const row of data || []) {
        ids.add(row.tmdb_id);
      }
      return ids;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}
