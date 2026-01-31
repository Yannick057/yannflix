import { cn } from '@/lib/utils';

interface StreamingBadgeProps {
  platform: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const platformConfig: Record<string, { bg: string; text: string; abbr: string }> = {
  netflix: { bg: 'bg-netflix', text: 'text-white', abbr: 'N' },
  prime: { bg: 'bg-prime', text: 'text-white', abbr: 'P' },
  disney: { bg: 'bg-disney', text: 'text-white', abbr: 'D+' },
  hulu: { bg: 'bg-hulu', text: 'text-white', abbr: 'H' },
  apple: { bg: 'bg-secondary border border-border', text: 'text-foreground', abbr: 'A' },
  hbo: { bg: 'bg-hbo', text: 'text-white', abbr: 'M' },
};

const platformNames: Record<string, string> = {
  netflix: 'Netflix',
  prime: 'Prime Video',
  disney: 'Disney+',
  hulu: 'Hulu',
  apple: 'Apple TV+',
  hbo: 'Max',
};

export function StreamingBadge({ platform, size = 'md', showName = false }: StreamingBadgeProps) {
  const config = platformConfig[platform.toLowerCase()] || { 
    bg: 'bg-muted', 
    text: 'text-muted-foreground',
    abbr: platform.charAt(0).toUpperCase()
  };

  const sizeClasses = {
    sm: 'h-5 min-w-5 text-[10px] px-1',
    md: 'h-6 min-w-6 text-xs px-1.5',
    lg: 'h-8 min-w-8 text-sm px-2',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded font-bold transition-transform hover:scale-105',
        config.bg,
        config.text,
        sizeClasses[size]
      )}
      title={platformNames[platform.toLowerCase()] || platform}
    >
      {showName ? platformNames[platform.toLowerCase()] || platform : config.abbr}
    </div>
  );
}
