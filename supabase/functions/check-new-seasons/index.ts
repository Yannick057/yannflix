import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import * as webpush from "jsr:@negrel/webpush";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TMDB_API_KEY = "7a3274f34ebaa7ba918d500f64524558";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

interface FollowedSeries {
  id: string;
  user_id: string;
  tmdb_id: number;
  series_name: string;
  last_notified_season: number | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Get all followed series
    const { data: followedSeries, error: followError } = await supabase
      .from("followed_series")
      .select("*");

    if (followError) {
      console.error("Error fetching followed series:", followError);
      return new Response(JSON.stringify({ error: "Failed to fetch followed series" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!followedSeries || followedSeries.length === 0) {
      return new Response(JSON.stringify({ message: "No followed series", checked: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Get unique tmdb_ids to check
    const uniqueTmdbIds = [...new Set(followedSeries.map((s: FollowedSeries) => s.tmdb_id))];
    const notifications: { userId: string; title: string; body: string; tmdbId: number }[] = [];

    // 3. Check each series for new seasons
    for (const tmdbId of uniqueTmdbIds) {
      try {
        const res = await fetch(
          `${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}&language=fr-FR`
        );
        if (!res.ok) continue;

        const tvData = await res.json();
        const currentSeasons = tvData.number_of_seasons || 0;
        const seriesName = tvData.name || "Série inconnue";

        const followers = followedSeries.filter(
          (s: FollowedSeries) => s.tmdb_id === tmdbId
        );

        for (const follower of followers) {
          const lastNotified = follower.last_notified_season || 0;

          if (currentSeasons > lastNotified) {
            notifications.push({
              userId: follower.user_id,
              title: `🎬 Nouvelle saison disponible !`,
              body: `${seriesName} - Saison ${currentSeasons} est maintenant disponible !`,
              tmdbId,
            });

            await supabase
              .from("followed_series")
              .update({ last_notified_season: currentSeasons })
              .eq("id", follower.id);
          }
        }
      } catch (err) {
        console.error(`Error checking tmdb_id ${tmdbId}:`, err);
      }
    }

    // 4. Send real push notifications
    let sentCount = 0;
    if (notifications.length > 0 && vapidPublicKey && vapidPrivateKey) {
      // Import VAPID keys for web push
      let appServer: webpush.ApplicationServer | null = null;
      try {
        const vapidKeys = {
          publicKey: vapidPublicKey,
          privateKey: vapidPrivateKey,
        };
        appServer = await webpush.ApplicationServer.new({
          contactInformation: "mailto:admin@streamflix.app",
          vapidKeys,
        });
      } catch (err) {
        console.error("Error initializing web push:", err);
      }

      if (appServer) {
        for (const notif of notifications) {
          const { data: subscriptions } = await supabase
            .from("push_subscriptions")
            .select("*")
            .eq("user_id", notif.userId);

          if (subscriptions && subscriptions.length > 0) {
            for (const sub of subscriptions) {
              try {
                const pushSubscription = {
                  endpoint: sub.endpoint,
                  keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                  },
                };

                const payload = JSON.stringify({
                  title: notif.title,
                  body: notif.body,
                  icon: "/favicon.ico",
                  data: { url: `/content/tv-${notif.tmdbId}` },
                });

                const subscriber = appServer.subscribe(pushSubscription);
                await subscriber.pushTextMessage(payload, {});
                sentCount++;
                console.log(`Push sent to user ${notif.userId}: ${notif.body}`);
              } catch (pushErr) {
                console.error(`Error sending push to ${sub.endpoint}:`, pushErr);
              }
            }
          }
        }
      }
    }

    console.log(
      `Checked ${uniqueTmdbIds.length} series, found ${notifications.length} new seasons, sent ${sentCount} notifications`
    );

    return new Response(
      JSON.stringify({
        success: true,
        checked: uniqueTmdbIds.length,
        newSeasons: notifications.length,
        notificationsSent: sentCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
