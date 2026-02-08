import { Navbar } from "@/components/Navbar";
import { useViewingStats } from "@/hooks/useViewingStats";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { BarChart3, Clock, Film, Trophy, TrendingUp, Tv } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h < 24) return `${h}h ${m > 0 ? `${m}min` : ""}`.trim();
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return `${d}j ${rh > 0 ? `${rh}h` : ""}`.trim();
}

const Stats = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats, isLoading } = useViewingStats();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Connectez-vous pour voir vos statistiques</h2>
          <p className="text-muted-foreground mb-6">
            Suivez votre progression et découvrez vos habitudes de visionnage.
          </p>
          <Button onClick={() => navigate("/auth")}>Connexion</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-purple-400" />
          Mes statistiques
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
          </div>
        ) : !stats || stats.totalEpisodesWatched === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Tv className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">Aucune donnée de visionnage</p>
            <p className="text-sm mt-2">Commencez à marquer des épisodes comme vus pour voir vos stats !</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Key metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6 text-center">
                  <Film className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{stats.totalEpisodesWatched}</p>
                  <p className="text-sm text-muted-foreground">Épisodes vus</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6 text-center">
                  <Clock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{formatDuration(stats.totalMinutesWatched)}</p>
                  <p className="text-sm text-muted-foreground">Temps total</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{stats.seriesStarted}</p>
                  <p className="text-sm text-muted-foreground">Séries commencées</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">{stats.seriesCompleted}</p>
                  <p className="text-sm text-muted-foreground">Séries terminées</p>
                </CardContent>
              </Card>
            </div>

            {/* Favorite genres */}
            {stats.favoriteGenres.length > 0 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Genres préférés</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats.favoriteGenres.map((g) => {
                    const maxCount = stats.favoriteGenres[0].count;
                    const pct = Math.round((g.count / maxCount) * 100);
                    return (
                      <div key={g.genre} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-300">{g.genre}</span>
                          <span className="text-muted-foreground">{g.count} épisodes</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Completed series */}
            {stats.completedSeries.length > 0 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    Séries terminées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {stats.completedSeries.map((s) => (
                      <div key={s.name} className="text-center">
                        <img
                          src={s.posterUrl}
                          alt={s.name}
                          className="w-full aspect-[2/3] object-cover rounded-lg mb-2"
                        />
                        <p className="text-xs text-gray-300 line-clamp-2">{s.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity by month */}
            {stats.watchedByMonth.length > 0 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Activité par mois</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 h-40">
                    {stats.watchedByMonth.map((m) => {
                      const maxC = Math.max(...stats.watchedByMonth.map((x) => x.count));
                      const heightPct = maxC > 0 ? (m.count / maxC) * 100 : 0;
                      const [year, month] = m.month.split("-");
                      const label = new Date(Number(year), Number(month) - 1).toLocaleDateString("fr-FR", { month: "short" });
                      return (
                        <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs text-muted-foreground">{m.count}</span>
                          <div
                            className="w-full bg-purple-500/80 rounded-t"
                            style={{ height: `${Math.max(heightPct, 5)}%` }}
                          />
                          <span className="text-xs text-muted-foreground">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stats;
