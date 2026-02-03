export interface StreamingService {
  id: string;
  name: string;
  logo?: string;
  link?: string;
  type: "subscription" | "rent" | "buy";
  price?: number;
}

export interface Content {
  id: string;
  tmdbId?: number; // ← ajouté pour faire le lien avec TMDB
  title: string;
  original_title?: string;
  year: number | string;
  type: "movie" | "series";
  poster_url?: string;   // ancien naming
  backdrop_url?: string; // ancien naming
  posterUrl?: string;    // nouveau naming utilisé dans les composants
  backdropUrl?: string;  // nouveau naming utilisé dans les composants
  overview: string;
  genres: string[];
  imdb_rating?: number;
  rating?: number;
  runtime?: number; // minutes pour films, épisodes pour séries
  country: string;
  streaming_services?: StreamingService[];
  streamingServices?: StreamingService[];
  trailer_url?: string;
  trailer?: string;
  cast?: string[];
  director?: string;
  seasons?: number;
  leaving_date?: string; // Quand le contenu quitte une plateforme
  leavingSoon?: boolean;
  newSeason?: boolean; // Nouvelle saison disponible
  newSeasonNumber?: number;
  newSeasonDate?: string;
  newEpisode?: boolean; // Nouvel épisode disponible
  newEpisodeDate?: string;
}

export interface UserList {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  content_id: string;
  content: Content;
  position: number;
  added_at: string;
  watched: boolean;
  watched_at?: string;
  not_interested: boolean;
}

export interface FilterOptions {
  genres: string[];
  yearRange: [number, number];
  minRating: number;
  runtimeRange: [number, number];
  countries: string[];
  streamingServices: string[];
  type: "all" | "movie" | "series";
}

export const STREAMING_PLATFORMS = [
  { id: "netflix", providerId: 8, name: "Netflix", color: "bg-red-600" },
  { id: "prime", providerId: 119, name: "Prime Video", color: "bg-blue-500" },
  { id: "disney", providerId: 337, name: "Disney+", color: "bg-blue-700" },
  { id: "canal", providerId: 381, name: "Canal+", color: "bg-black" },
  { id: "apple", providerId: 350, name: "Apple TV+", color: "bg-gray-800" },
  { id: "ocs", providerId: 56, name: "OCS", color: "bg-orange-500" },
  { id: "paramount", providerId: 531, name: "Paramount+", color: "bg-blue-600" },
  { id: "crunchyroll", providerId: 283, name: "Crunchyroll", color: "bg-orange-600" },
  { id: "adn", providerId: 415, name: "ADN", color: "bg-blue-400" },
  { id: "max", providerId: 1899, name: "Max", color: "bg-purple-600" },
] as const;

// Mapping from TMDB provider IDs to our platform IDs
export const PROVIDER_ID_MAP: Record<number, string> = {
  8: "netflix",
  119: "prime",
  337: "disney",
  381: "canal",
  350: "apple",
  56: "ocs",
  531: "paramount",
  283: "crunchyroll",
  415: "adn",
  1899: "max",
};

export const GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "War",
] as const;

export const COUNTRIES = [
  "France",
  "USA",
  "UK",
  "Germany",
  "Japan",
  "South Korea",
  "Spain",
  "Italy",
  "Canada",
  "Australia",
] as const;
