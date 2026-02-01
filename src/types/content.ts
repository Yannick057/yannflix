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
  { id: "netflix", name: "Netflix", color: "bg-netflix" },
  { id: "prime", name: "Prime Video", color: "bg-prime" },
  { id: "disney", name: "Disney+", color: "bg-disney" },
  { id: "hulu", name: "Hulu", color: "bg-hulu" },
  { id: "apple", name: "Apple TV+", color: "bg-apple" },
  { id: "hbo", name: "Max", color: "bg-hbo" },
] as const;

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
