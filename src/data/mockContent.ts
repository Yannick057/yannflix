import { Content } from '@/types/content';

export const mockContent: Content[] = [
  {
    id: '1',
    title: 'Dune: Part Two',
    year: 2024,
    type: 'movie',
    poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&h=1080&fit=crop',
    overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    imdb_rating: 8.8,
    runtime: 166,
    country: 'USA',
    streaming_services: [
      { id: 'prime', name: 'Prime Video', type: 'rent', price: 5.99 },
      { id: 'apple', name: 'Apple TV+', type: 'buy', price: 19.99 },
    ],
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson'],
    director: 'Denis Villeneuve',
  },
  {
    id: '2',
    title: 'Shogun',
    year: 2024,
    type: 'series',
    poster_url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400&h=600&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=1920&h=1080&fit=crop',
    overview: 'When a mysterious European ship is found marooned in a nearby fishing village, Lord Yoshii Toranaga discovers secrets that could tip the scales of power.',
    genres: ['Drama', 'Adventure', 'War'],
    imdb_rating: 9.0,
    runtime: 10,
    country: 'Japan',
    streaming_services: [
      { id: 'disney', name: 'Disney+', type: 'subscription' },
      { id: 'hulu', name: 'Hulu', type: 'subscription' },
    ],
    cast: ['Hiroyuki Sanada', 'Cosmo Jarvis', 'Anna Sawai'],
    seasons: 1,
    leaving_date: '2024-04-15',
  },
  {
    id: '3',
    title: 'Oppenheimer',
    year: 2023,
    type: 'movie',
    poster_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=600&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop',
    overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    genres: ['Drama', 'Thriller'],
    imdb_rating: 8.5,
    runtime: 180,
    country: 'USA',
    streaming_services: [
      { id: 'prime', name: 'Prime Video', type: 'subscription' },
    ],
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon'],
    director: 'Christopher Nolan',
  },
  {
    id: '4',
    title: 'The Bear',
    year: 2022,
    type: 'series',
    poster_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=600&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&h=1080&fit=crop',
    overview: 'A young chef from the fine dining world returns to Chicago to run his family sandwich shop.',
    genres: ['Drama', 'Comedy'],
    imdb_rating: 8.6,
    runtime: 30,
    country: 'USA',
    streaming_services: [
      { id: 'disney', name: 'Disney+', type: 'subscription' },
      { id: 'hulu', name: 'Hulu', type: 'subscription' },
    ],
    cast: ['Jeremy Allen White', 'Ebon Moss-Bachrach', 'Ayo Edebiri'],
    seasons: 3,
  },
  {
    id: '5',
    title: 'Poor Things',
    year: 2023,
    type: 'movie',
    poster_url: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=400&h=600&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=1920&h=1080&fit=crop',
    overview: 'The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist Dr. Godwin Baxter.',
    genres: ['Comedy', 'Drama', 'Romance'],
    imdb_rating: 8.0,
    runtime: 141,
    country: 'UK',
    streaming_services: [
      { id: 'hulu', name: 'Hulu', type: 'subscription' },
      { id: 'prime', name: 'Prime Video', type: 'rent', price: 5.99 },
    ],
    cast: ['Emma Stone', 'Mark Ruffalo', 'Willem Dafoe'],
    director: 'Yorgos Lanthimos',
  },
  {
    id: '6',
    title: 'True Detective: Night Country',
    year: 2024,
    type: 'series',
    poster_url: 'https://images.unsplash.com/photo-1489549132488-d00b7eee80f1?w=400&h=600&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1489549132488-d00b7eee80f1?w=1920&h=1080&fit=crop',
    overview: 'When the long winter night falls in Ennis, Alaska, the eight men who operate the Tsalal Arctic Research Station vanish without a trace.',
    genres: ['Crime', 'Drama', 'Mystery'],
    imdb_rating: 7.8,
    runtime: 60,
    country: 'USA',
    streaming_services: [
      { id: 'hbo', name: 'Max', type: 'subscription' },
    ],
    cast: ['Jodie Foster', 'Kali Reis', 'Fiona Shaw'],
    seasons: 1,
  },
  {
    id: '7',
    title: 'Killers of the Flower Moon',
    year: 2023,
    type: 'movie',
    poster_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop',
    overview: 'Members of the Osage tribe in the United States are murdered under mysterious circumstances in the 1920s sparking a major FBI investigation.',
    genres: ['Crime', 'Drama', 'Thriller'],
    imdb_rating: 7.7,
    runtime: 206,
    country: 'USA',
    streaming_services: [
      { id: 'apple', name: 'Apple TV+', type: 'subscription' },
    ],
    cast: ['Leonardo DiCaprio', 'Robert De Niro', 'Lily Gladstone'],
    director: 'Martin Scorsese',
  },
  {
    id: '8',
    title: 'Fallout',
    year: 2024,
    type: 'series',
    poster_url: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=400&h=600&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=1920&h=1080&fit=crop',
    overview: 'In a future, post-apocalyptic Los Angeles brought about by nuclear decimation, citizens must live in underground bunkers to protect themselves.',
    genres: ['Sci-Fi', 'Action', 'Adventure'],
    imdb_rating: 8.4,
    runtime: 60,
    country: 'USA',
    streaming_services: [
      { id: 'prime', name: 'Prime Video', type: 'subscription' },
    ],
    cast: ['Ella Purnell', 'Aaron Moten', 'Walton Goggins'],
    seasons: 1,
  },
  {
    id: '9',
    title: 'Anatomy of a Fall',
    year: 2023,
    type: 'movie',
    poster_url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400&h=600&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1920&h=1080&fit=crop',
    overview: 'A woman is suspected of her husband\'s murder, and their blind son faces a moral dilemma as the sole witness.',
    genres: ['Drama', 'Thriller', 'Mystery'],
    imdb_rating: 7.8,
    runtime: 151,
    country: 'France',
    streaming_services: [
      { id: 'netflix', name: 'Netflix', type: 'subscription' },
    ],
    cast: ['Sandra Hüller', 'Swann Arlaud', 'Milo Machado-Graner'],
    director: 'Justine Triet',
  },
  {
    id: '10',
    title: '3 Body Problem',
    year: 2024,
    type: 'series',
    poster_url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=400&h=600&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&h=1080&fit=crop',
    overview: 'A fateful decision made in 1960s China reverberates across space and time to a group of scientists in the present day.',
    genres: ['Sci-Fi', 'Drama', 'Mystery'],
    imdb_rating: 7.9,
    runtime: 60,
    country: 'USA',
    streaming_services: [
      { id: 'netflix', name: 'Netflix', type: 'subscription' },
    ],
    cast: ['Jovan Adepo', 'John Bradley', 'Rosalind Chao'],
    seasons: 1,
    leaving_date: '2024-05-01',
  },
  {
    id: '11',
    title: 'The Zone of Interest',
    year: 2023,
    type: 'movie',
    poster_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=600&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&h=1080&fit=crop',
    overview: 'The commandant of Auschwitz, Rudolf Höss, and his wife Hedwig, strive to build a dream life for their family in a house and garden next to the camp.',
    genres: ['Drama', 'War'],
    imdb_rating: 7.4,
    runtime: 105,
    country: 'UK',
    streaming_services: [
      { id: 'prime', name: 'Prime Video', type: 'rent', price: 4.99 },
      { id: 'apple', name: 'Apple TV+', type: 'buy', price: 14.99 },
    ],
    cast: ['Christian Friedel', 'Sandra Hüller', 'Johann Karthaus'],
    director: 'Jonathan Glazer',
  },
  {
    id: '12',
    title: 'Ripley',
    year: 2024,
    type: 'series',
    poster_url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400&h=600&fit=crop',
    backdrop_url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1920&h=1080&fit=crop',
    overview: 'Tom Ripley, a grifter scraping by in 1960s New York, is hired by a wealthy man to try to convince his vagabond son to return home from Italy.',
    genres: ['Crime', 'Drama', 'Thriller'],
    imdb_rating: 8.2,
    runtime: 60,
    country: 'USA',
    streaming_services: [
      { id: 'netflix', name: 'Netflix', type: 'subscription' },
    ],
    cast: ['Andrew Scott', 'Dakota Fanning', 'Johnny Flynn'],
    seasons: 1,
  },
];

export const getContentById = (id: string): Content | undefined => {
  return mockContent.find(content => content.id === id);
};

export const searchContent = (query: string): Content[] => {
  const lowerQuery = query.toLowerCase();
  return mockContent.filter(
    content =>
      content.title.toLowerCase().includes(lowerQuery) ||
      content.genres.some(g => g.toLowerCase().includes(lowerQuery)) ||
      content.cast?.some(c => c.toLowerCase().includes(lowerQuery))
  );
};

export const filterContent = (
  content: Content[],
  filters: {
    genres?: string[];
    yearRange?: [number, number];
    minRating?: number;
    type?: 'all' | 'movie' | 'series';
    streamingServices?: string[];
  }
): Content[] => {
  return content.filter(item => {
    if (filters.type && filters.type !== 'all' && item.type !== filters.type) {
      return false;
    }
    if (filters.genres && filters.genres.length > 0) {
      if (!filters.genres.some(g => item.genres.includes(g))) {
        return false;
      }
    }
    if (filters.yearRange) {
      const itemYear = typeof item.year === 'string' ? parseInt(item.year, 10) : item.year;
      if (isNaN(itemYear) || itemYear < filters.yearRange[0] || itemYear > filters.yearRange[1]) {
        return false;
      }
    }
    if (filters.minRating && item.imdb_rating < filters.minRating) {
      return false;
    }
    if (filters.streamingServices && filters.streamingServices.length > 0) {
      if (!item.streaming_services.some(s => filters.streamingServices?.includes(s.id))) {
        return false;
      }
    }
    return true;
  });
};
