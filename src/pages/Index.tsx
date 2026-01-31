import { useState, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { SearchBar } from '@/components/SearchBar';
import { FilterSidebar, FilterState } from '@/components/FilterSidebar';
import { ContentGrid } from '@/components/ContentGrid';
import { mockContent, filterContent } from '@/data/mockContent';
import { Content } from '@/types/content';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    genres: [],
    yearRange: [1990, 2024],
    minRating: 0,
    streamingServices: [],
    countries: [],
  });
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredContent = useMemo(() => {
    let result = mockContent;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.genres.some((g) => g.toLowerCase().includes(query))
      );
    }

    // Apply filters
    result = filterContent(result, {
      type: filters.type,
      genres: filters.genres,
      yearRange: filters.yearRange,
      minRating: filters.minRating,
      streamingServices: filters.streamingServices,
    });

    // Apply country filter
    if (filters.countries.length > 0) {
      result = result.filter((item) => filters.countries.includes(item.country));
    }

    return result;
  }, [searchQuery, filters]);

  const handleAddToWatchlist = (content: Content) => {
    setWatchlist((prev) =>
      prev.includes(content.id)
        ? prev.filter((id) => id !== content.id)
        : [...prev, content.id]
    );
  };

  const activeFilterCount = 
    (filters.type !== 'all' ? 1 : 0) +
    filters.genres.length +
    filters.streamingServices.length +
    filters.countries.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.yearRange[0] !== 1990 || filters.yearRange[1] !== 2024 ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero section with search */}
      <section className="gradient-hero py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-5xl">
              Trouvez votre prochain{' '}
              <span className="text-gradient">film ou série</span>
            </h1>
            <p className="mb-8 text-muted-foreground md:text-lg">
              Découvrez où regarder vos contenus préférés sur toutes les plateformes de streaming
            </p>
            <SearchBar
              onSearch={setSearchQuery}
              className="mx-auto max-w-xl"
            />
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <FilterSidebar
            onFiltersChange={setFilters}
            className="hidden lg:block"
          />

          {/* Content area */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter button + results count */}
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredContent.length}</span>{' '}
                résultat{filteredContent.length !== 1 ? 's' : ''}
                {searchQuery && (
                  <span>
                    {' '}pour "<span className="text-primary">{searchQuery}</span>"
                  </span>
                )}
              </div>

              {/* Mobile filters */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="lg:hidden"
                  >
                    <Filter size={16} className="mr-2" />
                    Filtres
                    {activeFilterCount > 0 && (
                      <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto bg-background p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Filtres</h2>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileFiltersOpen(false)}
                    >
                      <X size={18} />
                    </Button>
                  </div>
                  <FilterSidebar onFiltersChange={setFilters} />
                </SheetContent>
              </Sheet>
            </div>

            {/* Content grid */}
            <ContentGrid
              content={filteredContent}
              onAddToList={handleAddToWatchlist}
              watchlist={watchlist}
              emptyMessage="Aucun contenu ne correspond à vos critères"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
