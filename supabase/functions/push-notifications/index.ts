// supabase/functions/push-notifications/index.ts

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface RequestBody {
  action: "getVapidKey" | "subscribe" | "unsubscribe" | "sendNotification";
  subscription?: PushSubscription;
  notification?: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
  };
  userId?: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");

    // Get auth header for user context
    const authHeader = req.headers.get("Authorization");
    
    // Create client with user's auth if available
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    const body: RequestBody = await req.json();

    switch (body.action) {
      case "getVapidKey": {
        if (!vapidPublicKey) {
          return new Response(
            JSON.stringify({ error: "VAPID public key not configured" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(JSON.stringify({ vapidPublicKey }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "subscribe": {
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: "Authorization required" }),
            {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Get user from auth token
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          return new Response(JSON.stringify({ error: "Invalid token" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const userId = user.id;
        const subscription = body.subscription;

        if (!subscription) {
          return new Response(
            JSON.stringify({ error: "Subscription data required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Upsert subscription
        const { error: upsertError } = await supabase
          .from("push_subscriptions")
          .upsert(
            {
              user_id: userId,
              endpoint: subscription.endpoint,
              p256dh: subscription.keys.p256dh,
              auth: subscription.keys.auth,
            },
            { onConflict: "endpoint" }
          );

        if (upsertError) {
          console.error("Error saving subscription:", upsertError);
          return new Response(
            JSON.stringify({ error: "Failed to save subscription" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "unsubscribe": {
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: "Authorization required" }),
            {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          return new Response(JSON.stringify({ error: "Invalid token" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const userId = user.id;

        // Delete all subscriptions for this user
        const { error: deleteError } = await supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", userId);

        if (deleteError) {
          console.error("Error deleting subscription:", deleteError);
          return new Response(
            JSON.stringify({ error: "Failed to delete subscription" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "sendNotification": {
        // This action would be called by a cron job to send notifications
        // For now, we just return success
        // In production, you'd use web-push library to send actual push notifications
        
        if (!vapidPrivateKey || !vapidPublicKey) {
          return new Response(
            JSON.stringify({ error: "VAPID keys not configured" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        const notification = body.notification;
        const targetUserId = body.userId;

        if (!notification) {
          return new Response(
            JSON.stringify({ error: "Notification data required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Get subscriptions to send to
        let query = supabase.from("push_subscriptions").select("*");
        if (targetUserId) {
          query = query.eq("user_id", targetUserId);
        }

        const { data: subscriptions, error: fetchError } = await query;

        if (fetchError) {
          console.error("Error fetching subscriptions:", fetchError);
          return new Response(
            JSON.stringify({ error: "Failed to fetch subscriptions" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // For now, just log the notifications that would be sent
        console.log(`Would send notification to ${subscriptions?.length || 0} subscribers:`, notification);

        return new Response(
          JSON.stringify({
            success: true,
            sentTo: subscriptions?.length || 0,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
