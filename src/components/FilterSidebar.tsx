import { useState } from 'react';
import { ChevronDown, X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { GENRES, STREAMING_PLATFORMS, COUNTRIES } from '@/types/content';
import { StreamingBadge } from './StreamingBadge';

interface FilterSidebarProps {
  onFiltersChange?: (filters: FilterState) => void;
  onChange?: (filters: FilterState) => void;
  filters?: FilterState;
  className?: string;
}

export interface FilterState {
  type: 'all' | 'movie' | 'series';
  genres: string[];
  yearRange: [number, number];
  minRating: number;
  streamingServices: string[];
  countries: string[];
  inProgress: boolean;
}

const defaultFilters: FilterState = {
  type: 'all',
  genres: [],
  yearRange: [1990, 2024],
  minRating: 0,
  streamingServices: [],
  countries: [],
  inProgress: false,
};

export function FilterSidebar({ onFiltersChange, onChange, filters: externalFilters, className }: FilterSidebarProps) {
  const [internalFilters, setInternalFilters] = useState<FilterState>(defaultFilters);
  const filters = externalFilters ?? internalFilters;
  const [openSections, setOpenSections] = useState({
    type: true,
    streaming: true,
    genre: true,
    year: false,
    rating: false,
    country: false,
  });

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    if (!externalFilters) {
      setInternalFilters(updated);
    }
    onFiltersChange?.(updated);
    onChange?.(updated);
  };

  const toggleArrayFilter = (
    key: 'genres' | 'streamingServices' | 'countries',
    value: string
  ) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilters({ [key]: updated });
  };

  const resetFilters = () => {
    if (!externalFilters) {
      setInternalFilters(defaultFilters);
    }
    onFiltersChange?.(defaultFilters);
    onChange?.(defaultFilters);
  };

  const hasActiveFilters = 
    filters.type !== 'all' ||
    filters.genres.length > 0 ||
    filters.streamingServices.length > 0 ||
    filters.countries.length > 0 ||
    filters.minRating > 0 ||
    filters.yearRange[0] !== 1990 ||
    filters.yearRange[1] !== 2024 ||
    filters.inProgress;

  return (
    <aside className={cn("w-64 shrink-0 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Filter size={18} />
          Filtres
        </h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 text-xs text-muted-foreground hover:text-destructive"
          >
            <X size={14} className="mr-1" />
            Réinitialiser
          </Button>
        )}
      </div>

      {/* In progress filter */}
      <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-secondary/30 px-3 py-2.5 hover:bg-secondary/50 transition-colors">
        <Checkbox
          checked={filters.inProgress}
          onCheckedChange={(checked) => updateFilters({ inProgress: !!checked })}
          className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <span className="text-sm font-medium text-foreground">En cours de visionnage</span>
      </label>

      {/* Type filter */}
      <FilterSection
        title="Type"
        isOpen={openSections.type}
        onToggle={() => setOpenSections(s => ({ ...s, type: !s.type }))}
      >
        <div className="flex gap-2">
          {(['all', 'movie', 'series'] as const).map((type) => (
            <Button
              key={type}
              variant={filters.type === type ? 'default' : 'secondary'}
              size="sm"
              onClick={() => updateFilters({ type })}
              className={cn(
                "flex-1",
                filters.type === type && "bg-primary text-primary-foreground"
              )}
            >
              {type === 'all' ? 'Tous' : type === 'movie' ? 'Films' : 'Séries'}
            </Button>
          ))}
        </div>
      </FilterSection>

      {/* Streaming platforms */}
      <FilterSection
        title="Plateformes"
        isOpen={openSections.streaming}
        onToggle={() => setOpenSections(s => ({ ...s, streaming: !s.streaming }))}
      >
        <div className="grid grid-cols-3 gap-2">
          {STREAMING_PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              onClick={() => toggleArrayFilter('streamingServices', platform.id)}
              className={cn(
                "relative rounded-lg p-2 transition-all",
                filters.streamingServices.includes(platform.id)
                  ? "ring-2 ring-primary bg-secondary"
                  : "bg-muted/30 hover:bg-muted/50"
              )}
            >
              <StreamingBadge platform={platform.id} size="md" />
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Genres */}
      <FilterSection
        title="Genres"
        isOpen={openSections.genre}
        onToggle={() => setOpenSections(s => ({ ...s, genre: !s.genre }))}
      >
        <div className="max-h-48 space-y-1 overflow-y-auto pr-2">
          {GENRES.map((genre) => (
            <label
              key={genre}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/30"
            >
              <Checkbox
                checked={filters.genres.includes(genre)}
                onCheckedChange={() => toggleArrayFilter('genres', genre)}
                className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm text-foreground">{genre}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Year range */}
      <FilterSection
        title={`Année (${filters.yearRange[0]} - ${filters.yearRange[1]})`}
        isOpen={openSections.year}
        onToggle={() => setOpenSections(s => ({ ...s, year: !s.year }))}
      >
        <div className="px-2 pt-2">
          <Slider
            value={filters.yearRange}
            min={1950}
            max={2024}
            step={1}
            onValueChange={(value) => updateFilters({ yearRange: value as [number, number] })}
            className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
          />
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection
        title={`Note minimum: ${filters.minRating > 0 ? filters.minRating.toFixed(1) : 'Aucune'}`}
        isOpen={openSections.rating}
        onToggle={() => setOpenSections(s => ({ ...s, rating: !s.rating }))}
      >
        <div className="px-2 pt-2">
          <Slider
            value={[filters.minRating]}
            min={0}
            max={10}
            step={0.5}
            onValueChange={(value) => updateFilters({ minRating: value[0] })}
            className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary"
          />
        </div>
      </FilterSection>

      {/* Countries */}
      <FilterSection
        title="Pays"
        isOpen={openSections.country}
        onToggle={() => setOpenSections(s => ({ ...s, country: !s.country }))}
      >
        <div className="max-h-40 space-y-1 overflow-y-auto pr-2">
          {COUNTRIES.map((country) => (
            <label
              key={country}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/30"
            >
              <Checkbox
                checked={filters.countries.includes(country)}
                onCheckedChange={() => toggleArrayFilter('countries', country)}
                className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm text-foreground">{country}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </aside>
  );
}

function FilterSection({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg bg-secondary/30 px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors">
        {title}
        <ChevronDown
          size={16}
          className={cn(
            "transition-transform text-muted-foreground",
            isOpen && "rotate-180"
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
