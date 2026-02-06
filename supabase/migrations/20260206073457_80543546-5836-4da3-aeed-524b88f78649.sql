
-- Table pour tracker les épisodes/saisons vues par utilisateur
CREATE TABLE public.watched_episodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tmdb_id INTEGER NOT NULL,
  season_number INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  watched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index unique pour éviter les doublons
CREATE UNIQUE INDEX idx_watched_episodes_unique 
ON public.watched_episodes (user_id, tmdb_id, season_number, episode_number);

-- Index pour les requêtes par utilisateur et série
CREATE INDEX idx_watched_episodes_user_tmdb 
ON public.watched_episodes (user_id, tmdb_id);

-- Enable RLS
ALTER TABLE public.watched_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own watched episodes"
ON public.watched_episodes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can mark episodes as watched"
ON public.watched_episodes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unmark episodes"
ON public.watched_episodes FOR DELETE
USING (auth.uid() = user_id);
