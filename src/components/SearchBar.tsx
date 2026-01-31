import { useState, useRef, useEffect } from 'react';
import { Search, X, Film, Tv } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Content } from '@/types/content';
import { searchContent } from '@/data/mockContent';
import { Link } from 'react-router-dom';

interface SearchBarProps {
  className?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export function SearchBar({ className, onSearch, placeholder = "Rechercher un film ou une série..." }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Content[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length >= 2) {
      const searchResults = searchContent(query);
      setResults(searchResults.slice(0, 6));
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch?.(query);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="h-12 w-full rounded-full border-border bg-secondary/50 pl-12 pr-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground"
            onClick={handleClear}
          >
            <X size={18} />
          </Button>
        )}
      </form>

      {/* Search results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-hover animate-fade-in">
          <div className="max-h-[400px] overflow-y-auto">
            {results.map((item) => (
              <Link
                key={item.id}
                to={`/content/${item.id}`}
                className="flex items-center gap-3 p-3 transition-colors hover:bg-secondary/50"
                onClick={() => setIsOpen(false)}
              >
                <img
                  src={item.poster_url}
                  alt={item.title}
                  className="h-16 w-11 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {item.type === 'movie' ? (
                      <Film size={14} className="text-muted-foreground shrink-0" />
                    ) : (
                      <Tv size={14} className="text-muted-foreground shrink-0" />
                    )}
                    <h4 className="truncate font-medium text-foreground">{item.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.year} • {item.genres.slice(0, 2).join(', ')}
                  </p>
                </div>
                <div className="flex gap-1">
                  {item.streaming_services.slice(0, 2).map((service) => (
                    <span
                      key={service.id}
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold",
                        service.id === 'netflix' && "bg-netflix text-white",
                        service.id === 'prime' && "bg-prime text-white",
                        service.id === 'disney' && "bg-disney text-white",
                        service.id === 'hulu' && "bg-hulu text-white",
                        service.id === 'apple' && "bg-secondary border border-border text-foreground",
                        service.id === 'hbo' && "bg-hbo text-white"
                      )}
                    >
                      {service.id.charAt(0).toUpperCase()}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
          {results.length >= 6 && (
            <div className="border-t border-border p-3">
              <Button
                variant="ghost"
                className="w-full justify-center text-primary hover:text-primary/80"
                onClick={() => {
                  onSearch?.(query);
                  setIsOpen(false);
                }}
              >
                Voir tous les résultats
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
