import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Navbar } from '@/components/Navbar';
import { Film, Tv, LinkIcon } from 'lucide-react';
import { RatingBadge } from '@/components/RatingBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

function useSharedList(token: string) {
  return useQuery({
    queryKey: ['sharedList', token],
    queryFn: async () => {
      const { data: list, error: listError } = await supabase
        .from('user_lists')
        .select('id, name, description')
        .eq('share_token', token)
        .eq('is_public', true)
        .single();

      if (listError || !list) throw new Error('Liste introuvable');

      const { data: items, error: itemsError } = await supabase
        .from('list_items')
        .select('*, content (*)')
        .eq('list_id', list.id)
        .order('position', { ascending: true });

      if (itemsError) throw itemsError;

      return { list, items };
    },
    enabled: !!token,
  });
}

const SharedList = () => {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, error } = useSharedList(token || '');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-40" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-muted p-6">
              <LinkIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Liste introuvable</h1>
            <p className="text-muted-foreground mb-6">Ce lien de partage n'est plus valide ou la liste a été supprimée.</p>
            <Button asChild>
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </div>
        ) : data ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">{data.list.name}</h1>
              {data.list.description && (
                <p className="text-muted-foreground mt-1">{data.list.description}</p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                {data.items?.length || 0} élément{(data.items?.length || 0) !== 1 ? 's' : ''}
              </p>
            </div>

            {!data.items || data.items.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">Cette liste est vide.</p>
            ) : (
              <div className="space-y-3">
                {data.items.map((item: any, index: number) => {
                  const content = item.content;
                  if (!content) return null;
                  const contentId = `${content.type === 'movie' ? 'movie' : 'tv'}-${content.tmdb_id || content.id}`;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-xl bg-card border border-border p-4 transition-all hover:border-primary/30 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Link to={`/content/${contentId}`} className="shrink-0">
                        <img
                          src={content.poster_url || '/placeholder.svg'}
                          alt={content.title}
                          className="h-24 w-16 rounded-lg object-cover"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {content.type === 'movie' ? (
                            <Film size={14} className="text-muted-foreground" />
                          ) : (
                            <Tv size={14} className="text-muted-foreground" />
                          )}
                          <Link
                            to={`/content/${contentId}`}
                            className="font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {content.title}
                          </Link>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span>{content.year}</span>
                          {content.imdb_rating && <RatingBadge rating={content.imdb_rating} size="sm" />}
                          <span>{content.genres?.slice(0, 2).join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
};

export default SharedList;
