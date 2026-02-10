
-- Add share_token column to user_lists for public sharing
ALTER TABLE public.user_lists ADD COLUMN share_token TEXT UNIQUE DEFAULT NULL;
ALTER TABLE public.user_lists ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;

-- Allow anyone to read public lists via share_token
CREATE POLICY "Anyone can view public lists"
ON public.user_lists
FOR SELECT
USING (is_public = true AND share_token IS NOT NULL);

-- Allow anyone to view items from public lists
CREATE POLICY "Anyone can view items in public lists"
ON public.list_items
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_lists
  WHERE user_lists.id = list_items.list_id
  AND user_lists.is_public = true
  AND user_lists.share_token IS NOT NULL
));
