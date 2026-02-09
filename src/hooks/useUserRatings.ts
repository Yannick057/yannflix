import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UserRating {
  id: string;
  user_id: string;
  tmdb_id: number;
  content_type: "movie" | "tv";
  rating: number;
  created_at: string;
}

export function useUserRating(tmdbId: number, contentType: "movie" | "tv") {
  const { user } = useAuth();

  const query = useQuery<UserRating | null>({
    queryKey: ["userRating", user?.id, tmdbId, contentType],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("user_ratings")
        .select("*")
        .eq("user_id", user.id)
        .eq("tmdb_id", tmdbId)
        .eq("content_type", contentType)
        .maybeSingle();

      if (error) throw error;
      return data as UserRating | null;
    },
    enabled: !!user && tmdbId > 0,
  });

  return query;
}

export function useSetRating() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tmdbId,
      contentType,
      rating,
    }: {
      tmdbId: number;
      contentType: "movie" | "tv";
      rating: number;
    }) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_ratings")
        .upsert(
          {
            user_id: user.id,
            tmdb_id: tmdbId,
            content_type: contentType,
            rating,
          },
          { onConflict: "user_id,tmdb_id,content_type" }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["userRating", user?.id, variables.tmdbId, variables.contentType],
      });
      queryClient.invalidateQueries({ queryKey: ["userRatings"] });
      toast.success("Note enregistrée !");
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement de la note");
    },
  });
}

export function useAllUserRatings() {
  const { user } = useAuth();

  return useQuery<UserRating[]>({
    queryKey: ["userRatings", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_ratings")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return (data as UserRating[]) || [];
    },
    enabled: !!user,
  });
}
