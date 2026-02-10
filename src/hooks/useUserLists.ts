import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserList {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  is_public: boolean;
  share_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  content_id: string;
  position: number;
  added_at: string;
  watched: boolean;
  watched_at: string | null;
  not_interested: boolean;
}

export interface ListItemWithContent extends ListItem {
  content: {
    id: string;
    title: string;
    type: string;
    year: number;
    poster_url: string | null;
    backdrop_url: string | null;
    imdb_rating: number | null;
    genres: string[] | null;
    overview: string | null;
    runtime: number | null;
    seasons: number | null;
    country: string | null;
    director: string | null;
    cast_members: string[] | null;
    trailer_url: string | null;
    tmdb_id: string | null;
  } | null;
}

export function useUserLists() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userLists', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_lists')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as UserList[];
    },
    enabled: !!user,
  });
}

export function useListItems(listId: string) {
  return useQuery({
    queryKey: ['listItems', listId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('list_items')
        .select(`
          *,
          content (*)
        `)
        .eq('list_id', listId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data as ListItemWithContent[];
    },
    enabled: !!listId,
  });
}

export function useCreateList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('user_lists')
        .insert({
          user_id: user!.id,
          name,
          description: description || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLists'] });
    },
  });
}

export function useUpdateList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listId, name, description }: { listId: string; name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('user_lists')
        .update({
          name,
          description: description || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', listId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLists'] });
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (listId: string) => {
      // First delete all items in the list
      await supabase
        .from('list_items')
        .delete()
        .eq('list_id', listId);

      const { error } = await supabase
        .from('user_lists')
        .delete()
        .eq('id', listId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLists'] });
      queryClient.invalidateQueries({ queryKey: ['listItems'] });
    },
  });
}

export function useAddToList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listId, contentId }: { listId: string; contentId: string }) => {
      // Check if already exists
      const { data: existing } = await supabase
        .from('list_items')
        .select('id')
        .eq('list_id', listId)
        .eq('content_id', contentId)
        .single();

      if (existing) {
        throw new Error('Ce contenu est déjà dans cette liste');
      }

      // Get current max position
      const { data: items } = await supabase
        .from('list_items')
        .select('position')
        .eq('list_id', listId)
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = items && items.length > 0 ? items[0].position + 1 : 0;

      const { data, error } = await supabase
        .from('list_items')
        .insert({
          list_id: listId,
          content_id: contentId,
          position: nextPosition,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['listItems', variables.listId] });
    },
  });
}

export function useRemoveFromList() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listId, itemId }: { listId: string; itemId: string }) => {
      const { error } = await supabase
        .from('list_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['listItems', variables.listId] });
    },
  });
}

export function useUpdateListItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      itemId, 
      updates 
    }: { 
      itemId: string; 
      updates: Partial<Pick<ListItem, 'watched' | 'not_interested' | 'position'>> 
    }) => {
      const updateData: Record<string, unknown> = { ...updates };
      if (updates.watched) {
        updateData.watched_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('list_items')
        .update(updateData)
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listItems'] });
    },
  });
}

export function useCreateDefaultLists() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const defaultLists = [
        { name: 'À regarder', description: 'Ma liste de films et séries à voir', is_default: true },
        { name: 'Déjà vu', description: 'Ce que j\'ai déjà regardé', is_default: true },
      ];

      const { data, error } = await supabase
        .from('user_lists')
        .insert(
          defaultLists.map((list) => ({
            ...list,
            user_id: user!.id,
          }))
        )
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLists'] });
    },
  });
}

export function useToggleListPublic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ listId, isPublic }: { listId: string; isPublic: boolean }) => {
      const updates: Record<string, unknown> = { is_public: isPublic };

      if (isPublic) {
        // Generate a short random token
        updates.share_token = crypto.randomUUID().slice(0, 12);
      }

      const { data, error } = await supabase
        .from('user_lists')
        .update(updates)
        .eq('id', listId)
        .select()
        .single();

      if (error) throw error;
      return data as UserList;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLists'] });
    },
  });
}
