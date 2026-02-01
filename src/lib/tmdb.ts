// src/lib/tmdb.ts

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

if (!TMDB_API_KEY) {
  console.warn(
    "[TMDB] VITE_TMDB_API_KEY manquant dans .env – l'API TMDB ne fonctionnera pas."
  );
}

export interface TMDBContent {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  media_type?: "movie" | "tv";
}

export interface TMDBResponse {
  page: number;
  results: TMDBContent[];
  total_pages: number;
  total_results: number;
}

export interface TMDBDetailResponse extends TMDBContent {
  runtime?: number;
  number_of_seasons?: number;
  genres: { id: number; name: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  credits: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string }[];
  };
  videos: {
    results: { key: string; site: string; type: string; name: string }[];
  };
  "watch/providers": {
    results: {
      FR?: {
        link?: string;
        flatrate?: { provider_id: number; provider_name: string; logo_path: string | null }[];
        rent?: { provider_id: number; provider_name: string; logo_path: string | null }[];
        buy?: { provider_id: number; provider_name: string; logo_path: string | null }[];
      };
    };
  };
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

// Recherche multi (films + séries)
export const searchContent = async (
  query: string,
  page = 1
): Promise<TMDBResponse> => {
  const url = buildUrl("/search/multi", {
    query,
    page,
    include_adult: "false",
  });

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Erreur lors de la recherche TMDB");
  }
  return res.json();
};

// Découverte films
export const discoverMovies = async (filters: {
  page?: number;
  with_genres?: string;
  "vote_average.gte"?: number;
  "primary_release_date.gte"?: string;
  "primary_release_date.lte"?: string;
}): Promise<TMDBResponse> => {
  const url = buildUrl("/discover/movie", {
    sort_by: "popularity.desc",
    include_adult: "false",
    include_video: "false",
    ...filters,
  });

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Erreur lors de la découverte de films");
  }
  return res.json();
};

// Découverte séries
export const discoverTVShows = async (filters: {
  page?: number;
  with_genres?: string;
  "vote_average.gte"?: number;
  "first_air_date.gte"?: string;
  "first_air_date.lte"?: string;
}): Promise<TMDBResponse> => {
  const url = buildUrl("/discover/tv", {
    sort_by: "popularity.desc",
    include_adult: "false",
    include_null_first_air_dates: "false",
    ...filters,
  });

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Erreur lors de la découverte de séries");
  }
  return res.json();
};

// Détails d'un contenu
export const getContentDetails = async (
  id: number,
  type: "movie" | "tv"
): Promise<TMDBDetailResponse> => {
  const url = buildUrl(`/${type}/${id}`, {
    append_to_response: "credits,videos,watch/providers",
  });

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Erreur lors de la récupération des détails TMDB");
  }
  return res.json();
};

// Tendances
export const getTrending = async (
  mediaType: "all" | "movie" | "tv" = "all",
  timeWindow: "day" | "week" = "week"
): Promise<TMDBResponse> => {
  const url = buildUrl(`/trending/${mediaType}/${timeWindow}`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Erreur lors de la récupération des tendances TMDB");
  }
  return res.json();
};

// URL d'image
export const getImageUrl = (
  path: string | null,
  size: "w200" | "w300" | "w500" | "w780" | "original" = "w500"
): string => {
  if (!path) return "/placeholder.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

// Mapping ID genre -> nom FR
export const GENRES: Record<number, string> = {
  28: "Action",
  12: "Aventure",
  16: "Animation",
  35: "Comédie",
  80: "Crime",
  99: "Documentaire",
  18: "Drame",
  10751: "Famille",
  14: "Fantastique",
  36: "Histoire",
  27: "Horreur",
  10402: "Musique",
  9648: "Mystère",
  10749: "Romance",
  878: "Science-Fiction",
  10770: "Téléfilm",
  53: "Thriller",
  10752: "Guerre",
  37: "Western",
  10759: "Action & Aventure",
  10762: "Enfants",
  10763: "Actualités",
  10764: "Téléréalité",
  10765: "Sci-Fi & Fantasy",
  10766: "Feuilleton",
  10767: "Talk-show",
  10768: "Guerre & Politique",
};

// Mapping nom genre -> ID (utile pour les filtres côté UI)
export const GENRE_IDS: Record<string, number> = Object.fromEntries(
  Object.entries(GENRES).map(([id, name]) => [name, Number(id)])
);
