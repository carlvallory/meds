"use server";

import { createClient } from "@/lib/supabase/server";
import { adminMessaging } from "@/lib/firebase/server";

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

export async function sendPushToRole(role: 'captain' | 'admin' | 'mediator', title: string, body: string, data?: Record<string, string>) {
    // 1. Get Users with Role
    // Note: This requires filtering users by role. Since 'role' is in public users table:
    const supabase = await createClient();

    // Get IDs of users with this role
    const { data: users, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("role", role);

    if (userError || !users?.length) return { error: "No users found or error fetching users" };

    const userIds = users.map(u => u.id);

    // 2. Get Tokens for these Users
    const { data: tokensData, error: tokenError } = await supabase
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
