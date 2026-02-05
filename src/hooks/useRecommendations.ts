 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { useAuth } from "@/contexts/AuthContext";
 
 interface ContentRecommendation {
   id: string;
   title: string;
   type: string;
   genres: string[] | null;
   year: number;
   imdb_rating: number | null;
   poster_url: string | null;
   overview: string | null;
 }
 
 interface RecommendationsResponse {
   recommendations: ContentRecommendation[];
   topGenres?: string[];
   preferredType?: string;
   message?: string;
 }
 
 export function useRecommendations() {
   const { user } = useAuth();
 
   return useQuery({
     queryKey: ["recommendations", user?.id],
     queryFn: async (): Promise<RecommendationsResponse> => {
       const { data, error } = await supabase.functions.invoke("recommendations");
 
       if (error) {
         console.error("Error fetching recommendations:", error);
         throw error;
       }
 
       return data as RecommendationsResponse;
     },
     enabled: !!user,
     staleTime: 1000 * 60 * 10, // 10 minutes
     refetchOnWindowFocus: false,
   });
 }