import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { GENRES } from "@/lib/tmdb";

interface WatchedEpisodeRow {
  tmdb_id: number;
  season_number: number;
  episode_number: number;
  watched_at: string;
}

interface SeriesInfo {
  tmdbId: number;
  name: string;
  posterPath: string | null;
  totalEpisodes: number;
  genres: string[];
  episodeRuntime: number;
}

export interface ViewingStats {
  totalEpisodesWatched: number;
  totalMinutesWatched: number;
  seriesStarted: number;
  seriesCompleted: number;
  favoriteGenres: { genre: string; count: number }[];
  completedSeries: { name: string; posterUrl: string }[];
  watchedByMonth: { month: string; count: number }[];
}

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

async function fetchSeriesInfo(tmdbId: number): Promise<SeriesInfo | null> {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}&language=fr-FR`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      tmdbId,
      name: data.name || "Inconnu",
      posterPath: data.poster_path,
      totalEpisodes: data.number_of_episodes || 0,
      genres: (data.genres || []).map((g: { name: string }) => g.name),
      episodeRuntime: data.episode_run_time?.[0] || data.last_episode_to_air?.runtime || 45,
    };
  } catch {
    return null;
  }
}

export function useViewingStats() {
  const { user } = useAuth();

  return useQuery<ViewingStats>({
    queryKey: ["viewingStats", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      // Fetch all watched episodes
      const { data: episodes, error } = await supabase
        .from("watched_episodes")
        .select("tmdb_id, season_number, episode_number, watched_at")
        .eq("user_id", user.id);

      if (error) throw error;
      const rows = (episodes || []) as WatchedEpisodeRow[];

      if (rows.length === 0) {
        return {
          totalEpisodesWatched: 0,
          totalMinutesWatched: 0,
          seriesStarted: 0,
          seriesCompleted: 0,
          favoriteGenres: [],
          completedSeries: [],
          watchedByMonth: [],
        };
      }

      // Group by tmdb_id
      const bySeriesMap = new Map<number, WatchedEpisodeRow[]>();
      for (const ep of rows) {
        const list = bySeriesMap.get(ep.tmdb_id) || [];
        list.push(ep);
        bySeriesMap.set(ep.tmdb_id, list);
      }

      const uniqueIds = Array.from(bySeriesMap.keys());

      // Fetch series info (limited to 20 to avoid rate limits)
      const seriesInfos = await Promise.all(
        uniqueIds.slice(0, 20).map(fetchSeriesInfo)
      );
      const infoMap = new Map<number, SeriesInfo>();
      for (const info of seriesInfos) {
        if (info) infoMap.set(info.tmdbId, info);
      }

      // Compute stats
      let totalMinutes = 0;
      const genreCount = new Map<string, number>();
      const completed: { name: string; posterUrl: string }[] = [];

      for (const [tmdbId, eps] of bySeriesMap) {
        const info = infoMap.get(tmdbId);
        if (info) {
          totalMinutes += eps.length * info.episodeRuntime;
          for (const g of info.genres) {
            genreCount.set(g, (genreCount.get(g) || 0) + eps.length);
          }
          if (info.totalEpisodes > 0 && eps.length >= info.totalEpisodes) {
            completed.push({
              name: info.name,
              posterUrl: info.posterPath
                ? `https://image.tmdb.org/t/p/w200${info.posterPath}`
                : "/placeholder.svg",
            });
          }
        } else {
          totalMinutes += eps.length * 45; // fallback
        }
      }

      // Favorite genres sorted
      const favoriteGenres = Array.from(genreCount.entries())
        .map(([genre, count]) => ({ genre, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Watched by month (last 6 months)
      const monthCounts = new Map<string, number>();
      for (const ep of rows) {
        const date = new Date(ep.watched_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthCounts.set(key, (monthCounts.get(key) || 0) + 1);
      }
      const watchedByMonth = Array.from(monthCounts.entries())
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => a.month.localeCompare(b.month))
        .slice(-6);

      return {
        totalEpisodesWatched: rows.length,
        totalMinutesWatched: totalMinutes,
        seriesStarted: uniqueIds.length,
        seriesCompleted: completed.length,
        favoriteGenres,
        completedSeries: completed,
        watchedByMonth,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });
}
