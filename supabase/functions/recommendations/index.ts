 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
 };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const authHeader = req.headers.get("Authorization");
     if (!authHeader) {
       return new Response(JSON.stringify({ error: "Non autorisé" }), {
         status: 401,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
     const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
     const supabase = createClient(supabaseUrl, supabaseKey, {
       global: { headers: { Authorization: authHeader } },
     });
 
     const { data: { user }, error: userError } = await supabase.auth.getUser();
     if (userError || !user) {
       return new Response(JSON.stringify({ error: "Utilisateur non trouvé" }), {
         status: 401,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     // Get user's watched content from "Déjà vu" list
     const { data: watchedList } = await supabase
       .from("user_lists")
       .select("id")
       .eq("user_id", user.id)
       .eq("name", "Déjà vu")
       .single();
 
     if (!watchedList) {
       return new Response(JSON.stringify({ recommendations: [], message: "Pas encore d'historique" }), {
         status: 200,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     // Get watched content details
     const { data: watchedItems } = await supabase
       .from("list_items")
       .select(`
         content:content_id (
           id, title, type, genres, year, imdb_rating
         )
       `)
       .eq("list_id", watchedList.id)
       .eq("watched", true)
       .order("watched_at", { ascending: false })
       .limit(20);
 
     if (!watchedItems || watchedItems.length === 0) {
       return new Response(JSON.stringify({ recommendations: [], message: "Regardez du contenu pour obtenir des recommandations" }), {
         status: 200,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     // Extract genres and preferences
     const watchedContent = watchedItems.map(item => item.content).filter(Boolean);
     const genreCounts: Record<string, number> = {};
     const typeCounts: Record<string, number> = {};
     const watchedIds = new Set<string>();
 
     watchedContent.forEach((content: any) => {
       watchedIds.add(content.id);
       typeCounts[content.type] = (typeCounts[content.type] || 0) + 1;
       if (content.genres) {
         content.genres.forEach((genre: string) => {
           genreCounts[genre] = (genreCounts[genre] || 0) + 1;
         });
       }
     });
 
     // Get top genres
     const topGenres = Object.entries(genreCounts)
       .sort(([, a], [, b]) => b - a)
       .slice(0, 5)
       .map(([genre]) => genre);
 
     const preferredType = Object.entries(typeCounts)
       .sort(([, a], [, b]) => b - a)[0]?.[0] || "movie";
 
     // Use AI to generate personalized recommendations
     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
     if (!LOVABLE_API_KEY) {
       // Fallback: return genre-based recommendations without AI
       const { data: recommendations } = await supabase
         .from("content")
         .select("*")
         .overlaps("genres", topGenres)
         .gte("imdb_rating", 7)
         .order("imdb_rating", { ascending: false })
         .limit(20);
 
       const filtered = recommendations?.filter(r => !watchedIds.has(r.id)) || [];
       return new Response(JSON.stringify({ recommendations: filtered.slice(0, 10) }), {
         status: 200,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     // Get available content for recommendations
     const { data: availableContent } = await supabase
       .from("content")
       .select("id, title, type, genres, year, imdb_rating, overview")
       .gte("imdb_rating", 6.5)
       .order("imdb_rating", { ascending: false })
       .limit(100);
 
     const candidateContent = availableContent?.filter(c => !watchedIds.has(c.id)) || [];
 
     const prompt = `Tu es un expert en recommandations de films et séries. Analyse l'historique de visionnage de l'utilisateur et recommande les meilleurs contenus.
 
 HISTORIQUE DE VISIONNAGE (du plus récent au plus ancien):
 ${watchedContent.slice(0, 10).map((c: any) => `- ${c.title} (${c.type}, ${c.year}) - Genres: ${c.genres?.join(", ") || "N/A"}`).join("\n")}
 
 GENRES PRÉFÉRÉS: ${topGenres.join(", ")}
 TYPE PRÉFÉRÉ: ${preferredType === "movie" ? "Films" : "Séries"}
 
 CONTENUS DISPONIBLES À RECOMMANDER:
 ${candidateContent.slice(0, 50).map((c: any) => `ID:${c.id} | ${c.title} (${c.type}, ${c.year}) - Note: ${c.imdb_rating} - Genres: ${c.genres?.join(", ") || "N/A"}`).join("\n")}
 
 Choisis les 8 meilleurs contenus à recommander basés sur les préférences de l'utilisateur. Privilégie la diversité tout en restant pertinent.`;
 
     const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
       method: "POST",
       headers: {
         Authorization: `Bearer ${LOVABLE_API_KEY}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: "google/gemini-3-flash-preview",
         messages: [
           { role: "system", content: "Tu retournes uniquement les IDs des contenus recommandés, séparés par des virgules, sans explication." },
           { role: "user", content: prompt },
         ],
         tools: [
           {
             type: "function",
             function: {
               name: "recommend_content",
               description: "Return recommended content IDs",
               parameters: {
                 type: "object",
                 properties: {
                   content_ids: {
                     type: "array",
                     items: { type: "string" },
                     description: "Array of content IDs to recommend",
                   },
                 },
                 required: ["content_ids"],
               },
             },
           },
         ],
         tool_choice: { type: "function", function: { name: "recommend_content" } },
       }),
     });
 
     if (!aiResponse.ok) {
       // Fallback to genre-based recommendations
       const filtered = candidateContent.filter(c => 
         c.genres?.some((g: string) => topGenres.includes(g))
       ).slice(0, 10);
       
       return new Response(JSON.stringify({ recommendations: filtered }), {
         status: 200,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     const aiData = await aiResponse.json();
     let recommendedIds: string[] = [];
 
     try {
       const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
       if (toolCall?.function?.arguments) {
         const args = JSON.parse(toolCall.function.arguments);
         recommendedIds = args.content_ids || [];
       }
     } catch {
       // Parse from text if tool call fails
       const text = aiData.choices?.[0]?.message?.content || "";
       recommendedIds = text.match(/[a-f0-9-]{36}/g) || [];
     }
 
     // Get full content details for recommended IDs
     const recommendations = candidateContent.filter(c => recommendedIds.includes(c.id));
     
     // If AI didn't return enough, fill with genre-based
     if (recommendations.length < 6) {
       const genreBased = candidateContent
         .filter(c => !recommendedIds.includes(c.id) && c.genres?.some((g: string) => topGenres.includes(g)))
         .slice(0, 10 - recommendations.length);
       recommendations.push(...genreBased);
     }
 
     return new Response(JSON.stringify({ 
       recommendations: recommendations.slice(0, 10),
       topGenres,
       preferredType 
     }), {
       status: 200,
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
 
   } catch (error) {
     console.error("Recommendations error:", error);
     return new Response(JSON.stringify({ error: "Erreur serveur" }), {
       status: 500,
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   }
 });