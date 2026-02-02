import { cn } from '@/lib/utils';
import { getImageUrl } from '@/lib/tmdb';

interface StreamingBadgeProps {
  platform: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  logoPath?: string | null;
  name?: string;
}

const platformConfig: Record<string, { bg: string; text: string; abbr: string; name: string }> = {
  netflix: { bg: 'bg-red-600', text: 'text-white', abbr: 'N', name: 'Netflix' },
  prime: { bg: 'bg-blue-500', text: 'text-white', abbr: 'P', name: 'Prime Video' },
  disney: { bg: 'bg-blue-700', text: 'text-white', abbr: 'D+', name: 'Disney+' },
  canal: { bg: 'bg-black', text: 'text-white', abbr: 'C+', name: 'Canal+' },
  apple: { bg: 'bg-gray-800', text: 'text-white', abbr: 'A', name: 'Apple TV+' },
  ocs: { bg: 'bg-orange-500', text: 'text-white', abbr: 'OCS', name: 'OCS' },
  paramount: { bg: 'bg-blue-600', text: 'text-white', abbr: 'P+', name: 'Paramount+' },
  crunchyroll: { bg: 'bg-orange-600', text: 'text-white', abbr: 'CR', name: 'Crunchyroll' },
  adn: { bg: 'bg-blue-400', text: 'text-white', abbr: 'ADN', name: 'ADN' },
  max: { bg: 'bg-purple-600', text: 'text-white', abbr: 'M', name: 'Max' },
};

export function StreamingBadge({ platform, size = 'md', showName = false, logoPath, name }: StreamingBadgeProps) {
  const config = platformConfig[platform.toLowerCase()] || { 
    bg: 'bg-muted', 
    text: 'text-muted-foreground',
    abbr: platform.charAt(0).toUpperCase(),
    name: name || platform
  };

  const sizeClasses = {
    sm: 'h-5 min-w-5 text-[10px] px-1',
    md: 'h-6 min-w-6 text-xs px-1.5',
    lg: 'h-8 min-w-8 text-sm px-2',
  };

  const logoSizes = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  // If we have a logo path from TMDB, use the image
  if (logoPath) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 transition-transform hover:scale-105',
        )}
        title={name || config.name}
      >
        <img 
          src={getImageUrl(logoPath, 'w200')} 
          alt={name || config.name}
          className={cn('rounded object-contain', logoSizes[size])}
        />
        {showName && <span className="text-sm text-foreground">{name || config.name}</span>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded font-bold transition-transform hover:scale-105',
        config.bg,
        config.text,
        sizeClasses[size]
      )}
      title={name || config.name}
    >
      {showName ? (name || config.name) : config.abbr}
    </div>
  );
}
