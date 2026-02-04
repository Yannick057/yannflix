// src/hooks/useFollowedSeries.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FollowedSeries {
  id: string;
  user_id: string;
  tmdb_id: number;
  series_name: string;
  last_notified_season: number | null;
  created_at: string;
}

export function useFollowedSeries() {
  const { user } = useAuth();

  return useQuery<FollowedSeries[]>({
    queryKey: ["followedSeries", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("followed_series")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useFollowSeries() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tmdbId,
      seriesName,
    }: {
      tmdbId: number;
      seriesName: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("followed_series")
        .insert({
          user_id: user.id,
          tmdb_id: tmdbId,
          series_name: seriesName,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followedSeries"] });
      toast.success("Notifications activées pour cette série");
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast.info("Vous suivez déjà cette série");
      } else {
        toast.error("Erreur lors de l'activation des notifications");
      }
    },
  });
}

export function useUnfollowSeries() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tmdbId: number) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("followed_series")
        .delete()
        .eq("user_id", user.id)
        .eq("tmdb_id", tmdbId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followedSeries"] });
      toast.success("Notifications désactivées pour cette série");
    },
    onError: () => {
      toast.error("Erreur lors de la désactivation des notifications");
    },
  });
}

export function useIsFollowingSeries(tmdbId: number) {
  const { data: followedSeries } = useFollowedSeries();
  return followedSeries?.some((s) => s.tmdb_id === tmdbId) || false;
}
