"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { adminMessaging } from "@/lib/firebase/server";
import { createClient } from "@/lib/supabase/server";

// Normal client for saving tokens (uses user auth)
export async function saveFcmToken(token: string, platform: 'web' | 'android' | 'ios' = 'web') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autorizado" };

    const { error } = await supabase.from("user_fcm_tokens").upsert({
        token,
        user_id: user.id,
        platform,
        last_updated: new Date().toISOString()
    });

    if (error) return { error: error.message };
    return { success: true };
}

export async function sendPushToRole(roles: ('captain' | 'admin' | 'mediator' | 'host')[], title: string, body: string, data?: Record<string, string>) {
    // 1. Initialize Admin Client (Bypass RLS)
    // We need this because a 'host' or 'mediator' user cannot usually see the tokens of 'admin' or 'captain'
    // due to RLS policies. The Service Role key allows us to read EVERYTHING.
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
        console.error("Missing Supabase Service Role Key or URL");
        return { error: "Configuration Error: Missing Service Role" };
    }

    const supabaseAdmin = createSupabaseClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    // 2. Get Users using Admin Client
    const { data: users, error: userError } = await supabaseAdmin
        .from("users")
        .select("id")
        .in("role", roles);

    if (userError || !users?.length) return { error: "No users found or error fetching users" };

    const userIds = users.map(u => u.id);

    // 3. Get Tokens using Admin Client
    const { data: tokensData, error: tokenError } = await supabaseAdmin
        .from("user_fcm_tokens")
        .select("token")
        .in("user_id", userIds);

    if (tokenError || !tokensData?.length) return { error: "No valid tokens found" };

    const tokens = tokensData.map(t => t.token);

    // 3. Send Multicast Message
    try {
        const message = {
            notification: { title, body },
            data: data || {},
            tokens: tokens,
        };

        const response = await adminMessaging.sendEachForMulticast(message);
        console.log("FCM Sent:", response.successCount, "messages");

        // Clean up invalid tokens if needed (response.responses[i].error)

        return { success: true, count: response.successCount };
    } catch (err: any) {
        console.error("FCM Error:", err);
        return { error: err.message };
    }
}
