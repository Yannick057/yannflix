// src/pages/LeavingSoon.tsx

import { useState } from "react";
import { Clock, AlertTriangle, Filter } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { differenceInDays, format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { STREAMING_PLATFORMS } from "@/types/content";
import { Link } from "react-router-dom";

// Demo data - In production, this would come from an API/database
const DEMO_LEAVING_CONTENT = [
  {
    id: "movie-550",
    title: "Fight Club",
    type: "movie" as const,
    posterUrl: "https://image.tmdb.org/t/p/w300/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    leavingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
    platform: "netflix",
    rating: 8.4,
    year: 1999,
  },
  {
    id: "movie-157336",
    title: "Interstellar",
    type: "movie" as const,
    posterUrl: "https://image.tmdb.org/t/p/w300/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    leavingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    platform: "prime",
    rating: 8.6,
    year: 2014,
  },
  {
    id: "tv-1399",
    title: "Game of Thrones",
    type: "series" as const,
    posterUrl: "https://image.tmdb.org/t/p/w300/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    leavingDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
    platform: "max",
    rating: 9.3,
    year: 2011,
  },
  {
    id: "movie-299536",
    title: "Avengers: Infinity War",
    type: "movie" as const,
    posterUrl: "https://image.tmdb.org/t/p/w300/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
    leavingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
    platform: "disney",
    rating: 8.4,
    year: 2018,
  },
  {
    id: "movie-680",
    title: "Pulp Fiction",
    type: "movie" as const,
    posterUrl: "https://image.tmdb.org/t/p/w300/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    leavingDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day
    platform: "netflix",
    rating: 8.9,
    year: 1994,
  },
  {
    id: "tv-66732",
    title: "Stranger Things",
    type: "series" as const,
    posterUrl: "https://image.tmdb.org/t/p/w300/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    leavingDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days
    platform: "netflix",
    rating: 8.7,
    year: 2016,
  },
];

export default function LeavingSoon() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "rating">("date");

  const filteredContent = DEMO_LEAVING_CONTENT.filter((content) =>
    selectedPlatform === "all" ? true : content.platform === selectedPlatform
  ).sort((a, b) => {
    if (sortBy === "date") {
      return new Date(a.leavingDate).getTime() - new Date(b.leavingDate).getTime();
    }
    return b.rating - a.rating;
  });

  const getPlatformInfo = (platformId: string) => {
    return STREAMING_PLATFORMS.find((p) => p.id === platformId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Quitte bientôt</h1>
              <p className="text-muted-foreground">
                Contenus qui vont disparaître des plateformes prochainement
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[180px]">
              <Filter size={16} className="mr-2" />
              <SelectValue placeholder="Plateforme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les plateformes</SelectItem>
              {STREAMING_PLATFORMS.map((platform) => (
                <SelectItem key={platform.id} value={platform.id}>
                  {platform.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v) => setSortBy(v as "date" | "rating")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date de départ</SelectItem>
              <SelectItem value="rating">Note</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredContent.map((content) => {
            const daysRemaining = differenceInDays(
              parseISO(content.leavingDate),
              new Date()
            );
            const isUrgent = daysRemaining <= 7;
            const platform = getPlatformInfo(content.platform);

            return (
              <Link
                key={content.id}
                to={`/content/${content.id}`}
                className="group relative block overflow-hidden rounded-lg bg-card shadow-card transition-all duration-300 hover:shadow-hover hover:scale-[1.02]"
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={content.posterUrl}
                    alt={content.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />

                  {/* Urgent overlay */}
                  {isUrgent && (
                    <div className="absolute inset-0 bg-gradient-to-t from-destructive/80 via-transparent to-transparent" />
                  )}

                  {/* Leaving badge */}
                  <div
                    className={cn(
                      "absolute top-2 left-2 flex items-center gap-1 rounded px-2 py-1 text-xs font-bold",
                      isUrgent
                        ? "bg-destructive text-destructive-foreground animate-pulse"
                        : "bg-amber-500 text-white"
                    )}
                  >
                    <AlertTriangle size={12} />
                    {daysRemaining === 0
                      ? "Dernier jour !"
                      : daysRemaining === 1
                      ? "Demain"
                      : `${daysRemaining} jours`}
                  </div>

                  {/* Platform badge */}
                  {platform && (
                    <div
                      className={cn(
                        "absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium text-white",
                        platform.color
                      )}
                    >
                      {platform.name}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="mb-1 truncate text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {content.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{content.year}</span>
                    <Badge variant="secondary" className="text-xs">
                      ★ {content.rating}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Jusqu'au{" "}
                    {format(parseISO(content.leavingDate), "d MMMM", { locale: fr })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredContent.length === 0 && (
          <div className="text-center py-16">
            <Clock size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Aucun contenu trouvé
            </h3>
            <p className="text-muted-foreground">
              Aucun contenu ne quitte cette plateforme prochainement.
            </p>
          </div>
        )}

        {/* Info banner */}
        <div className="mt-8 rounded-xl bg-muted/50 border border-border p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Comment ça fonctionne ?
              </h3>
              <p className="text-sm text-muted-foreground">
                Les dates de disponibilité peuvent varier selon votre région. Ces informations
                sont mises à jour régulièrement mais peuvent changer sans préavis. Nous vous
                recommandons de vérifier sur la plateforme concernée avant de planifier votre
                visionnage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
