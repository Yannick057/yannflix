// src/lib/tmdb-tv.ts - TMDB TV series specific API calls

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string | null;
  episode_number: number;
  season_number: number;
  air_date: string | null;
  runtime: number | null;
  vote_average: number;
}

export interface TMDBSeason {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  air_date: string | null;
  episode_count: number;
  episodes?: TMDBEpisode[];
}

export interface TMDBSeasonDetail extends TMDBSeason {
  episodes: TMDBEpisode[];
}

export interface TMDBTVDetail {
  id: number;
  name: string;
  number_of_seasons: number;
  seasons: TMDBSeason[];
  next_episode_to_air?: TMDBEpisode | null;
  last_episode_to_air?: TMDBEpisode | null;
  status: string;
  in_production: boolean;
}

const buildUrl = (path: string, params: Record<string, string | number | undefined> = {}) => {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("api_key", TMDB_API_KEY || "");
  url.searchParams.set("language", "fr-FR");

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};

// Get TV show details with seasons info
export const getTVDetails = async (tvId: number): Promise<TMDBTVDetail> => {
  const url = buildUrl(`/tv/${tvId}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Erreur lors de la récupération des détails TV");
  }
  return res.json();
};

// Get season details with all episodes
export const getSeasonDetails = async (
  tvId: number,
  seasonNumber: number
): Promise<TMDBSeasonDetail> => {
  const url = buildUrl(`/tv/${tvId}/season/${seasonNumber}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Erreur lors de la récupération de la saison ${seasonNumber}`);
  }
  return res.json();
};

// Get all seasons with episodes for a TV show
export const getAllSeasons = async (tvId: number): Promise<TMDBSeasonDetail[]> => {
  const tvDetails = await getTVDetails(tvId);
  
  // Filter out season 0 (specials) and fetch all regular seasons
  const regularSeasons = tvDetails.seasons.filter(s => s.season_number > 0);
  
  const seasonsWithEpisodes = await Promise.all(
    regularSeasons.map(season => getSeasonDetails(tvId, season.season_number))
  );
  
  return seasonsWithEpisodes;
};

// Get upcoming episodes for followed shows
export const getUpcomingEpisodes = async (tvIds: number[]): Promise<{
  tvId: number;
  showName: string;
  nextEpisode: TMDBEpisode | null;
}[]> => {
  const results = await Promise.all(
    tvIds.map(async (tvId) => {
      try {
        const details = await getTVDetails(tvId);
        return {
          tvId,
          showName: details.name,
          nextEpisode: details.next_episode_to_air || null,
        };
      } catch {
        return { tvId, showName: '', nextEpisode: null };
      }
    })
  );
  
  return results.filter(r => r.nextEpisode !== null);
};
