import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TopRatedItem {
  tmdb_id: number;
  content_type: string;
  avg_rating: number;
  total_ratings: number;
}

export function useTopRated(minRatings = 1, limit = 50) {
  return useQuery({
    queryKey: ['topRated', minRatings, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_top_rated_content', {
        min_ratings: minRatings,
        limit_count: limit,
      });

      if (error) throw error;
      return (data || []) as TopRatedItem[];
    },
  });
}
