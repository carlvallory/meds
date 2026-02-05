"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function triggerPanic() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autorizado" };

    // Get user zone for context
    const { data: userData } = await supabase
        .from("users")
        .select("assigned_zone_id")
        .eq("id", user.id)
        .single();

    const { error } = await supabase.from("panic_alerts").insert({
        user_id: user.id,
        zone_id: userData?.assigned_zone_id,
        created_at: new Date().toISOString(),
    });

    if (error) return { error: error.message };

    // Here we would trigger FCM (Firebase Cloud Messaging)
    // await sendPushNotificationToTopic("captains", "ALERTA: Mediador ha activado botón de pánico!");

    return { success: true };
}

export async function resolvePanic(alertId: string) {
    const supabase = await createClient();
    // Verify permission (admin/captain) logic here or via RLS

    const { error } = await supabase
        .from("panic_alerts")
        .update({ resolved_at: new Date().toISOString() })
        .eq("id", alertId);

    if (error) return { error: error.message };

    revalidatePath("/captain");
    return { success: true };
}
