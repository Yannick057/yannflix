-- Create content table to store movies and series
CREATE TABLE public.content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tmdb_id TEXT,
  title TEXT NOT NULL,
  original_title TEXT,
  type TEXT NOT NULL CHECK (type IN ('movie', 'series')),
  year INTEGER NOT NULL,
  poster_url TEXT,
  backdrop_url TEXT,
  overview TEXT,
  genres TEXT[] DEFAULT '{}',
  imdb_rating NUMERIC(3,1),
  runtime INTEGER,
  country TEXT,
  director TEXT,
  cast_members TEXT[] DEFAULT '{}',
  seasons INTEGER,
  trailer_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create streaming availability table
CREATE TABLE public.streaming_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  availability_type TEXT NOT NULL CHECK (availability_type IN ('subscription', 'rent', 'buy')),
  price NUMERIC(5,2),
  link TEXT,
  leaving_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user lists table
CREATE TABLE public.user_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create list items table
CREATE TABLE public.list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.user_lists(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES public.content(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  watched BOOLEAN NOT NULL DEFAULT false,
  watched_at TIMESTAMP WITH TIME ZONE,
  not_interested BOOLEAN NOT NULL DEFAULT false,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(list_id, content_id)
);

-- Create indexes for better performance
CREATE INDEX idx_content_type ON public.content(type);
CREATE INDEX idx_content_year ON public.content(year);
CREATE INDEX idx_content_imdb_rating ON public.content(imdb_rating);
CREATE INDEX idx_streaming_availability_content ON public.streaming_availability(content_id);
CREATE INDEX idx_streaming_availability_platform ON public.streaming_availability(platform);
CREATE INDEX idx_user_lists_user ON public.user_lists(user_id);
CREATE INDEX idx_list_items_list ON public.list_items(list_id);
CREATE INDEX idx_list_items_content ON public.list_items(content_id);

-- Enable RLS
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaming_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

-- Content is public read
CREATE POLICY "Content is publicly readable"
ON public.content FOR SELECT
USING (true);

-- Streaming availability is public read
CREATE POLICY "Streaming availability is publicly readable"
ON public.streaming_availability FOR SELECT
USING (true);

-- User lists policies
CREATE POLICY "Users can view their own lists"
ON public.user_lists FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lists"
ON public.user_lists FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists"
ON public.user_lists FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists"
ON public.user_lists FOR DELETE
USING (auth.uid() = user_id);

-- List items policies
CREATE POLICY "Users can view items in their lists"
ON public.list_items FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.user_lists
  WHERE user_lists.id = list_items.list_id
  AND user_lists.user_id = auth.uid()
));

CREATE POLICY "Users can add items to their lists"
ON public.list_items FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_lists
  WHERE user_lists.id = list_items.list_id
  AND user_lists.user_id = auth.uid()
));

CREATE POLICY "Users can update items in their lists"
ON public.list_items FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.user_lists
  WHERE user_lists.id = list_items.list_id
  AND user_lists.user_id = auth.uid()
));

CREATE POLICY "Users can remove items from their lists"
ON public.list_items FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.user_lists
  WHERE user_lists.id = list_items.list_id
  AND user_lists.user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_content_updated_at
BEFORE UPDATE ON public.content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_lists_updated_at
BEFORE UPDATE ON public.user_lists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();