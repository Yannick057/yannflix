import { useState } from 'react';
import { Plus, MoreHorizontal, Trash2, Edit2, GripVertical, Film, Tv, Clock, Check, X, List } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { mockContent } from '@/data/mockContent';
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
import { Content } from '@/types/content';
import { Link } from 'react-router-dom';

interface UserList {
  id: string;
  name: string;
  isDefault: boolean;
  items: Content[];
}

const MyLists = () => {
  const [lists, setLists] = useState<UserList[]>([
    {
      id: 'watchlist',
      name: 'À regarder',
      isDefault: true,
      items: mockContent.slice(0, 4),
    },
    {
      id: 'watched',
      name: 'Déjà vu',
      isDefault: true,
      items: mockContent.slice(4, 7),
    },
    {
      id: 'favorites',
      name: 'Mes favoris',
      isDefault: false,
      items: mockContent.slice(2, 5),
    },
  ]);
  const [activeListId, setActiveListId] = useState('watchlist');
  const [newListName, setNewListName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const activeList = lists.find((l) => l.id === activeListId) || lists[0];

  const createList = () => {
    if (newListName.trim()) {
      setLists([
        ...lists,
        {
          id: `list-${Date.now()}`,
          name: newListName.trim(),
          isDefault: false,
          items: [],
        },
      ]);
      setNewListName('');
      setIsCreateDialogOpen(false);
    }
  };

  const deleteList = (id: string) => {
    setLists(lists.filter((l) => l.id !== id));
    if (activeListId === id) {
      setActiveListId(lists[0].id);
    }
  };

  const startEditing = (list: UserList) => {
    setEditingListId(list.id);
    setEditingName(list.name);
  };

  const saveEdit = () => {
    if (editingName.trim() && editingListId) {
      setLists(lists.map((l) =>
        l.id === editingListId ? { ...l, name: editingName.trim() } : l
      ));
      setEditingListId(null);
    }
  };

  const removeFromList = (listId: string, contentId: string) => {
    setLists(lists.map((l) =>
      l.id === listId
        ? { ...l, items: l.items.filter((item) => item.id !== contentId) }
        : l
    ));
  };

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
                onKeyDown={(e) => e.key === 'Enter' && createList()}
                className="bg-secondary border-border"
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={createList} disabled={!newListName.trim()}>
                  Créer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Lists sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <div className="space-y-2">
              {lists.map((list) => (
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
                        "flex-1 font-medium",
                        activeListId === list.id ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {list.name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {list.items.length}
                      </Badge>
                      {!list.isDefault && (
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
                              onClick={() => deleteList(list.id)}
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
              ))}
            </div>
          </aside>

          {/* List content */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">{activeList.name}</h2>
              <p className="text-muted-foreground">
                {activeList.items.length} élément{activeList.items.length !== 1 ? 's' : ''}
              </p>
            </div>

            {activeList.items.length === 0 ? (
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
                {activeList.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="group flex items-center gap-4 rounded-xl bg-card border border-border p-4 transition-all hover:border-primary/30 hover:shadow-card animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical size={20} />
                    </div>

                    <Link to={`/content/${item.id}`} className="shrink-0">
                      <img
                        src={item.poster_url}
                        alt={item.title}
                        className="h-24 w-16 rounded-lg object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {item.type === 'movie' ? (
                              <Film size={14} className="text-muted-foreground" />
                            ) : (
                              <Tv size={14} className="text-muted-foreground" />
                            )}
                            <Link
                              to={`/content/${item.id}`}
                              className="font-semibold text-foreground hover:text-primary transition-colors"
                            >
                              {item.title}
                            </Link>
                            {item.leaving_date && (
                              <Badge variant="destructive" className="text-xs">
                                <Clock size={10} className="mr-1" />
                                Bientôt indisponible
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{item.year}</span>
                            <RatingBadge rating={item.imdb_rating} size="sm" />
                            <span>{item.genres.slice(0, 2).join(', ')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.streaming_services.slice(0, 3).map((service) => (
                          <StreamingBadge key={service.id} platform={service.id} size="sm" />
                        ))}
                      </div>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromList(activeList.id, item.id)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyLists;
