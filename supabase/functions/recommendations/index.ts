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

    // Get user's watched episodes (for genre analysis via TMDB)
    const { data: watchedEpisodes } = await supabase
      .from("watched_episodes")
      .select("tmdb_id")
      .eq("user_id", user.id);

    // Get user's ratings (highly rated = strong preference signal)
    const { data: userRatings } = await supabase
      .from("user_ratings")
      .select("*")
      .eq("user_id", user.id)
      .order("rating", { ascending: false });

    // Get user's watched content from "Déjà vu" list
    const { data: watchedList } = await supabase
      .from("user_lists")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", "Déjà vu")
      .maybeSingle();

    let watchedContent: any[] = [];
    const watchedIds = new Set<string>();

    if (watchedList) {
      const { data: watchedItems } = await supabase
        .from("list_items")
        .select(`content:content_id (id, title, type, genres, year, imdb_rating)`)
        .eq("list_id", watchedList.id)
        .eq("watched", true)
        .order("watched_at", { ascending: false })
        .limit(20);

      watchedContent = (watchedItems || []).map((item: any) => item.content).filter(Boolean);
      watchedContent.forEach((c: any) => watchedIds.add(c.id));
    }

    // Collect unique TMDB IDs from watched episodes for genre fetching
    const uniqueWatchedTmdbIds = [...new Set((watchedEpisodes || []).map((e: any) => e.tmdb_id))].slice(0, 10);

    // Fetch genres from TMDB for watched series
    const TMDB_API_KEY = "7a3274f34ebaa7ba918d500f64524558";
    const tmdbGenres: string[] = [];

    for (const tmdbId of uniqueWatchedTmdbIds) {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_API_KEY}&language=fr-FR`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.genres) {
            data.genres.forEach((g: any) => tmdbGenres.push(g.name));
          }
        }
      } catch {
        // skip
      }
    }

    // Also fetch genres for highly rated content
    const highlyRated = (userRatings || []).filter((r: any) => r.rating >= 4).slice(0, 5);
    for (const rating of highlyRated) {
      try {
        const endpoint = rating.content_type === "movie" ? "movie" : "tv";
        const res = await fetch(
          `https://api.themoviedb.org/3/${endpoint}/${rating.tmdb_id}?api_key=${TMDB_API_KEY}&language=fr-FR`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.genres) {
            // Weight highly rated genres more
            data.genres.forEach((g: any) => {
              tmdbGenres.push(g.name);
              tmdbGenres.push(g.name); // double weight
            });
          }
        }
      } catch {
        // skip
      }
    }

    // Combine all genre signals
    const genreCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};

    // From watched list
    watchedContent.forEach((content: any) => {
      typeCounts[content.type] = (typeCounts[content.type] || 0) + 1;
      if (content.genres) {
        content.genres.forEach((genre: string) => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });

    // From TMDB genres (watched episodes + ratings)
    tmdbGenres.forEach((genre) => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });

    // From ratings content types
    (userRatings || []).forEach((r: any) => {
      const type = r.content_type === "movie" ? "movie" : "series";
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    const topGenres = Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([genre]) => genre);

    const preferredType = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || "movie";

    if (topGenres.length === 0) {
      return new Response(JSON.stringify({
        recommendations: [],
        message: "Regardez du contenu ou notez des films/séries pour obtenir des recommandations",
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use AI for recommendations
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    // Get available content
    const { data: availableContent } = await supabase
      .from("content")
      .select("id, title, type, genres, year, imdb_rating, overview, poster_url")
      .gte("imdb_rating", 6.5)
      .order("imdb_rating", { ascending: false })
      .limit(100);

    const candidateContent = availableContent?.filter((c: any) => !watchedIds.has(c.id)) || [];

    if (!LOVABLE_API_KEY) {
      // Fallback: genre-based recommendations
      const filtered = candidateContent
        .filter((c: any) => c.genres?.some((g: string) => topGenres.includes(g)))
        .slice(0, 10);

      return new Response(JSON.stringify({ recommendations: filtered, topGenres, preferredType }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ratingContext = highlyRated.length > 0
      ? `\nCONTENUS LES MIEUX NOTÉS PAR L'UTILISATEUR (${highlyRated.map((r: any) => `tmdb:${r.tmdb_id} = ${r.rating}/5`).join(", ")})`
      : "";

    const prompt = `Tu es un expert en recommandations de films et séries. Analyse l'historique et les préférences de l'utilisateur.

HISTORIQUE DE VISIONNAGE:
${watchedContent.slice(0, 10).map((c: any) => `- ${c.title} (${c.type}, ${c.year}) - Genres: ${c.genres?.join(", ") || "N/A"}`).join("\n")}
${ratingContext}

GENRES PRÉFÉRÉS: ${topGenres.join(", ")}
TYPE PRÉFÉRÉ: ${preferredType === "movie" ? "Films" : "Séries"}
SÉRIES EN COURS DE VISIONNAGE: ${uniqueWatchedTmdbIds.length}

CONTENUS DISPONIBLES:
${candidateContent.slice(0, 50).map((c: any) => `ID:${c.id} | ${c.title} (${c.type}, ${c.year}) - Note: ${c.imdb_rating} - Genres: ${c.genres?.join(", ") || "N/A"}`).join("\n")}

Choisis les 8 meilleurs contenus. Privilégie diversité et pertinence.`;

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
        tools: [{
          type: "function",
          function: {
            name: "recommend_content",
            description: "Return recommended content IDs",
            parameters: {
              type: "object",
              properties: { content_ids: { type: "array", items: { type: "string" } } },
              required: ["content_ids"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "recommend_content" } },
      }),
    });

    if (!aiResponse.ok) {
      const filtered = candidateContent
        .filter((c: any) => c.genres?.some((g: string) => topGenres.includes(g)))
        .slice(0, 10);
      return new Response(JSON.stringify({ recommendations: filtered, topGenres, preferredType }), {
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
      const text = aiData.choices?.[0]?.message?.content || "";
      recommendedIds = text.match(/[a-f0-9-]{36}/g) || [];
    }

    const recommendations = candidateContent.filter((c: any) => recommendedIds.includes(c.id));

    if (recommendations.length < 6) {
      const genreBased = candidateContent
        .filter((c: any) => !recommendedIds.includes(c.id) && c.genres?.some((g: string) => topGenres.includes(g)))
        .slice(0, 10 - recommendations.length);
      recommendations.push(...genreBased);
    }

    return new Response(JSON.stringify({
      recommendations: recommendations.slice(0, 10),
      topGenres,
      preferredType,
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
