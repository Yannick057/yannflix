
-- Create a function to get top rated content (aggregated, no individual user data exposed)
CREATE OR REPLACE FUNCTION public.get_top_rated_content(min_ratings INTEGER DEFAULT 2, limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  tmdb_id INTEGER,
  content_type TEXT,
  avg_rating NUMERIC,
  total_ratings BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ur.tmdb_id,
    ur.content_type,
    ROUND(AVG(ur.rating)::numeric, 1) as avg_rating,
    COUNT(*) as total_ratings
  FROM public.user_ratings ur
  GROUP BY ur.tmdb_id, ur.content_type
  HAVING COUNT(*) >= min_ratings
  ORDER BY avg_rating DESC, total_ratings DESC
  LIMIT limit_count;
$$;
