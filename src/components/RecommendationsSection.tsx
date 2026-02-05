 import { Sparkles, RefreshCw } from "lucide-react";
 import { useRecommendations } from "@/hooks/useRecommendations";
 import { ContentCard } from "./ContentCard";
 import { Button } from "@/components/ui/button";
 import { Skeleton } from "@/components/ui/skeleton";
 import { useAuth } from "@/contexts/AuthContext";
 import { useNavigate } from "react-router-dom";
 
 export function RecommendationsSection() {
   const { user } = useAuth();
   const navigate = useNavigate();
   const { data, isLoading, refetch, isRefetching } = useRecommendations();
 
   if (!user) {
     return (
       <section className="space-y-4">
         <div className="flex items-center gap-2">
           <Sparkles className="h-5 w-5 text-primary" />
           <h2 className="text-xl font-semibold">Recommandations pour vous</h2>
         </div>
         <div className="rounded-xl bg-card border border-border p-6 text-center">
           <p className="text-muted-foreground mb-4">
             Connectez-vous pour obtenir des recommandations personnalisées basées sur votre historique.
           </p>
           <Button onClick={() => navigate("/auth")}>Se connecter</Button>
         </div>
       </section>
     );
   }
 
   if (isLoading) {
     return (
       <section className="space-y-4">
         <div className="flex items-center gap-2">
           <Sparkles className="h-5 w-5 text-primary" />
           <h2 className="text-xl font-semibold">Recommandations pour vous</h2>
         </div>
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
           {Array.from({ length: 5 }).map((_, i) => (
             <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
           ))}
         </div>
       </section>
     );
   }
 
   if (!data?.recommendations?.length) {
     return (
       <section className="space-y-4">
         <div className="flex items-center gap-2">
           <Sparkles className="h-5 w-5 text-primary" />
           <h2 className="text-xl font-semibold">Recommandations pour vous</h2>
         </div>
         <div className="rounded-xl bg-card border border-border p-6 text-center">
           <p className="text-muted-foreground">
             {data?.message || "Marquez des contenus comme vus pour obtenir des recommandations personnalisées."}
           </p>
         </div>
       </section>
     );
   }
 
   return (
     <section className="space-y-4">
       <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
           <Sparkles className="h-5 w-5 text-primary" />
           <h2 className="text-xl font-semibold">Recommandations pour vous</h2>
           {data.topGenres && (
             <span className="text-sm text-muted-foreground hidden sm:inline">
               basées sur {data.topGenres.slice(0, 3).join(", ")}
             </span>
           )}
         </div>
         <Button
           variant="ghost"
           size="sm"
           onClick={() => refetch()}
           disabled={isRefetching}
           className="gap-2"
         >
           <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
           <span className="hidden sm:inline">Actualiser</span>
         </Button>
       </div>
 
       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
         {data.recommendations.map((content) => (
           <ContentCard
             key={content.id}
             content={{
               id: content.id,
               title: content.title,
               type: content.type as "movie" | "series",
               genres: content.genres || [],
               year: content.year,
               rating: content.imdb_rating || 0,
               imdb_rating: content.imdb_rating || 0,
               poster_url: content.poster_url || undefined,
               posterUrl: content.poster_url || undefined,
               overview: content.overview || "",
               country: "FR",
               streamingServices: [],
             }}
           />
         ))}
       </div>
     </section>
   );
 }