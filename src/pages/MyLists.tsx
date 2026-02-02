import { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, Trash2, Edit2, GripVertical, Film, Tv, Clock, Check, X, List, LogIn } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { StreamingBadge } from '@/components/StreamingBadge';
import { RatingBadge } from '@/components/RatingBadge';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useUserLists, 
  useListItems, 
  useCreateList, 
  useUpdateList,
  useDeleteList, 
  useRemoveFromList,
  useCreateDefaultLists,
  ListItemWithContent 
} from '@/hooks/useUserLists';
import { Skeleton } from '@/components/ui/skeleton';

const MyLists = () => {
  const { user } = useAuth();
  const { data: lists, isLoading: listsLoading } = useUserLists();
  const createList = useCreateList();
  const updateList = useUpdateList();
  const deleteList = useDeleteList();
  const removeFromList = useRemoveFromList();
  const createDefaultLists = useCreateDefaultLists();
  
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [newListName, setNewListName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Fetch items for the active list
  const { data: listItems, isLoading: itemsLoading } = useListItems(activeListId || '');

  // Set the first list as active when lists load
  useEffect(() => {
    if (lists && lists.length > 0 && !activeListId) {
      setActiveListId(lists[0].id);
    }
  }, [lists, activeListId]);

  // Create default lists if user has none
  useEffect(() => {
    if (user && lists && lists.length === 0 && !listsLoading) {
      createDefaultLists.mutate();
    }
  }, [user, lists, listsLoading]);

  const activeList = lists?.find((l) => l.id === activeListId) || lists?.[0];

  const handleCreateList = () => {
    if (newListName.trim()) {
      createList.mutate(
        { name: newListName.trim() },
        {
          onSuccess: (data) => {
            setNewListName('');
            setIsCreateDialogOpen(false);
            setActiveListId(data.id);
          },
        }
      );
    }
  };

  const handleDeleteList = (id: string) => {
    deleteList.mutate(id, {
      onSuccess: () => {
        if (activeListId === id && lists && lists.length > 1) {
          const remainingLists = lists.filter((l) => l.id !== id);
          setActiveListId(remainingLists[0]?.id || null);
        }
      },
    });
  };

  const startEditing = (list: { id: string; name: string }) => {
    setEditingListId(list.id);
    setEditingName(list.name);
  };

  const saveEdit = () => {
    if (editingName.trim() && editingListId) {
      updateList.mutate(
        { listId: editingListId, name: editingName.trim() },
        {
          onSuccess: () => {
            setEditingListId(null);
          },
        }
      );
    }
  };

  const handleRemoveFromList = (itemId: string) => {
    if (activeListId) {
      removeFromList.mutate({ listId: activeListId, itemId });
    }
  };

  // Not logged in state
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6 rounded-full bg-muted p-8">
              <LogIn className="h-16 w-16 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Connectez-vous pour accéder à vos listes</h1>
            <p className="text-muted-foreground mb-6 max-w-md">
              Créez un compte ou connectez-vous pour sauvegarder vos films et séries préférés et y accéder sur tous vos appareils.
            </p>
            <Button asChild size="lg">
              <Link to="/auth">Se connecter</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mes Listes</h1>
            <p className="text-muted-foreground">Organisez vos films et séries préférés</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus size={18} className="mr-2" />
                Nouvelle liste
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle liste</DialogTitle>
                <DialogDescription>
                  Donnez un nom à votre nouvelle liste de contenus.
                </DialogDescription>
              </DialogHeader>
              <Input
                placeholder="Nom de la liste..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                className="bg-secondary border-border"
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateList} disabled={!newListName.trim() || createList.isPending}>
                  {createList.isPending ? 'Création...' : 'Créer'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Lists sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="space-y-2">
              {listsLoading ? (
                <>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </>
              ) : lists && lists.length > 0 ? (
                lists.map((list) => (
                  <div
                    key={list.id}
                    className={cn(
                      "group flex items-center gap-2 rounded-lg p-3 transition-colors cursor-pointer",
                      activeListId === list.id
                        ? "bg-primary/10 border border-primary/30"
                        : "bg-secondary/30 hover:bg-secondary/50"
                    )}
                    onClick={() => setActiveListId(list.id)}
                  >
                    <List size={18} className={cn(
                      activeListId === list.id ? "text-primary" : "text-muted-foreground"
                    )} />
                    
                    {editingListId === list.id ? (
                      <div className="flex flex-1 items-center gap-2">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                          className="h-7 bg-background"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); saveEdit(); }}>
                          <Check size={14} />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setEditingListId(null); }}>
                          <X size={14} />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className={cn(
                          "flex-1 font-medium truncate",
                          activeListId === list.id ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {list.name}
                        </span>
                        {!list.is_default && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100"
                              >
                                <MoreHorizontal size={14} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem onClick={() => startEditing(list)}>
                                <Edit2 size={14} className="mr-2" />
                                Renommer
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteList(list.id)}
                              >
                                <Trash2 size={14} className="mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">Aucune liste</p>
              )}
            </div>
          </aside>

          {/* List content */}
          <div className="flex-1 min-w-0">
            {activeList && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">{activeList.name}</h2>
                <p className="text-muted-foreground">
                  {itemsLoading ? 'Chargement...' : `${listItems?.length || 0} élément${(listItems?.length || 0) !== 1 ? 's' : ''}`}
                </p>
              </div>
            )}

            {itemsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full" />
                ))}
              </div>
            ) : !listItems || listItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 rounded-full bg-muted p-6">
                  <Film className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">Cette liste est vide</p>
                <p className="text-sm text-muted-foreground">
                  Ajoutez des films et séries depuis la page d'accueil
                </p>
                <Button asChild className="mt-4">
                  <Link to="/">Découvrir des contenus</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {listItems.map((item, index) => (
                  <ListItemCard 
                    key={item.id} 
                    item={item} 
                    index={index}
                    onRemove={() => handleRemoveFromList(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

interface ListItemCardProps {
  item: ListItemWithContent;
  index: number;
  onRemove: () => void;
}

const ListItemCard = ({ item, index, onRemove }: ListItemCardProps) => {
  const content = item.content;
  
  if (!content) {
    return null;
  }

  const contentId = `${content.type === 'movie' ? 'movie' : 'tv'}-${content.tmdb_id || content.id}`;

  return (
    <div
      className="group flex items-center gap-4 rounded-xl bg-card border border-border p-4 transition-all hover:border-primary/30 hover:shadow-card animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={20} />
      </div>

      <Link to={`/content/${contentId}`} className="shrink-0">
        <img
          src={content.poster_url || '/placeholder.svg'}
          alt={content.title}
          className="h-24 w-16 rounded-lg object-cover"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
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
      </div>

      <Button
        size="icon"
        variant="ghost"
        className="shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 size={18} />
      </Button>
    </div>
  );
};

export default MyLists;
