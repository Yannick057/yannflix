import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useContentProgress(tmdbId: number | undefined, type: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["contentProgress", user?.id, tmdbId],
    queryFn: async () => {
      if (!user || !tmdbId) return null;
      const { count, error } = await supabase
        .from("watched_episodes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("tmdb_id", tmdbId);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user && !!tmdbId && type === "series",
    staleTime: 5 * 60 * 1000,
  });
}
